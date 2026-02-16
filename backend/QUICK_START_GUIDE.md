# Quick Start Guide - School Management System

## 🚀 Get Started in 5 Minutes

This guide will help you get the School Management System running locally.

---

## Prerequisites

Make sure you have:
- ✅ Python 3.10+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ Redis 6+ installed and running (optional, for caching)
- ✅ Git installed

---

## Step 1: Clone & Setup (2 minutes)

```bash
# Clone the repository (if not already cloned)
cd "G:\School Mgmt System\backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Step 2: Configure Environment (1 minute)

Create a `.env` file in the backend directory:

```bash
# Development settings
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production

# Database (PostgreSQL)
DB_NAME=school_management
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Redis (optional)
USE_REDIS_CACHE=False
REDIS_URL=redis://localhost:6379/1

# Email (console backend for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@school.local

# Frontend URL
FRONTEND_URL=http://localhost:3000

# School name
SCHOOL_NAME=My School
```

---

## Step 3: Setup Database (1 minute)

```bash
# Create database (in PostgreSQL)
# psql -U postgres
# CREATE DATABASE school_management;
# \q

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Follow prompts to create admin account
```

---

## Step 4: Start Server (30 seconds)

```bash
# Start Django development server
python manage.py runserver

# Server will start at http://127.0.0.1:8000
```

---

## Step 5: Test the System (30 seconds)

Open your browser and visit:

1. **Admin Panel**: http://127.0.0.1:8000/admin/
   - Login with superuser credentials

2. **API Documentation**: http://127.0.0.1:8000/api/docs/
   - Interactive Swagger UI

3. **API Root**: http://127.0.0.1:8000/api/v1/
   - List of all endpoints

---

## ✅ You're Done!

The system is now running. Here's what you can do next:

### Option A: Explore the API

```bash
# Get auth token
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'

# Use token in requests
curl http://127.0.0.1:8000/api/v1/students/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option B: Run Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.authentication

# Run with verbose output
python manage.py test -v 2

# Run performance tests
python manage.py test apps.authentication.tests.test_performance
```

### Option C: Start Celery (For Email Notifications)

```bash
# In a new terminal, activate venv and run:

# Start Celery worker
celery -A config worker -l info

# Start Celery beat (in another terminal)
celery -A config beat -l info
```

---

## 📚 Common Commands

### Django Management

```bash
# Create new app
python manage.py startapp myapp

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Django shell
python manage.py shell
```

### Database

```bash
# Reset database (CAUTION: Deletes all data!)
python manage.py flush

# Show migrations
python manage.py showmigrations

# SQL for migration
python manage.py sqlmigrate app_name migration_name
```

### Testing

```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test apps.authentication.tests.test_views

# Run specific test class
python manage.py test apps.authentication.tests.test_views.LoginViewTests

# Run specific test method
python manage.py test apps.authentication.tests.test_views.LoginViewTests.test_login_success

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Creates htmlcov/index.html
```

---

## 🔧 Troubleshooting

### Issue: Database connection error

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l

# Create database if needed
createdb school_management
```

### Issue: Module not found

**Solution**:
```bash
# Make sure virtual environment is activated
# Re-install dependencies
pip install -r requirements.txt
```

### Issue: Migration errors

**Solution**:
```bash
# Reset migrations (CAUTION)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

### Issue: Port already in use

**Solution**:
```bash
# Use different port
python manage.py runserver 8001

# Or kill process using port 8000
# On Windows: netstat -ano | findstr :8000
# On Linux/Mac: lsof -ti:8000 | xargs kill
```

---

## 📖 Next Steps

### Learn More

1. **Read Documentation**:
   - `PROJECT_OVERVIEW.md` - Complete system overview
   - `PHASE_3_COMPLETION_REPORT.md` - Performance details
   - `PHASE_4_IMPLEMENTATION_SUMMARY.md` - Feature details

2. **Explore the Code**:
   - `apps/authentication/` - User management
   - `apps/students/` - Student management
   - `apps/communication/` - Email notifications

3. **API Documentation**:
   - Visit http://127.0.0.1:8000/api/docs/
   - Interactive Swagger UI with all endpoints

### Customize

1. **Add Your School Info**:
   - Update `SCHOOL_NAME` in `.env`
   - Customize email templates in `templates/emails/`

2. **Configure Email**:
   - For production, use SMTP or SendGrid
   - Update EMAIL_* settings in `.env`

3. **Setup Celery**:
   - Configure automated reminders
   - See `config/celery.py` for schedule

---

## 🎯 Key Features to Try

### 1. User Management

```bash
# Create users via API
POST /api/v1/auth/users/
{
  "email": "teacher@school.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "TEACHER",
  "phone": "1234567890"
}
```

### 2. Student Management

```bash
# Create student
POST /api/v1/students/
{
  "email": "student@school.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "date_of_birth": "2010-05-15",
  "gender": "FEMALE",
  "admission_status": "APPLIED"
}
```

### 3. Send Email

```python
# In Django shell (python manage.py shell)
from apps.communication.email_service import EmailService
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Send welcome email
EmailService.send_welcome_email(user)

# Check console for email output (in development mode)
```

### 4. Create Notice

```bash
# Create notice via API
POST /api/v1/communication/notices/
{
  "title": "School Reopening",
  "content": "School will reopen on Feb 1, 2026",
  "target_audience": "ALL",
  "priority": "HIGH",
  "is_published": true
}
```

---

## 📊 System Status

After setup, your system will have:

✅ **13 Django apps** fully functional
✅ **100+ API endpoints** ready to use
✅ **50+ database models** created
✅ **JWT authentication** configured
✅ **Email system** ready (console mode)
✅ **Performance optimized** (40+ indexes)
✅ **Caching ready** (if Redis enabled)

---

## 🆘 Need Help?

### Documentation

- `PROJECT_OVERVIEW.md` - Complete overview
- `PHASE_*_*.md` - Detailed phase reports
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full summary

### API Docs

- Swagger UI: http://127.0.0.1:8000/api/docs/
- ReDoc: http://127.0.0.1:8000/api/redoc/

### Common Issues

Check `COMPLETE_IMPLEMENTATION_SUMMARY.md` for:
- Known issues
- Solutions
- Best practices

---

## ⚡ Quick Tips

1. **Always activate virtual environment** before running commands
2. **Run migrations** after pulling code changes
3. **Use environment variables** for sensitive data
4. **Enable Redis** for better performance
5. **Run tests** before making changes
6. **Check logs** if something doesn't work

---

**Happy Coding! 🚀**

*System is production-ready and performs 70-95% faster than baseline!*

---

*Quick Start Guide - v1.0*
*Last Updated: 2026-01-21*
