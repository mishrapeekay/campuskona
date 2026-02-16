# Generated migration for performance optimizations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
    ]

    operations = [
        # Add indexes to Student model
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['admission_number'], name='student_admission_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['email'], name='student_email_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['admission_status'], name='student_status_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['admission_date'], name='student_adm_date_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['is_deleted'], name='student_deleted_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['user'], name='student_user_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['gender'], name='student_gender_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['category'], name='student_category_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['created_at'], name='student_created_idx'),
        ),

        # Composite indexes for common filter combinations
        migrations.AddIndex(
            model_name='student',
            index=models.Index(
                fields=['admission_status', 'is_deleted'],
                name='student_status_deleted_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(
                fields=['is_deleted', 'created_at'],
                name='student_deleted_created_idx'
            ),
        ),

        # Add indexes to StudentDocument model
        migrations.AddIndex(
            model_name='studentdocument',
            index=models.Index(fields=['student'], name='doc_student_idx'),
        ),
        migrations.AddIndex(
            model_name='studentdocument',
            index=models.Index(fields=['document_type'], name='doc_type_idx'),
        ),


        # Add indexes to StudentParent model
        migrations.AddIndex(
            model_name='studentparent',
            index=models.Index(fields=['student'], name='parent_student_idx'),
        ),
        migrations.AddIndex(
            model_name='studentparent',
            index=models.Index(fields=['parent'], name='parent_user_idx'),
        ),
        migrations.AddIndex(
            model_name='studentparent',
            index=models.Index(fields=['relation'], name='parent_relation_idx'),
        ),

        # Add indexes to StudentHealthRecord model
        migrations.AddIndex(
            model_name='studenthealthrecord',
            index=models.Index(fields=['student'], name='health_student_idx'),
        ),
        migrations.AddIndex(
            model_name='studenthealthrecord',
            index=models.Index(fields=['checkup_date'], name='health_date_idx'),
        ),

        # Add indexes to StudentNote model
        migrations.AddIndex(
            model_name='studentnote',
            index=models.Index(fields=['student'], name='note_student_idx'),
        ),
        migrations.AddIndex(
            model_name='studentnote',
            index=models.Index(fields=['created_by'], name='note_created_by_idx'),
        ),
        migrations.AddIndex(
            model_name='studentnote',
            index=models.Index(fields=['created_at'], name='note_created_idx'),
        ),
    ]
