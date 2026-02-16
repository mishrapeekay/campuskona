# Setting Up Android Development Environment

## The Problem

You're getting this error because the Android build tools are not installed:
```
ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
```

## ✅ Quick Fix: Install Android Studio (Recommended)

This is the **easiest and most complete** solution:

### Step 1: Download and Install Android Studio

1. **Download Android Studio**:
   - Go to: https://developer.android.com/studio
   - Download the latest version for Windows
   - File size: ~1GB

2. **Install Android Studio**:
   - Run the installer
   - Choose "Standard" installation
   - Accept all defaults
   - **This will install**:
     - ✅ Java JDK
     - ✅ Android SDK
     - ✅ Android Emulator
     - ✅ Build tools

3. **Wait for installation** (takes 10-15 minutes)

---

### Step 2: Set Up Environment Variables

After Android Studio installation, set these environment variables:

#### Option A: Using Android Studio (Easier)

1. Open Android Studio
2. Go to: **Tools > SDK Manager**
3. Note the **Android SDK Location** (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
4. Click on **SDK Tools** tab
5. Ensure these are installed:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Tools
   - ✅ Android Emulator

#### Option B: Manual Setup (If needed)

**Set Environment Variables:**

1. **Press Windows Key**, search "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button

**Add ANDROID_HOME:**
1. Under "System Variables", click "New"
2. Variable name: `ANDROID_HOME`
3. Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk`
   *(Replace YourName with your actual username)*

**Add JAVA_HOME:**
1. Click "New" again
2. Variable name: `JAVA_HOME`
3. Variable value: `C:\Program Files\Android\Android Studio\jbr`
   *(Android Studio includes JDK)*

**Update PATH:**
1. Find "Path" under System Variables
2. Click "Edit"
3. Click "New" and add these (one at a time):
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   %JAVA_HOME%\bin
   ```

4. Click "OK" on all windows

**Restart your terminal/computer** for changes to take effect.

---

### Step 3: Create an Android Virtual Device (Emulator)

1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create Device"
4. Select a device (e.g., "Pixel 5")
5. Click "Next"
6. Download a system image (e.g., "R" - Android 11.0)
7. Click "Next" → "Finish"

---

### Step 4: Verify Installation

Open a **NEW terminal** and run:

```bash
# Check Java
java -version
# Should show: openjdk version "17.x.x" or similar

# Check ADB
adb version
# Should show: Android Debug Bridge version

# List emulators
emulator -list-avds
# Should show your emulator name
```

---

## 🚀 Alternative: Use Physical Android Device

If you don't want to wait for Android Studio installation:

### Step 1: Enable Developer Mode on Your Phone

1. **Go to Settings** → **About Phone**
2. **Tap "Build Number" 7 times**
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging

1. **Go to Settings** → **Developer Options**
2. **Enable "USB Debugging"**
3. **Enable "Install via USB"** (if available)

### Step 3: Connect Phone to Computer

1. Connect via USB cable
2. On phone, tap "Allow" when prompted
3. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed

### Step 4: Run the App

```bash
npm run android
```

**Note**: You still need Java/JDK installed for this to work!

---

## 📦 Quick Install: Just JDK (Minimal Setup)

If you only want to run on a physical device and don't need Android Studio:

### Install JDK Only

1. **Download OpenJDK 17**:
   - Go to: https://adoptium.net/
   - Download JDK 17 (LTS) for Windows
   - Install it

2. **Download Android SDK Command-line Tools**:
   - Go to: https://developer.android.com/studio#command-tools
   - Download "Command line tools only"
   - Extract to: `C:\Android\cmdline-tools`

3. **Install SDK Platform & Build Tools**:
   ```bash
   cd C:\Android\cmdline-tools\bin
   sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
   ```

4. **Set Environment Variables** (as described above)

---

## ✅ After Setup - Run These Commands

Once everything is installed, verify:

```bash
# Test Java
java -version

# Test Android tools
adb version

# List connected devices
adb devices

# List emulators
emulator -list-avds
```

Then run your app:

```bash
cd "G:\School Mgmt System\mobile-app"
npm run android
```

---

## 🐛 Troubleshooting

### Error: "Java not found"
**Solution**:
- Install JDK (use Android Studio or download from adoptium.net)
- Set JAVA_HOME environment variable
- Restart terminal

### Error: "adb not found"
**Solution**:
- Install Android SDK
- Add `%ANDROID_HOME%\platform-tools` to PATH
- Restart terminal

### Error: "No emulators found"
**Solution**:
- Create emulator in Android Studio
- OR connect physical device with USB debugging
- Run `adb devices` to verify

### Error: "Gradle build failed"
**Solution**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

## 📝 Recommended Approach

**For beginners**: Install Android Studio (complete solution, everything in one place)

**For experts**: Install JDK + Android SDK command-line tools (minimal, faster)

**For quick testing**: Use physical Android device (requires JDK only)

---

## ⏱️ Installation Time Estimates

- **Android Studio**: 15-20 minutes download + install
- **JDK Only**: 5 minutes
- **Physical Device Setup**: 2 minutes (if you have a phone)

---

## 🎯 What You Need (Minimum)

To build Android apps, you **must have**:
1. ✅ Java Development Kit (JDK 11 or higher)
2. ✅ Android SDK
3. ✅ Android device or emulator

There's no way around this - these are required for Android development.

---

## Next Steps

1. **Install Android Studio** (easiest option)
2. **Set up environment variables**
3. **Create an emulator** OR **connect physical device**
4. **Verify with**: `java -version` and `adb devices`
5. **Run**: `npm run android`

---

**Once you have Android Studio installed and configured, the app will build and run successfully!** 🚀
