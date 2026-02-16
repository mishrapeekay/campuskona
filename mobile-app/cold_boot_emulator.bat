@echo off
echo Killing any running emulators...
taskkill /F /IM qemu-system-x86_64.exe >nul 2>&1

echo Deleting lock files...
del "C:\Users\DigitalEFX\.android\avd\Pixel_7.avd\multiinstance.lock" >nul 2>&1
del "C:\Users\DigitalEFX\.android\avd\Pixel_7.avd\hardware-qemu.ini.lock" >nul 2>&1

echo Starting Pixel_7 with Cold Boot...
emulator -avd Pixel_7 -no-snapshot-load

pause
