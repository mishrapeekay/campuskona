from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from datetime import timedelta
from .models import Book, Author, Category, BookIssue
from .serializers import (
    BookSerializer, AuthorSerializer, CategorySerializer, BookIssueSerializer
)
from apps.core.permissions import IsAdminOrReadOnly

class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author__name', 'category__name', 'isbn']

    def get_queryset(self):
        return Book.objects.all()

    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        student_id = request.data.get('student')
        staff_id = request.data.get('staff')

        if not student_id and not staff_id:
            return Response({
                'error': 'Either Student ID or Staff ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Lock the book record for update
                book = Book.objects.select_for_update().get(pk=pk)

                # Check if copies available
                if book.available_copies < 1:
                    return Response({
                        'error': 'No copies available'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Get borrower
                borrower = None
                borrower_type = None

                if student_id:
                    from apps.students.models import Student
                    try:
                        borrower = Student.objects.get(id=student_id)
                        borrower_type = 'student'
                    except Student.DoesNotExist:
                        return Response({
                            'error': 'Student not found'
                        }, status=status.HTTP_404_NOT_FOUND)

                if staff_id:
                    from apps.staff.models import StaffMember
                    try:
                        borrower = StaffMember.objects.get(id=staff_id)
                        borrower_type = 'staff'
                    except StaffMember.DoesNotExist:
                        return Response({
                            'error': 'Staff member not found'
                        }, status=status.HTTP_404_NOT_FOUND)

                # Check if borrower already has this book
                existing_issue = BookIssue.objects.filter(
                    book=book,
                    status__in=['ISSUED', 'OVERDUE']
                )
                if borrower_type == 'student':
                    existing_issue = existing_issue.filter(student=borrower)
                else:
                    existing_issue = existing_issue.filter(staff=borrower)

                if existing_issue.exists():
                    return Response({
                        'error': 'This borrower already has this book issued'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Check borrowing limit
                MAX_BOOKS_LIMIT = getattr(settings, 'LIBRARY_MAX_BOOKS_PER_USER', 5)
                current_issues = BookIssue.objects.filter(status__in=['ISSUED', 'OVERDUE'])
                if borrower_type == 'student':
                    current_issues = current_issues.filter(student=borrower)
                else:
                    current_issues = current_issues.filter(staff=borrower)

                if current_issues.count() >= MAX_BOOKS_LIMIT:
                    return Response({
                        'error': f'Borrowing limit exceeded. Maximum {MAX_BOOKS_LIMIT} books allowed.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Default issue period from settings
                DEFAULT_ISSUE_DAYS = getattr(settings, 'LIBRARY_DEFAULT_ISSUE_DAYS', 14)
                due_date = timezone.now().date() + timedelta(days=DEFAULT_ISSUE_DAYS)

                # Create Issue Record
                issue_data = {
                    'book': book,
                    'due_date': due_date,
                    'status': 'ISSUED',
                }

                # Only set issued_by if user is authenticated
                if request.user and request.user.is_authenticated:
                    issue_data['issued_by'] = request.user

                if borrower_type == 'student':
                    issue_data['student'] = borrower
                else:
                    issue_data['staff'] = borrower

                issue_record = BookIssue.objects.create(**issue_data)

                # Decrement available copies (atomic operation within transaction)
                if not book.issue_copy():
                    raise ValueError("Failed to issue book copy")

                serializer = BookIssueSerializer(issue_record)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BookIssueViewSet(viewsets.ModelViewSet):
    serializer_class = BookIssueSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
         user = self.request.user
         queryset = BookIssue.objects.all()
         if hasattr(user, 'student_profile'):
             return queryset.filter(student=user.student_profile)
         elif user.user_type == 'STUDENT':
             # Fallback
             try:
                 from apps.students.models import Student
                 s = Student.objects.get(user_id=user.id)
                 return queryset.filter(student=s)
             except (ImportError, Student.DoesNotExist):
                 pass

         if hasattr(user, 'staff_profile'):
             return queryset.filter(staff=user.staff_profile)
         elif user.user_type in ['TEACHER', 'STAFF', 'PRINCIPAL']:
              # Fallback for staff
             try:
                 from apps.staff.models import StaffMember
                 s = StaffMember.objects.get(user_id=user.id)
                 return queryset.filter(staff=s)
             except (ImportError, StaffMember.DoesNotExist):
                 pass

         return queryset
    
    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        issue = self.get_object()

        # Validate return eligibility
        if issue.status == 'RETURNED':
            return Response({
                'error': 'This book has already been returned'
            }, status=status.HTTP_400_BAD_REQUEST)

        if issue.status == 'LOST':
            return Response({
                'error': 'This book is marked as LOST. Please contact library admin.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Get current date
                return_date = timezone.now().date()

                # Calculate fine if overdue
                fine_amount = 0
                if return_date > issue.due_date:
                    overdue_days = (return_date - issue.due_date).days
                    # Get fine rate from settings
                    FINE_PER_DAY = getattr(settings, 'LIBRARY_FINE_PER_DAY', 10)
                    fine_amount = overdue_days * FINE_PER_DAY

                # Update issue record
                issue.return_date = return_date
                issue.status = 'RETURNED'
                issue.fine_amount = fine_amount
                # Only set returned_by if user is authenticated
                if request.user and request.user.is_authenticated:
                    issue.returned_by = request.user
                issue.save()

                # Return book copy atomically
                if not issue.book.return_copy():
                    raise ValueError(
                        "Failed to return book copy. Available copies may exceed total quantity."
                    )

                serializer = self.get_serializer(issue)
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': 'Book returned successfully',
                    'fine_amount': float(fine_amount)
                })

        except Exception as e:
            return Response({
                'error': f'Failed to return book: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Get dashboard statistics for Library
        """
        from django.db.models import Sum

        total_books = Book.objects.count()
        issued_books = BookIssue.objects.filter(status__in=['ISSUED', 'OVERDUE']).count()

        # Get currently overdue books (dynamic check)
        overdue_books = BookIssue.objects.currently_overdue().count()

        # Calculate total fine collected
        total_fines = BookIssue.objects.aggregate(
            Sum('fine_amount')
        )['fine_amount__sum'] or 0

        return Response({
            'total_books': total_books,
            'issued_books': issued_books,
            'overdue_books': overdue_books,
            'total_fines': float(total_fines)
        })

class AuthorViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        return Author.objects.all()

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        return Category.objects.all()
