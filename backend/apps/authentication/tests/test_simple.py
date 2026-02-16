"""
Simple test to verify Django configuration
"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_django_configured():
    """Test Django is properly configured."""
    assert User is not None
    assert User._meta.db_table == 'users'


@pytest.mark.django_db
def test_can_create_user_directly():
    """Test we can create a user directly using Django ORM."""
    from django.db import connection

    # Check if table exists
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='users';
        """)
        result = cursor.fetchone()
        print(f"Table exists check: {result}")

        # List all tables
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table';
        """)
        tables = cursor.fetchall()
        print(f"All tables: {tables}")

    # Try creating a user
    user = User(
        email='test@example.com',
        first_name='Test',
        last_name='User',
        phone='1234567890',
        user_type='TEACHER'
    )
    user.set_password('testpass')
    user.save()

    assert user.pk is not None
