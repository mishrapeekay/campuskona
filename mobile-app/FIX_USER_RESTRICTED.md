# Fix: INSTALL_FAILED_USER_RESTRICTED

**Error:** `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`

This error occurs when the Android emulator has security restrictions that prevent app installation.

---

## 🔧 Quick Fix Solutions

### **Solution 1: Enable Installation from Unknown Sources (Recommended)**

1. **On the Emulator:**
   - Open **Settings** app
   - Go to **Security** or **Apps & notifications**
   - Find **Install unknown apps** or **Unknown sources**
   - Enable it for **Package Installer** or **Files**

2. **Alternative Path:**
   - Settings → Apps → Special app access → Install unknown apps
   - Enable for the installer app

3. **Rebuild:**
   ```powershell
   npm run android
   ```

---

### **Solution 2: Use ADB to Enable Installation**

```powershell
# Enable installation from unknown sources via ADB
adb shell settings put secure install_non_market_apps 1

# Or for newer Android versions:
adb shell settings put global install_non_market_apps 1

# Then rebuild
npm run android
```

---

### **Solution 3: Restart Emulator with Writable System**

```powershell
# Stop current emulator
adb emu kill

# Start emulator with writable system (from Android Studio)
# Tools → Device Manager → Start emulator with "-writable-system" flag
```

---

### **Solution 4: Create New AVD (Most Reliable)**

The current emulator might have restrictive settings. Create a fresh one:

1. **Open Android Studio**
2. **Tools → Device Manager**
3. **Create Device**
4. **Select:** Pixel 5 or Pixel 6
5. **System Image:** 
   - **Recommended:** Android 12 (API 31) - S
   - **Alternative:** Android 13 (API 33) - Tiramisu
   - **Avoid:** Android 14 (API 34) - might have stricter security
6. **Advanced Settings:**
   - Enable: "Hardware - GLES 2.0"
   - RAM: 2048 MB or more
7. **Finish** and start the new emulator
8. **Run:** `npm run android`

---

### **Solution 5: Manual APK Installation**

If automatic installation fails, install manually:

```powershell
# Build the APK
cd "G:\School Mgmt System\mobile-app\android"
.\gradlew assembleDebug

# Install manually with force flag
adb install -r -t -d app\build\outputs\apk\debug\app-debug.apk

# If that fails, try:
adb install -r --user 0 app\build\outputs\apk\debug\app-debug.apk
```

---

## 🎯 Recommended Steps (In Order)

### **Step 1: Try ADB Command**
```powershell
adb shell settings put secure install_non_market_apps 1
npm run android
```

### **Step 2: If Step 1 Fails - Enable in Settings**
- Open emulator Settings → Security → Enable unknown sources
- Run `npm run android` again

### **Step 3: If Step 2 Fails - Create New Emulator**
- Create fresh AVD with Android 12 (API 31)
- This usually solves all installation issues

---

## 🔍 Verify Emulator Settings

Check current security settings:

```powershell
# Check install_non_market_apps setting
adb shell settings get secure install_non_market_apps

# Should return: 1 (enabled)
# If returns: 0 (disabled) - that's the problem
```

---

## 📱 Alternative: Use Physical Device

If emulator issues persist, use a real Android phone:

1. **Enable Developer Options:**
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging

3. **Connect via USB** and run:
   ```powershell
   adb devices
   npm run android
   ```

Physical devices usually don't have these restrictions!

---

## 🆘 If Nothing Works

### **Use Web Frontend Instead:**

The web version has all the same features and is easier to test:

```
URL: http://localhost:3000/
Login: teacher@demo.com / School@123
```

All teacher dashboard features work perfectly on web!

---

## 📊 Quick Diagnostic

```powershell
# Check connected devices
adb devices

# Check emulator security settings
adb shell settings get secure install_non_market_apps

# Check if app is already installed
adb shell pm list packages | findstr schoolmgmt

# If installed, uninstall first
adb uninstall com.schoolmgmttemp

# Try installing again
npm run android
```

---

**Created:** January 24, 2026  
**Next Action:** Try Solution 1 (ADB command) first
