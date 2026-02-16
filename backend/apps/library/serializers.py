from rest_framework import serializers
from .models import Book, Author, Category, BookIssue
from apps.students.serializers import StudentListSerializer
from apps.staff.serializers import StaffMemberListSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = '__all__'

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_author_name(self, obj):
        return obj.author.name if obj.author else None

class BookDetailSerializer(serializers.ModelSerializer):
    """Minimal book details for nested serialization in BookIssue"""
    author_name = serializers.CharField(source='author.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'isbn', 'author_name', 'category_name',
                  'available_copies', 'quantity']

class BookIssueSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_details = BookDetailSerializer(source='book', read_only=True)
    student_details = StudentListSerializer(source='student', read_only=True)
    staff_details = StaffMemberListSerializer(source='staff', read_only=True)

    # Add computed fields
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    borrower_name = serializers.CharField(read_only=True)
    borrower_type = serializers.CharField(read_only=True)

    class Meta:
        model = BookIssue
        fields = '__all__'
