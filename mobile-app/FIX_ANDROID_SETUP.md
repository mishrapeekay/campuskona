# ⚠️ Fix Your Android Development Environment

## 📋 Current Status (from React Native Doctor)

```
✓ Node.js - Working
✓ npm - Working
✓ Metro - Working
✓ Android Studio - Installed
✓ Gradlew - Working

✖ JDK - NOT FOUND (Required!)
✖ ANDROID_HOME - NOT SET (Required!)
✖ Android SDK - NOT FOUND (Required!)
✖ Adb - NOT FOUND (Required!)
```

## 🎯 You Need to Fix 4 Things

### 1. Install/Configure JDK ❌
### 2. Set ANDROID_HOME ❌
### 3. Install Android SDK ❌
### 4. Configure PATH for ADB ❌

---

## ✅ SOLUTION: Complete Android Studio Setup

Since you already have Android Studio installed, we just need to configure it properly.

### Step 1: Open Android Studio

1. **Launch Android Studio**
2. If it asks to import settings, choose "Do not import"
3. Wait for it to load

### Step 2: Install SDK Components

1. Click **"More Actions"** → **"SDK Manager"**

2. In **"SDK Platforms"** tab:
   - ✅ Check **Android 14.0 (UpsideDownCake)** or latest
   - ✅ Check **Android 13.0 (Tiramisu)**
   - Click **"Apply"** to install

3. In **"SDK Tools"** tab, ensure these are checked:
   - ✅ **Android SDK Build-Tools 34**
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Android Emulator**
   - ✅ **Android SDK Tools** (if available)
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)**
   - Click **"Apply"** to install

4. **Note the SDK Location** shown at the top:
   Example: `C:\Users\YourName\AppData\Local\Android\Sdk`
   **Copy this path!** You'll need it in the next step.

### Step 3: Set Environment Variables

**Important**: You must set these as **System Variables**, not User Variables.

#### A. Set ANDROID_HOME

1. Press **Windows Key**
2. Search: **"environment variables"**
3. Click: **"Edit the system environment variables"**
4. Click: **"Environment Variables"** button
5. Under **"System variables"** (bottom section):
   - Click **"New"**
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk`
     *(Use the path from SDK Manager)*
   - Click **"OK"**

#### B. Set JAVA_HOME

Android Studio includes its own JDK. Set JAVA_HOME to it:

1. Still in System Variables, click **"New"**
2. Variable name: `JAVA_HOME`
3. Variable value: `C:\Program Files\Android\Android Studio\jbr`
   *(This is Android Studio's bundled JDK)*
4. Click **"OK"**

#### C. Update PATH

1. Find **"Path"** in System variables
2. Click **"Edit"**
3. Click **"New"** and add each of these (one at a time):
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   %JAVA_HOME%\bin
   ```
4. Click **"OK"** on all windows

### Step 4: Verify Installation

**IMPORTANT**: Close ALL terminal windows and open a NEW one.

Then verify:

```bash
# Check Java (should show version 17.x or similar)
java -version

# Check Android SDK
adb version

# Check ANDROID_HOME
echo %ANDROID_HOME%

# Check JAVA_HOME
echo %JAVA_HOME%
```

**All commands should work!** If any fail, double-check environment variables.

---

## 🎮 Step 5: Create an Android Emulator

1. **Open Android Studio**
2. Click **"More Actions"** → **"Virtual Device Manager"**
3. Click **"Create Device"**
4. Select **"Pixel 5"** or any phone
5. Click **"Next"**
6. Download a system image:
   - Recommended: **"R" (Android 11)** or **"S" (Android 12)**
   - Click **"Download"** next to the release name
   - Wait for download (500MB-1GB)
7. Click **"Next"** → **"Finish"**

### Test Your Emulator

1. In Device Manager, click **▶ (Play)** next to your emulator
2. Wait for emulator to boot (1-2 minutes first time)
3. You should see an Android phone on your screen

### Verify Emulator is Detected

In your terminal:
```bash
# List emulators
emulator -list-avds
# Should show: Pixel_5_API_30 (or similar)

# List running devices
adb devices
# Should show your emulator when it's running
```

---

## 🚀 Step 6: Run Your App!

With emulator running, in a **new terminal**:

```bash
cd "G:\School Mgmt System\mobile-app"
npm run android
```

