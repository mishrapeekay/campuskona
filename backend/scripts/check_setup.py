#!/usr/bin/env python
"""
Pre-flight Setup Check Script
Verifies all prerequisites before starting servers
"""

import sys
import subprocess
import os
from pathlib import Path


class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(message):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")


def print_success(message):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")


def print_error(message):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")


def print_warning(message):
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")


def print_info(message):
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")


def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        print_success(f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_error(f"Python {version.major}.{version.minor}.{version.micro} (Need 3.10+)")
        return False


def check_virtual_env():
    """Check if virtual environment exists"""
    venv_path = Path('venv')
    if venv_path.exists() and venv_path.is_dir():
        print_success("Virtual environment exists")
        return True
    else:
        print_error("Virtual environment not found")
        print_info("Create it with: python -m venv venv")
        return False


def check_env_file():
    """Check if .env file exists"""
    env_path = Path('.env')
    if env_path.exists():
        print_success(".env file exists")

        # Check critical settings
        with open('.env', 'r') as f:
            content = f.read()

            checks = {
                'SECRET_KEY': 'SECRET_KEY=' in content,
                'DB_NAME': 'DB_NAME=' in content,
                'DB_USER': 'DB_USER=' in content,
                'DB_PASSWORD': 'DB_PASSWORD=' in content,
            }

            all_good = True
            for key, exists in checks.items():
                if exists:
                    print_success(f"  {key} configured")
                else:
                    print_warning(f"  {key} missing")
                    all_good = False

            return all_good
    else:
        print_warning(".env file not found (will use defaults)")
        return False


def check_database():
    """Check database connection"""
    try:
        import psycopg2
        from decouple import config

        conn = psycopg2.connect(
            dbname=config('DB_NAME', default='school_management'),
            user=config('DB_USER', default='postgres'),
            password=config('DB_PASSWORD', default=''),
            host=config('DB_HOST', default='localhost'),
            port=config('DB_PORT', default='5432')
        )
        conn.close()
        print_success("PostgreSQL connection successful")
        return True
    except ImportError:
        print_error("psycopg2 not installed")
        print_info("Install it with: pip install psycopg2-binary")
        return False
    except Exception as e:
        print_error(f"Database connection failed: {str(e)}")
        print_info("Ensure PostgreSQL is running on localhost:5432")
        return False


def check_redis():
    """Check Redis connection"""
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print_success("Redis connection successful")
        return True
    except ImportError:
        print_warning("redis package not installed (optional)")
        return False
    except Exception as e:
        print_warning(f"Redis not available: {str(e)}")
        print_info("Redis is optional but recommended for caching")
        return False


def check_django_installed():
    """Check if Django is installed"""
    try:
        import django
        print_success(f"Django {django.get_version()} installed")
        return True
    except ImportError:
        print_error("Django not installed")
        print_info("Install dependencies with: pip install -r requirements.txt")
        return False


def check_migrations():
    """Check if migrations have been run"""
    try:
        # This requires Django setup, so we'll just check if migration files exist
        migrations_dir = Path('apps/privacy/migrations')
        if migrations_dir.exists():
            migration_files = list(migrations_dir.glob('*.py'))
            if len(migration_files) > 1:  # More than just __init__.py
                print_success(f"{len(migration_files) - 1} migration files found")
                return True
        print_warning("No migrations found")
        return False
    except Exception as e:
        print_warning(f"Could not check migrations: {str(e)}")
        return False


def main():
    print_header("School Management System - Setup Check")

    results = {
        'Python Version': check_python_version(),
        'Virtual Environment': check_virtual_env(),
        'Environment File': check_env_file(),
        'Django Installed': check_django_installed(),
        'PostgreSQL': check_database(),
        'Redis': check_redis(),
        'Migrations': check_migrations(),
    }

    print_header("Summary")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for check, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        color = Colors.OKGREEN if result else Colors.FAIL
        print(f"  {color}{status:10}{Colors.ENDC} {check}")

    print(f"\n{passed}/{total} checks passed")

    if passed == total:
        print_success("\n🎉 All checks passed! You're ready to start the server.")
        print_info("\nStart the server with: python manage.py runserver")
    else:
        print_warning("\n⚠️ Some checks failed. Please address the issues above.")

        # Provide helpful next steps
        if not results['Virtual Environment']:
            print_info("\n1. Create virtual environment: python -m venv venv")
            print_info("2. Activate it: venv\\Scripts\\activate (Windows)")
            print_info("3. Install dependencies: pip install -r requirements.txt")

        if not results['Django Installed']:
            print_info("\nInstall dependencies: pip install -r requirements.txt")

        if not results['PostgreSQL']:
            print_info("\nEnsure PostgreSQL is running and credentials are correct in .env")

        if not results['Migrations']:
            print_info("\nRun migrations: python manage.py migrate")


if __name__ == '__main__':
    main()
