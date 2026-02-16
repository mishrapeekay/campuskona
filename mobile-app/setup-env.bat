@echo off
echo ========================================
echo Android Environment Setup Script
echo ========================================
echo.

REM Find Android SDK location
set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
if not exist "%SDK_PATH%" set "SDK_PATH=%USERPROFILE%\AppData\Local\Android\Sdk"
if not exist "%SDK_PATH%" (
    echo ERROR: Android SDK not found!
    echo Please open Android Studio and note the SDK location from:
    echo Tools ^> SDK Manager ^> Android SDK Location
    echo.
    pause
    exit /b 1
)

REM Find JDK location
set "JDK_PATH=C:\Program Files\Android\Android Studio\jbr"
if not exist "%JDK_PATH%" (
    echo ERROR: Android Studio JDK not found!
    echo Please check Android Studio installation.
    pause
    exit /b 1
)

echo Found Android SDK at: %SDK_PATH%
echo Found JDK at: %JDK_PATH%
echo.
echo This script will set the following environment variables:
echo - ANDROID_HOME = %SDK_PATH%
echo - JAVA_HOME = %JDK_PATH%
echo.
echo And add these to your PATH:
echo - %%ANDROID_HOME%%\platform-tools
echo - %%ANDROID_HOME%%\emulator
echo - %%ANDROID_HOME%%\tools
echo - %%ANDROID_HOME%%\tools\bin
echo - %%JAVA_HOME%%\bin
echo.
echo ========================================
echo IMPORTANT: You need to run this as Administrator!
echo ========================================
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Running as Administrator... Good!
echo.

REM Set ANDROID_HOME
echo Setting ANDROID_HOME...
setx ANDROID_HOME "%SDK_PATH%" /M
if %errorLevel% neq 0 (
    echo ERROR: Failed to set ANDROID_HOME
    pause
    exit /b 1
)
echo ✓ ANDROID_HOME set successfully

REM Set JAVA_HOME
echo Setting JAVA_HOME...
setx JAVA_HOME "%JDK_PATH%" /M
if %errorLevel% neq 0 (
    echo ERROR: Failed to set JAVA_HOME
    pause
    exit /b 1
)
echo ✓ JAVA_HOME set successfully

REM Get current PATH
echo.
echo Adding Android tools to PATH...
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path ^| find "REG_"') do set "CURRENT_PATH=%%b"

REM Check if paths already exist
echo %CURRENT_PATH% | find /i "platform-tools" >nul
if %errorLevel% equ 0 (
    echo Platform-tools already in PATH
) else (
    set "NEW_PATH=%CURRENT_PATH%;%%ANDROID_HOME%%\platform-tools"
)

echo %CURRENT_PATH% | find /i "Android\emulator" >nul
if %errorLevel% equ 0 (
    echo Emulator already in PATH
) else (
    set "NEW_PATH=%NEW_PATH%;%%ANDROID_HOME%%\emulator"
)

echo %CURRENT_PATH% | find /i "Android\tools" >nul
if %errorLevel% equ 0 (
    echo Tools already in PATH
) else (
    set "NEW_PATH=%NEW_PATH%;%%ANDROID_HOME%%\tools;%%ANDROID_HOME%%\tools\bin"
)

echo %CURRENT_PATH% | find /i "jbr\bin" >nul
if %errorLevel% equ 0 (
    echo JDK bin already in PATH
) else (
    set "NEW_PATH=%NEW_PATH%;%%JAVA_HOME%%\bin"
)

REM Update PATH if needed
if defined NEW_PATH (
    echo Updating system PATH...
    setx PATH "%NEW_PATH%" /M
    if %errorLevel% neq 0 (
        echo ERROR: Failed to update PATH
        pause
        exit /b 1
    )
    echo ✓ PATH updated successfully
) else (
    echo All paths already configured!
)

echo.
echo ========================================
echo SUCCESS! Environment variables set!
echo ========================================
echo.
echo IMPORTANT: You must do these now:
echo 1. Close ALL terminal windows
echo 2. Open a NEW terminal
echo 3. Verify with these commands:
echo    - java -version
echo    - adb version
echo    - echo %%ANDROID_HOME%%
echo.
echo Then you can run: npm run android
echo.
pause