**Build time**: 2-3 minutes first time, then 30-60 seconds

**You should see**:
1. Gradle build progress
2. APK installation
3. App launches on emulator
4. Login screen appears! 🎉

---

## 🔄 Alternative: Use Physical Android Device

If you don't want to wait for emulator setup:

### Quick Setup with Real Phone

1. **On your Android phone**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Enable Developer Options
   - Go to Developer Options
   - Enable "USB Debugging"

2. **Connect phone via USB**

3. **Verify connection**:
   ```bash
   adb devices
   ```
   Should show your device

4. **Run app**:
   ```bash
   npm run android
   ```

**Note**: You still need JDK and Android SDK installed!

---

## ⏱️ Installation Time

- **SDK Download**: 5-10 minutes
- **Environment Variables**: 2 minutes
- **Emulator Creation**: 3-5 minutes
- **Emulator Download**: 5-10 minutes
- **First App Build**: 2-3 minutes

**Total**: ~25-30 minutes for complete setup

---

## 🐛 Common Issues & Solutions

### Issue 1: "Java not found" after setting JAVA_HOME

**Solution**:
```bash
# Verify path exists
dir "C:\Program Files\Android\Android Studio\jbr"

# If folder doesn't exist, Android Studio might be in different location
# Check: C:\Program Files (x86)\Android\Android Studio\jbr
```

### Issue 2: "adb not found" after setting PATH

**Solution**:
1. Close ALL terminals
2. Open NEW terminal (environment variables only load on startup)
3. Try again: `adb version`

### Issue 3: "ANDROID_HOME not set"

**Solution**:
- Make sure you set it in **System Variables**, not User Variables
- Path must be exact (no trailing slash)
- Restart terminal

### Issue 4: Emulator won't start

**Solution**:
```bash
# Enable hardware acceleration (Windows)
# Go to Windows Features, enable:
# - Hyper-V
# - Windows Hypervisor Platform
```

### Issue 5: Build fails with "SDK not found"

**Solution**:
```bash
# Verify SDK location
dir "%ANDROID_HOME%"

# Should show folders: build-tools, platforms, platform-tools, etc.
```

---

## 📱 Expected Output When Working

### 1. After Setting Environment Variables:
```bash
C:\> java -version
openjdk version "17.0.7" 2023-04-18

C:\> adb version
Android Debug Bridge version 1.0.41

C:\> echo %ANDROID_HOME%
C:\Users\YourName\AppData\Local\Android\Sdk
```

### 2. After Running npm run android:
```
info Installing the app...
> Task :app:installDebug
Installing APK '...'
Installed on 1 device.

BUILD SUCCESSFUL in 2m 15s
27 actionable tasks: 27 executed
info Connecting to the development server...
info Starting the app on "emulator-5554"...
Starting: Intent { cmp=com.schoolmanagementapp/.MainActivity }
```

### 3. On Your Emulator/Device:
- App icon appears
- App launches
- **Login screen displays!** ✨

---

## ✅ Checklist - Do These in Order

- [ ] Install SDK components in Android Studio
- [ ] Set ANDROID_HOME environment variable
- [ ] Set JAVA_HOME environment variable
- [ ] Add to PATH (platform-tools, emulator, etc.)
- [ ] **Close and reopen terminal**
- [ ] Verify: `java -version` works
- [ ] Verify: `adb version` works
- [ ] Create Android emulator
- [ ] Start emulator
- [ ] Verify: `adb devices` shows emulator
- [ ] Run: `npm run android`
- [ ] See app launch! 🎉

---

## 💡 Pro Tips

1. **Always restart terminal** after changing environment variables
2. **Keep emulator running** while developing (faster builds)
3. **Use Ctrl+M** in emulator to open React Native dev menu
4. **Press R twice** to reload app
5. **Check Metro bundler** is running (should see in terminal)

---

## 📞 Still Having Issues?

If you've followed all steps and still have errors:

1. **Run React Native Doctor again**:
   ```bash
   npx react-native doctor
   ```

2. **Check specific error**:
   ```bash
   npm run android --verbose
   ```

3. **Clean and rebuild**:
   ```bash
   cd android
   gradlew clean
   cd ..
   npm run android
   ```

---

**After completing these steps, your environment will be fully configured and your app will run!** 🚀

The setup is a one-time process. Once done, you can develop normally.
