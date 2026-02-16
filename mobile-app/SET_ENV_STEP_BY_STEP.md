# Step-by-Step Environment Variable Setup

## Part 1: Find Your Android SDK Location (2 minutes)

### Step 1: Open Android Studio

1. **Launch Android Studio** from your Start menu
2. Wait for it to fully load

### Step 2: Open SDK Manager

1. On the welcome screen, click **"More Actions"** (or **"Configure"**)
2. Click **"SDK Manager"**

   OR if you have a project open:
   - Click **"Tools"** menu → **"SDK Manager"**

### Step 3: Copy SDK Location

1. At the very top of the SDK Manager window, you'll see:
   ```
   Android SDK Location: C:\Users\YourName\AppData\Local\Android\Sdk
   ```
2. **SELECT ALL THE TEXT** and **COPY IT** (Ctrl+C)
3. **Paste it somewhere** (Notepad) - you'll need this!

### Step 4: Install Required SDK Components

While you're in SDK Manager:

1. Click on **"SDK Platforms"** tab:
   - ✅ Check **Android 14.0 (UpsideDownCake)** or latest
   - ✅ Check **Android 13.0 (Tiramisu)**

2. Click on **"SDK Tools"** tab:
   - ✅ Check **Android SDK Build-Tools**
   - ✅ Check **Android SDK Platform-Tools**
   - ✅ Check **Android Emulator**
   - ✅ Check **Intel x86 Emulator Accelerator (HAXM)** (if available)

3. Click **"Apply"** button
4. Click **"OK"** to confirm
5. **Wait for installation** (5-10 minutes)
6. Click **"Finish"** when done

---

## Part 2: Set Environment Variables (3 minutes)

### Step 1: Open Environment Variables

1. Press **Windows Key**
2. Type: **environment variables**
3. Click: **"Edit the system environment variables"**
4. Click: **"Environment Variables"** button at the bottom

### Step 2: Create ANDROID_HOME

