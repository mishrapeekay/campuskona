# Android Build Error Fix Guide

**Error:** `Failed to parse APK file: /data/local/tmp/app-debug.apk`  
**Date:** January 24, 2026

---

## 🔴 Problem

The Android build is failing with:
```
java.lang.IllegalArgumentException: Error: Failed to parse APK file
Failed to parse /data/local/tmp/app-debug.apk
```

This error typically occurs due to:
1. **Corrupted build cache**
2. **SDK version mismatch** (SDK XML version 4 vs version 3)
3. **Gradle cache issues**
4. **Incompatible Android Studio and CLI tools versions**

---

## ✅ Solution Steps

### Step 1: Clean Build Directories

```powershell
cd "G:\School Mgmt System\mobile-app"

# Remove build directories
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue

# Clean node modules cache (optional but recommended)
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
npm install
```

---

### Step 2: Clean Gradle Cache

```powershell
cd "G:\School Mgmt System\mobile-app\android"

# Clean using Gradle
.\gradlew clean

# If that fails, manually delete Gradle cache
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
```

---

### Step 3: Update Android SDK Tools

The warning indicates SDK version mismatch. Update your Android SDK:

1. **Open Android Studio**
2. Go to **Tools → SDK Manager**
3. Under **SDK Tools** tab, ensure these are installed:
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools (latest)
   - Android SDK Command-line Tools (latest)
4. Click **Apply** to update

---

### Step 4: Rebuild the App

```powershell
cd "G:\School Mgmt System\mobile-app"

# Try building again
npm run android
```

---

## 🔧 Alternative Solutions

### Option A: Use Different Emulator/Device

The error might be specific to your current emulator. Try:

1. **Create a new AVD** (Android Virtual Device):
   - Open Android Studio
   - Tools → Device Manager
   - Create Device → Choose Pixel 5 or similar
   - System Image: Android 13 (API 33) or Android 12 (API 31)

2. **Start the new emulator** before running `npm run android`

---

### Option B: Downgrade compileSdk Version

Edit `android/build.gradle`:

```gradle
buildscript {
    ext {
        buildToolsVersion = "33.0.0"  // Changed from 34.0.0
        minSdkVersion = 23
        compileSdkVersion = 33        // Changed from 34
        targetSdkVersion = 33         // Changed from 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.22"
    }
}
```

Then clean and rebuild:
```powershell
cd android
.\gradlew clean
cd ..
npm run android
```

---

### Option C: Manual APK Installation

If build succeeds but installation fails:

```powershell
# Build the APK
cd "G:\School Mgmt System\mobile-app\android"
.\gradlew assembleDebug

# Manually install
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

### Option D: Use Physical Device

Sometimes emulators have issues. Try a physical Android device:

1. **Enable Developer Options** on your phone:
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging

3. **Connect via USB** and run:
   ```powershell
   npm run android
   ```

---

## 🧪 Diagnostic Commands

### Check Connected Devices
```powershell
adb devices
```

**Expected Output:**
```
List of devices attached
emulator-5554   device
```

---

### Check Android SDK Location
```powershell
echo $env:ANDROID_HOME
```

**Should point to:** `C:\Users\<YourName>\AppData\Local\Android\Sdk`

---

### Check Java Version
```powershell
java -version
```

**Expected:** Java 11 or Java 17

---

### Check Gradle Version
```powershell
cd "G:\School Mgmt System\mobile-app\android"
.\gradlew --version
```

---

## 📋 Quick Fix Checklist

Try these in order:

- [ ] Clean build directories
- [ ] Clean Gradle cache
- [ ] Restart Android emulator
- [ ] Update Android SDK tools
- [ ] Create new AVD with Android 12/13
- [ ] Try physical device
- [ ] Downgrade SDK version to 33
- [ ] Reinstall node_modules

---

## 🎯 Recommended Quick Fix

**The fastest solution:**

```powershell
# 1. Clean everything
cd "G:\School Mgmt System\mobile-app"
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Close and restart emulator
adb kill-server
adb start-server

# 3. Start fresh emulator from Android Studio
# (Device Manager → Create new Pixel 5 with Android 12)

# 4. Wait for emulator to fully boot, then:
npm run android
```

---

## 🔍 Understanding the Error

### SDK Version Warning
```
Warning: SDK processing. This version only understands SDK XML versions up to 3 
but an SDK XML file of version 4 was encountered.
```

**Meaning:** Your Android Studio and command-line tools were released at different times.

**Fix:** Update both to latest versions or ensure they're from the same release.

---

### APK Parse Error
```
Failed to parse APK file: /data/local/tmp/app-debug.apk
```

**Meaning:** The emulator cannot read the APK file structure.

**Causes:**
1. Corrupted APK during build
2. Incompatible Android version on emulator
3. Insufficient storage on emulator
4. Gradle build cache corruption

---

## 🚀 Alternative: Use Web/Frontend Instead

While fixing Android build, you can use the web frontend:

```powershell
# Backend is already running on port 8000
# Frontend is already running on port 3000

# Just open browser:
# http://localhost:3000/

# Login with:
# Email: teacher@demo.com
# Password: School@123
```

The web version has all the same features as the mobile app!

---

## 📱 Metro Bundler (Separate Issue)

If you want to run Metro bundler separately:

```powershell
# Terminal 1: Metro Bundler
cd "G:\School Mgmt System\mobile-app"
npm start

# Terminal 2: Install app
npm run android
```

---

## 🆘 If Nothing Works

### Nuclear Option: Complete Reset

```powershell
cd "G:\School Mgmt System\mobile-app"

# 1. Delete everything
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "android\app\build" -Recurse -Force
Remove-Item -Path "android\.gradle" -Recurse -Force
Remove-Item -Path "android\build" -Recurse -Force

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall
npm install

# 4. Clear Gradle cache
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force

# 5. Rebuild
cd android
.\gradlew clean
cd ..
npm run android
```

---

## 📊 System Requirements Check

Ensure you have:

- ✅ **Node.js:** v16+ (check: `node --version`)
- ✅ **Java:** JDK 11 or 17 (check: `java -version`)
- ✅ **Android Studio:** Latest version
- ✅ **Android SDK:** API 33 or 34
- ✅ **Gradle:** 8.x (auto-installed)
- ✅ **Emulator:** Android 12 or 13 recommended

---

## 🎓 Understanding the Build Process

1. **Gradle configures** the build
2. **React Native bundles** JavaScript
3. **Android builds** the APK
4. **ADB installs** APK to emulator/device
5. **App launches** on device

**Error occurs at step 4:** Installation fails because emulator can't parse the APK.

---

## 📞 Next Steps

1. **Try Quick Fix** (clean + restart emulator)
2. **If fails:** Create new AVD with Android 12
3. **If still fails:** Use web frontend instead
4. **Report issue:** Check React Native GitHub for similar issues

---

**Created:** January 24, 2026  
**Status:** Troubleshooting in progress  
**Workaround:** Use web frontend at http://localhost:3000/
