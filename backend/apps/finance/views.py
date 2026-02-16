"""
Views and ViewSets for Finance Management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q
from django.utils import timezone
from decimal import Decimal
from django.db import transaction
from django.http import HttpResponse

from .utils import generate_payment_receipt
from .services import RazorpayService
from apps.authentication.permissions import IsAccountant


from .models import (
    FeeCategory,
    FeeStructure,
    StudentFee,
    Payment,
    PaymentAllocation,
    Expense,
    Invoice,
    InvoiceItem
)
from .serializers import (
    FeeCategorySerializer,
    FeeStructureSerializer,
    StudentFeeSerializer,
    PaymentSerializer,
    PaymentAllocationSerializer,
    PaymentWithAllocationsSerializer,
    ExpenseSerializer,
    InvoiceSerializer,
    FeeCollectionSerializer,
    FinancialSummarySerializer,
    RazorpayOrderSerializer,
    RazorpayVerificationSerializer
)



class FeeCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fee categories"""
    queryset = FeeCategory.objects.all()
    serializer_class = FeeCategorySerializer
    permission_classes = [IsAccountant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_mandatory', 'is_active']
    search_fields = ['name', 'code']
    ordering_fields = ['name']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active fee categories"""
        categories = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class FeeStructureViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fee structures"""
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAccountant]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'class_obj', 'fee_category', 'is_active']
    ordering_fields = ['amount']
    ordering = ['academic_year', 'class_obj']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'academic_year',
            'class_obj',
            'fee_category'
        )


class StudentFeeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing student fees"""
    queryset = StudentFee.objects.all()
    serializer_class = StudentFeeSerializer
    permission_classes = [IsAccountant]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'status', 'academic_year']
    ordering_fields = ['due_date', 'amount']
    ordering = ['-due_date']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'student',
            'fee_structure__fee_category',
            'academic_year'
        )

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get all fees for a specific student"""
        student_id = request.query_params.get('student_id')
        
        if not student_id:
            return Response(
                {'error': 'student_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fees = self.queryset.filter(student_id=student_id)
        serializer = self.get_serializer(fees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending fees"""
        fees = self.queryset.filter(status__in=['PENDING', 'PARTIAL', 'OVERDUE'])
        serializer = self.get_serializer(fees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_fees(self, request):
        """Get fees for the logged-in student or parent's children"""
        user = request.user
        student = None
        
        if user.user_type == 'STUDENT':
            # Try standard reverse relation
            student = getattr(user, 'student_profile', None)
            
            # Fallback: Direct lookup if reverse relation fails (common in multi-tenant shared-user setups)
            if not student:
                 try:
                     from apps.students.models import Student
                     student = Student.objects.get(user_id=user.id)
                 except (ImportError, Student.DoesNotExist):
                     return Response({'error': 'Student profile not found'}, status=404)
            
            fees = self.queryset.filter(student=student)
        elif user.user_type == 'PARENT':
            # Assuming parent is linked to students via StudentParent model
            # students = user.parent_profile.students.all() # Adjust based on actual relation
            # Actually, let's check how parent-student relation is modeled. 
            # In create_portal_users.py we saw StudentParent model.
            # We need to import StudentParent or use related_name.
            # Let's stick to STUDENT first for safety, or inspect StudentParent model.
            from apps.students.models import StudentParent
            student_ids = StudentParent.objects.filter(parent=user).values_list('student_id', flat=True)
            fees = self.queryset.filter(student_id__in=student_ids)
        else:
            return Response({'error': 'Not authorized'}, status=403)
            
        serializer = self.get_serializer(fees, many=True)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payments"""
    queryset = Payment.objects.all()
    permission_classes = [IsAccountant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'status', 'payment_method']
    search_fields = ['receipt_number', 'transaction_id']
    ordering_fields = ['payment_date', 'amount']
    ordering = ['-payment_date']

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'retrieve':
            return PaymentWithAllocationsSerializer
        return PaymentSerializer

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'student',
            'received_by'
        )

    def perform_create(self, serializer):
        """Set received_by to current user"""
        serializer.save(received_by=self.request.user)

    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get payments for the logged-in student or parent's children"""
        user = request.user
        
        if user.user_type == 'STUDENT':
            from apps.students.models import Student
            try:
                student = Student.objects.get(user_id=user.id)
                payments = self.queryset.filter(student=student)
            except Student.DoesNotExist:
                return Response({'error': 'Student profile not found'}, status=404)
        elif user.user_type == 'PARENT':
            from apps.students.models import StudentParent
            student_ids = StudentParent.objects.filter(parent=user).values_list('student_id', flat=True)
            payments = self.queryset.filter(student_id__in=student_ids)
        else:
            return Response({'error': 'Not authorized'}, status=403)
            
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def collect_fee(self, request):
        """
        Collect fee payment with allocations
        
        Expected payload:
        {
            "student_id": 1,
            "amount": 5000,
            "payment_method": "CASH",
            "transaction_id": "",
            "remarks": "",
            "fee_allocations": [
                {"student_fee_id": 1, "amount": 3000},
                {"student_fee_id": 2, "amount": 2000}
            ]
        }
        """
        serializer = FeeCollectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Generate receipt number
        last_payment = Payment.objects.order_by('-id').first()
        receipt_number = f"RCP{(last_payment.id + 1) if last_payment else 1:06d}"
        
        # Create payment
        payment = Payment.objects.create(
            student_id=data['student_id'],
            receipt_number=receipt_number,
            amount=data['amount'],
            payment_method=data['payment_method'],
            transaction_id=data.get('transaction_id', ''),
            remarks=data.get('remarks', ''),
            received_by=request.user
        )
        
        # Create allocations
        for allocation in data['fee_allocations']:
            PaymentAllocation.objects.create(
                payment=payment,
                student_fee_id=allocation['student_fee_id'],
                allocated_amount=allocation['amount']
            )
        
        return Response({
            'message': 'Payment collected successfully',
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download_receipt(self, request, pk=None):
        """Download payment receipt as PDF"""
        payment = self.get_object()
        buffer = generate_payment_receipt(payment)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{payment.receipt_number}.pdf"'
        return response


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing expenses"""
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAccountant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'vendor_name', 'invoice_number']
    ordering_fields = ['expense_date', 'amount']
    ordering = ['-expense_date']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'approved_by',
            'created_by'
        )

    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve expense"""
        expense = self.get_object()
        
        if expense.status != 'PENDING':
            return Response(
                {'error': 'Only pending expenses can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense.status = 'APPROVED'
        expense.approved_by = request.user
        expense.approved_at = timezone.now()
        expense.save()
        
        return Response({
            'message': 'Expense approved',
            'expense': ExpenseSerializer(expense).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject expense"""
        expense = self.get_object()
        
        if expense.status != 'PENDING':
            return Response(
                {'error': 'Only pending expenses can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense.status = 'REJECTED'
        expense.save()
        
        return Response({
            'message': 'Expense rejected',
            'expense': ExpenseSerializer(expense).data
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get expense summary"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.queryset
        
        if start_date and end_date:
            queryset = queryset.filter(
                expense_date__gte=start_date,
                expense_date__lte=end_date
            )
        
        summary = queryset.aggregate(
            total=Sum('amount'),
            pending=Sum('amount', filter=Q(status='PENDING')),
            approved=Sum('amount', filter=Q(status='APPROVED')),
            paid=Sum('amount', filter=Q(status='PAID'))
        )
        
        return Response(summary)


class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoices"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAccountant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'status']
    search_fields = ['invoice_number']
    ordering_fields = ['invoice_date', 'due_date']
    ordering = ['-invoice_date']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'student',
            'generated_by'
        ).prefetch_related('items')

    def perform_create(self, serializer):
        """Set generated_by to current user"""
        serializer.save(generated_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate invoice for a student
        
        Expected payload:
        {
            "student_id": 1,
            "due_date": "2024-01-31",
            "fee_ids": [1, 2, 3]
        }
        """
        student_id = request.data.get('student_id')
        due_date = request.data.get('due_date')
        fee_ids = request.data.get('fee_ids', [])
        
        if not all([student_id, due_date, fee_ids]):
            return Response(
                {'error': 'student_id, due_date, and fee_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get fees
        fees = StudentFee.objects.filter(id__in=fee_ids, student_id=student_id)
        total_amount = sum(fee.final_amount for fee in fees)
        
        # Generate invoice number
        last_invoice = Invoice.objects.order_by('-id').first()
        invoice_number = f"INV{(last_invoice.id + 1) if last_invoice else 1:06d}"
        
        # Create invoice
        invoice = Invoice.objects.create(
            student_id=student_id,
            invoice_number=invoice_number,
            due_date=due_date,
            total_amount=total_amount,
            generated_by=request.user
        )
        
        # Create invoice items
        for fee in fees:
            InvoiceItem.objects.create(
                invoice=invoice,
                student_fee=fee,
                description=fee.fee_structure.fee_category.name,
                amount=fee.final_amount
            )
        
        return Response({
            'message': 'Invoice generated successfully',
            'invoice': InvoiceSerializer(invoice).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def financial_summary(self, request):
        """Get financial summary"""
        academic_year_id = request.query_params.get('academic_year_id')
        
        filters = {}
        if academic_year_id:
            filters['academic_year_id'] = academic_year_id
        
        # Get fee statistics
        fee_stats = StudentFee.objects.filter(**filters).aggregate(
            total_fees=Sum('final_amount'),
            total_collected=Sum('paid_amount')
        )
        
        total_fees = fee_stats['total_fees'] or Decimal('0')
        total_collected = fee_stats['total_collected'] or Decimal('0')
        total_pending = total_fees - total_collected
        
        # Get expense statistics
        expense_stats = Expense.objects.filter(status='PAID').aggregate(
            total_expenses=Sum('amount')
        )
        
        total_expenses = expense_stats['total_expenses'] or Decimal('0')
        net_balance = total_collected - total_expenses
        
        summary = {
            'total_fees': total_fees,
            'total_collected': total_collected,
            'total_pending': total_pending,
            'total_expenses': total_expenses,
            'net_balance': net_balance
        }
        
        serializer = FinancialSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_razorpay_order(self, request):
        """Create a Razorpay order for online fee payment"""
        serializer = RazorpayOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        service = RazorpayService()
        
        try:
            # Get student for naming the order receipt
            # Assuming current user is parent/student or we get student from fee
            fee = StudentFee.objects.filter(id__in=data['student_fee_ids']).first()
            if not fee:
                return Response({'error': 'Invalid fee IDs'}, status=status.HTTP_400_BAD_REQUEST)
                
            student = fee.student
            receipt = f"FEE_{student.admission_number}_{timezone.now().timestamp()}"
            
            order = service.create_order(
                amount=data['amount'],
                receipt=receipt[:40], # Razorpay limited to 40 chars
                notes={
                    'student_id': str(student.id),
                    'fee_ids': ','.join(map(str, data['student_fee_ids'])),
                    'type': 'student_fee'
                }
            )
            return Response(order)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def verify_razorpay_payment(self, request):
        """Verify Razorpay payment and record it in the system"""
        serializer = RazorpayVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        service = RazorpayService()
        
        if service.verify_payment(
            data['razorpay_order_id'],
            data['razorpay_payment_id'],
            data['razorpay_signature']
        ):
            try:
                with transaction.atomic():
                    # Check if payment already recorded (idempotency)
                    if Payment.objects.filter(transaction_id=data['razorpay_payment_id']).exists():
                        return Response({'message': 'Payment already recorded'})
                        
                    # Get student from fees
                    fees = StudentFee.objects.filter(id__in=data['student_fee_ids'])
                    if not fees.exists():
                        return Response({'error': 'Fees not found'}, status=404)
                    
                    student = fees.first().student
                    
                    # Generate receipt number
                    last_payment = Payment.objects.order_by('-id').first()
                    receipt_number = f"RCP{(last_payment.id + 1) if last_payment else 1:06d}"
                    
                    # Create payment
                    payment = Payment.objects.create(
                        student=student,
                        receipt_number=receipt_number,
                        amount=data['amount'],
                        payment_method='ONLINE',
                        transaction_id=data['razorpay_payment_id'],
                        status='COMPLETED',
                        remarks=f"Razorpay Order: {data['razorpay_order_id']}",
                        received_by=request.user if request.user.is_authenticated else None
                    )
                    
                    # Simple allocation logic: distribute amount across fees
                    remaining_amount = data['amount']
                    for fee in fees:
                        if remaining_amount <= 0:
                            break
                        
                        alloc_amount = min(fee.balance_amount, remaining_amount)
                        if alloc_amount > 0:
                            PaymentAllocation.objects.create(
                                payment=payment,
                                student_fee=fee,
                                allocated_amount=alloc_amount
                            )
                            remaining_amount -= alloc_amount
                    
                    return Response({
                        'message': 'Payment verified and recorded successfully',
                        'payment_id': payment.id,
                        'receipt_number': payment.receipt_number
                    })
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