1. In the **"System variables"** section (bottom half), click **"New..."**
2. In the **"New System Variable"** dialog:
   - **Variable name**: Type `ANDROID_HOME`
   - **Variable value**: **Paste the SDK path you copied** (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
3. Click **"OK"**

### Step 3: Create JAVA_HOME

1. Still in **System variables**, click **"New..."** again
2. In the dialog:
   - **Variable name**: Type `JAVA_HOME`
   - **Variable value**: Type `C:\Program Files\Android\Android Studio\jbr`
3. Click **"OK"**

### Step 4: Update PATH

1. In **System variables**, find the variable named **"Path"**
2. Select it and click **"Edit..."**
3. Click **"New"** and add this line:
   ```
   %ANDROID_HOME%\platform-tools
   ```
4. Click **"New"** again and add:
   ```
   %ANDROID_HOME%\emulator
   ```
5. Click **"New"** again and add:
   ```
   %ANDROID_HOME%\tools
   ```
6. Click **"New"** again and add:
   ```
   %ANDROID_HOME%\tools\bin
   ```
7. Click **"New"** again and add:
   ```
   %JAVA_HOME%\bin
   ```
8. Click **"OK"** on all windows

---

## Part 3: Verify Everything Works

### Step 1: Close ALL Terminals

**IMPORTANT**: Close every terminal/command prompt window you have open.
Environment variables only load when a terminal starts.

### Step 2: Open NEW Terminal

1. Press **Windows Key**
2. Type: **cmd**
3. Press **Enter**

### Step 3: Run Verification Commands

Copy and paste these commands one by one:

```bash
# Test 1: Check Java
java -version
```
**Expected output**: `openjdk version "17.0.x"` or similar

```bash
# Test 2: Check ADB
adb version
```
**Expected output**: `Android Debug Bridge version x.x.x`

```bash
# Test 3: Check ANDROID_HOME
echo %ANDROID_HOME%
```
**Expected output**: Your SDK path (e.g., `C:\Users\...\Android\Sdk`)

```bash
# Test 4: Check JAVA_HOME
echo %JAVA_HOME%
```
**Expected output**: `C:\Program Files\Android\Android Studio\jbr`

### ✅ **If ALL 4 tests pass** → You're ready!
### ❌ **If ANY test fails** → See troubleshooting below

---

## Part 4: Create Android Emulator (5 minutes)

### Step 1: Open Device Manager

1. In **Android Studio**, click **"More Actions"** → **"Virtual Device Manager"**

### Step 2: Create New Device

1. Click **"Create Device"** button
2. Select **"Pixel 5"** (or any phone you like)
3. Click **"Next"**

### Step 3: Download System Image

1. You'll see a list of Android versions
2. Find **"R"** (Android 11) - recommended
3. Click **"Download"** next to it
4. Wait for download (500MB-1GB, 5-10 min)
5. Click **"Finish"** when download completes
6. Click **"Next"**

### Step 4: Finish Creation

1. Review settings (you can leave defaults)
2. Click **"Finish"**

### Step 5: Start Emulator

1. Back in Device Manager, find your new emulator
2. Click the **▶ (Play)** button
3. Wait for emulator to boot (1-2 minutes first time)
4. You should see an Android phone on your screen

### Step 6: Verify Emulator

In your terminal, run:
```bash
adb devices
```

**Expected output**:
```
List of devices attached
emulator-5554   device
```

✅ **Emulator is ready!**

---

## Part 5: Run Your App! 🚀

### Step 1: Navigate to Project

```bash
cd "G:\School Mgmt System\mobile-app"
```

### Step 2: Run on Android

```bash
npm run android
```

### What You'll See:

1. **Gradle build starts** (this takes 2-3 minutes first time)
   ```
   > Task :app:compileDebugJavaWithJavac
   > Task :app:installDebug
   ```

2. **App installs on emulator**
   ```
   Installing APK...
   Installed on 1 device
   ```

3. **Metro bundler connects**
   ```
   info Starting the app...
   ```

4. **App launches on emulator** 🎉

5. **You see the Login Screen!** ✨

---

## 🐛 Troubleshooting

### "java not found"
**Problem**: JAVA_HOME not set correctly

**Solution**:
1. Check the path exists: Open File Explorer, paste: `C:\Program Files\Android\Android Studio\jbr`
2. If folder doesn't exist, Android Studio might be in different location
3. Right-click Android Studio shortcut → "Open file location" to find it

### "adb not found"
**Problem**: ANDROID_HOME or PATH not set correctly

**Solution**:
1. **Restart computer** (environment variables need this sometimes)
2. Open NEW terminal
3. Try again

### "SDK not found" when building
**Problem**: Wrong SDK path

**Solution**:
1. Go back to Android Studio → SDK Manager
2. Verify the exact path shown
3. Update ANDROID_HOME to match exactly

### Build fails with "Gradle error"
**Solution**:
```bash
cd "G:\School Mgmt System\mobile-app\android"
gradlew clean
cd ..
npm run android
```

### "No devices connected"
**Problem**: Emulator not running

**Solution**:
1. Open Android Studio
2. Virtual Device Manager → Start emulator
3. Wait for it to fully boot
4. Run: `adb devices` to verify
5. Then: `npm run android`

---

## ✅ Success Checklist

After completing all steps:

- [ ] Android Studio SDK installed
- [ ] ANDROID_HOME set
- [ ] JAVA_HOME set
- [ ] PATH updated
- [ ] `java -version` works
- [ ] `adb version` works
- [ ] Emulator created
- [ ] Emulator running
- [ ] `adb devices` shows emulator
- [ ] `npm run android` completes successfully
- [ ] **App launches and shows Login screen!** 🎉

---

## ⏱️ Time Breakdown

- Find SDK location: 2 min
- Install SDK components: 10 min
- Set environment variables: 3 min
- Create emulator: 5 min
- Download system image: 10 min
- First app build: 3 min
- **Total: ~30-35 minutes**

(Most of this is waiting for downloads)

---

## 📞 Next Steps After Success

Once your app runs:

1. **Test the UI** - Navigate through screens
2. **Check Profile** - View and logout functionality
3. **Connect Backend** - Update `.env` with real API
4. **Implement Features** - Start with Attendance module

---

**Follow these steps carefully and you'll have your app running!** 🚀

If you get stuck at any step, let me know which step and what error you're seeing!
