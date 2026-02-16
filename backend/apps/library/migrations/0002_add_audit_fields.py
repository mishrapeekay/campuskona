# Generated manually to add audit and timestamp fields
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('library', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookissue',
            name='issued_by',
            field=models.ForeignKey(
                blank=True,
                help_text='User who issued this book',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='books_issued',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name='bookissue',
            name='returned_by',
            field=models.ForeignKey(
                blank=True,
                help_text='User who processed the return',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='books_returned',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name='bookissue',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='bookissue',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True, blank=True),
        ),
        migrations.AddIndex(
            model_name='bookissue',
            index=models.Index(fields=['status', 'due_date'], name='library_boo_status_idx'),
        ),
        migrations.AddIndex(
            model_name='bookissue',
            index=models.Index(fields=['book', 'status'], name='library_boo_book_st_idx'),
        ),
        migrations.AddIndex(
            model_name='bookissue',
            index=models.Index(fields=['student', 'status'], name='library_boo_student_idx'),
        ),
        migrations.AddIndex(
            model_name='bookissue',
            index=models.Index(fields=['staff', 'status'], name='library_boo_staff_s_idx'),
        ),
        migrations.AlterModelOptions(
            name='bookissue',
            options={'ordering': ['-created_at']},
        ),
    ]
