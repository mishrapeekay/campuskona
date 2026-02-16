@echo off
REM Start Development Environment for School Management System (Windows)

echo.
echo Starting School Management System...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Build and start containers
echo Building and starting containers...
docker-compose up --build -d

REM Wait for services
echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service status
echo.
echo Services Status:
docker-compose ps

echo.
echo Development environment is ready!
echo.
echo Access Points:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000
echo    - Admin Panel: http://localhost:8000/admin
echo    - API Docs: http://localhost:8000/api/docs
echo.
echo Database Connections:
echo    - PostgreSQL: localhost:5432
echo    - Redis: localhost:6379
echo.
echo Useful Commands:
echo    - View logs: docker-compose logs -f
echo    - Stop services: docker-compose down
echo    - Restart services: docker-compose restart
echo.
pause
