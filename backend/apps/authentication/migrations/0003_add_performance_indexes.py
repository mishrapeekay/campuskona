# Generated migration for performance optimizations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        # Add indexes to User model
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['user_type'], name='auth_user_type_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['is_active'], name='auth_user_active_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['email', 'is_active'], name='auth_user_email_active_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['created_at'], name='auth_user_created_idx'),
        ),

        # Add indexes to LoginHistory model
        migrations.AddIndex(
            model_name='loginhistory',
            index=models.Index(fields=['user', '-login_at'], name='auth_login_user_time_idx'),
        ),
        migrations.AddIndex(
            model_name='loginhistory',
            index=models.Index(fields=['ip_address'], name='auth_login_ip_idx'),
        ),
        migrations.AddIndex(
            model_name='loginhistory',
            index=models.Index(fields=['login_at'], name='auth_login_time_idx'),
        ),

        # Add indexes to Role model
        migrations.AddIndex(
            model_name='role',
            index=models.Index(fields=['code'], name='auth_role_code_idx'),
        ),
        migrations.AddIndex(
            model_name='role',
            index=models.Index(fields=['is_active'], name='auth_role_active_idx'),
        ),

        # Add indexes to Permission model
        migrations.AddIndex(
            model_name='permission',
            index=models.Index(fields=['module'], name='auth_perm_module_idx'),
        ),
        migrations.AddIndex(
            model_name='permission',
            index=models.Index(fields=['action'], name='auth_perm_action_idx'),
        ),
        migrations.AddIndex(
            model_name='permission',
            index=models.Index(fields=['is_active'], name='auth_perm_active_idx'),
        ),

        # Add indexes to UserRole model
        migrations.AddIndex(
            model_name='userrole',
            index=models.Index(fields=['user', 'role'], name='auth_user_role_idx'),
        ),
        migrations.AddIndex(
            model_name='userrole',
            index=models.Index(fields=['is_active'], name='auth_user_role_active_idx'),
        ),
        migrations.AddIndex(
            model_name='userrole',
            index=models.Index(fields=['expires_at'], name='auth_user_role_expires_idx'),
        ),

        # Add indexes to PasswordResetToken model
        migrations.AddIndex(
            model_name='passwordresettoken',
            index=models.Index(fields=['token'], name='auth_reset_token_idx'),
        ),
        migrations.AddIndex(
            model_name='passwordresettoken',
            index=models.Index(fields=['used'], name='auth_reset_used_idx'),
        ),
        migrations.AddIndex(
            model_name='passwordresettoken',
            index=models.Index(fields=['expires_at'], name='auth_reset_expires_idx'),
        ),
    ]
