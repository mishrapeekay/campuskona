@echo off
REM ========================================
REM Backend Server Startup Script
REM School Management System
REM ========================================

echo.
echo ================================================================================
echo   Starting School Management System - Backend Server
echo ================================================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo [ERROR] Virtual environment not found!
    echo Please create it first: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
echo [1/6] Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found! Using default settings.
    echo Please create .env file for custom configuration.
)

REM Check database connection
echo [2/6] Checking database connection...
python manage.py check --database default
if errorlevel 1 (
    echo [ERROR] Database connection failed!
    echo Please ensure PostgreSQL is running on localhost:5432
    pause
    exit /b 1
)

REM Run migrations
echo [3/6] Running database migrations...
python manage.py migrate --noinput
if errorlevel 1 (
    echo [ERROR] Migration failed!
    pause
    exit /b 1
)

REM Collect static files (skip in development)
REM echo [4/6] Collecting static files...
REM python manage.py collectstatic --noinput

REM Create superuser if needed (commented out - run manually)
REM python manage.py createsuperuser

REM Check for Redis (optional)
echo [4/6] Checking Redis connection...
python -c "import redis; r = redis.Redis(host='localhost', port=6379, db=0); r.ping()" 2>nul
if errorlevel 1 (
    echo [WARNING] Redis not available. Cache will use in-memory backend.
) else (
    echo [SUCCESS] Redis is running.
)

REM Display server info
echo.
echo [5/6] Backend server configuration:
echo   - Django version: 4.2.7
echo   - Database: PostgreSQL (localhost:5432)
echo   - Redis: localhost:6379
echo   - API Docs: http://127.0.0.1:8000/api/schema/swagger/
echo   - Admin Panel: http://127.0.0.1:8000/admin/
echo.

REM Start Django development server
echo [6/6] Starting Django development server...
echo.
echo ================================================================================
echo   Backend Server Running!
echo ================================================================================
echo   URL: http://127.0.0.1:8000
echo   Admin: http://127.0.0.1:8000/admin/
echo   API Docs: http://127.0.0.1:8000/api/schema/swagger/
echo   API: http://127.0.0.1:8000/api/v1/
echo ================================================================================
echo   Press CTRL+C to stop the server
echo ================================================================================
echo.

python manage.py runserver 0.0.0.0:8000

REM Cleanup on exit
echo.
echo Backend server stopped.
pause
