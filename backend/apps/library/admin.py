from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Author, Book, BookIssue


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'book_count', 'description')
    search_fields = ('name',)

    def book_count(self, obj):
        return obj.books.count()
    book_count.short_description = 'Books'


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'book_count')
    search_fields = ('name',)

    def book_count(self, obj):
        return obj.books.count()
    book_count.short_description = 'Books'


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'isbn', 'quantity', 'available_copies', 'location')
    list_filter = ('category', 'author')
    search_fields = ('title', 'isbn', 'author__name')
    readonly_fields = ('available_copies',)

    fieldsets = (
        ('Book Details', {
            'fields': ('title', 'isbn', 'author', 'category', 'publication_year')
        }),
        ('Inventory', {
            'fields': ('quantity', 'available_copies', 'location')
        }),
    )


@admin.register(BookIssue)
class BookIssueAdmin(admin.ModelAdmin):
    list_display = (
        'book', 'borrower_name', 'borrower_type', 'issue_date',
        'due_date', 'return_date', 'status', 'fine_amount', 'days_overdue_display'
    )
    list_filter = ('status', 'issue_date', 'due_date')
    search_fields = ('book__title', 'student__first_name', 'student__last_name', 'staff__first_name')
    date_hierarchy = 'issue_date'
    readonly_fields = ('issued_by', 'returned_by', 'created_at', 'updated_at')

    fieldsets = (
        ('Book & Borrower', {
            'fields': ('book', 'student', 'staff')
        }),
        ('Issue Details', {
            'fields': ('issue_date', 'due_date', 'return_date', 'status')
        }),
        ('Fine & Remarks', {
            'fields': ('fine_amount', 'remarks')
        }),
        ('Audit', {
            'fields': ('issued_by', 'returned_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def days_overdue_display(self, obj):
        days = obj.days_overdue
        if days > 0:
            return format_html('<span style="color:red;">{} days</span>', days)
        return '-'
    days_overdue_display.short_description = 'Overdue'
