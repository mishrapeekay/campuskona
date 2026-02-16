from django.db import models
from django.db.models import F
from apps.students.models import Student
from apps.staff.models import StaffMember
from django.utils import timezone
from apps.core.models import TenantManager, BaseModel
from django.core.exceptions import ValidationError
from django.conf import settings

class Category(BaseModel):
    objects = TenantManager()
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Author(BaseModel):
    objects = TenantManager()
    name = models.CharField(max_length=200)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Book(BaseModel):
    objects = TenantManager()
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('ISSUED', 'Issued'), # Used if single copy, but typically we track quantity
        ('LOST', 'Lost'),
        ('DAMAGED', 'Damaged'),
    ]

    title = models.CharField(max_length=255)
    isbn = models.CharField(max_length=50, unique=True, null=True, blank=True)
    author = models.ForeignKey(Author, on_delete=models.SET_NULL, null=True, related_name='books')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')
    publication_year = models.IntegerField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=50, blank=True, help_text="Shelf/Row Number")

    def __str__(self):
        return self.title

    def issue_copy(self):
        """
        Atomically decrease available copies by 1.
        Returns True if successful, False if no copies available.
        """
        # Use atomic update to prevent race conditions
        updated = Book.objects.filter(
            id=self.id,
            available_copies__gt=0
        ).update(
            available_copies=F('available_copies') - 1
        )

        if updated:
            # Refresh the instance to get updated values
            self.refresh_from_db()
            return True
        return False

    def return_copy(self):
        """
        Atomically increase available copies by 1.
        Returns True if successful, False if already at max quantity.
        """
        # Use atomic update to prevent race conditions
        updated = Book.objects.filter(
            id=self.id,
            available_copies__lt=F('quantity')
        ).update(
            available_copies=F('available_copies') + 1
        )

        if updated:
            # Refresh the instance to get updated values
            self.refresh_from_db()
            return True
        return False

class BookIssueQuerySet(models.QuerySet):
    def currently_overdue(self):
        """Return issues that are currently overdue."""
        return self.filter(
            status__in=['ISSUED', 'OVERDUE'],
            due_date__lt=timezone.now().date()
        )

    def update_overdue_status(self):
        """Mark all overdue books as OVERDUE."""
        return self.currently_overdue().update(status='OVERDUE')

class BookIssueManager(TenantManager):
    def get_queryset(self):
        return BookIssueQuerySet(self.model, using=self._db)

    def currently_overdue(self):
        return self.get_queryset().currently_overdue()

class BookIssue(BaseModel):
    objects = BookIssueManager()
    STATUS_CHOICES = [
        ('ISSUED', 'Issued'),
        ('RETURNED', 'Returned'),
        ('OVERDUE', 'Overdue'),
        ('LOST', 'Lost'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='issues')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='book_issues')
    staff = models.ForeignKey(StaffMember, on_delete=models.CASCADE, null=True, blank=True, related_name='book_issues')

    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ISSUED')
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remarks = models.TextField(blank=True)

    # Audit fields handled by BaseModel
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books_issued',
        help_text="User who issued this book"
    )
    returned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books_returned',
        help_text="User who processed the return"
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['book', 'status']),
            models.Index(fields=['student', 'status']),
            models.Index(fields=['staff', 'status']),
        ]

    def __str__(self):
        borrower = self.student if self.student else self.staff
        return f"{self.book.title} - {borrower}"

    def clean(self):
        """Validate model instance"""
        super().clean()

        # Ensure either student or staff is set, but not both
        if not self.student and not self.staff:
            raise ValidationError('Either student or staff must be specified')

        if self.student and self.staff:
            raise ValidationError('Cannot set both student and staff')

        # Validate dates
        if self.return_date and self.return_date < self.issue_date:
            raise ValidationError('Return date cannot be before issue date')

        if self.due_date < self.issue_date:
            raise ValidationError('Due date cannot be before issue date')

    def save(self, *args, **kwargs):
        # Auto-update status if overdue
        if not self.return_date and self.due_date < timezone.now().date():
            if self.status == 'ISSUED':
                self.status = 'OVERDUE'
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if this issue is currently overdue."""
        if self.status == 'RETURNED':
            return False
        return self.due_date < timezone.now().date()

    @property
    def days_overdue(self):
        """Calculate number of days overdue."""
        if not self.is_overdue:
            return 0
        return (timezone.now().date() - self.due_date).days

    @property
    def borrower_name(self):
        """Get borrower's full name."""
        if self.student:
            return f"{self.student.first_name} {self.student.last_name}"
        elif self.staff:
            return f"{self.staff.first_name} {self.staff.last_name}"
        return "Unknown"

    @property
    def borrower_type(self):
        """Get borrower type."""
        if self.student:
            return "Student"
        elif self.staff:
            return "Staff"
        return "Unknown"
