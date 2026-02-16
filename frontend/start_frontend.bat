@echo off
REM ========================================
REM Frontend Server Startup Script
REM School Management System
REM ========================================

echo.
echo ================================================================================
echo   Starting School Management System - Frontend Server
echo ================================================================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [WARNING] node_modules not found!
    echo [1/3] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies already installed.
)

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating default .env file...
    (
        echo REACT_APP_API_URL=http://localhost:8000/api/v1
        echo REACT_APP_ENVIRONMENT=development
        echo PORT=3000
    ) > .env
    echo [SUCCESS] Created .env file with default settings.
)

REM Display configuration
echo.
echo [2/3] Frontend server configuration:
echo   - React version: 18.2.0
echo   - API URL: http://localhost:8000/api/v1
echo   - Port: 3000
echo.

REM Start Vite development server
echo [3/3] Starting Vite development server...
echo.
echo ================================================================================
echo   Frontend Server Running!
echo ================================================================================
echo   URL: http://localhost:3000
echo   API: http://localhost:8000/api/v1
echo ================================================================================
echo   Press CTRL+C to stop the server
echo ================================================================================
echo.

npm run dev

REM Cleanup on exit
echo.
echo Frontend server stopped.
pause
