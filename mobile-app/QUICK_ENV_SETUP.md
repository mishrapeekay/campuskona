# ⚡ Quick Environment Setup Guide

## 🎯 You Have 2 Options

### **Option 1: Automated Setup** (Easiest - 2 minutes)

I've created a script that does everything for you!

1. **Find the file**: `setup-env.bat` in your mobile-app folder

2. **Right-click** on `setup-env.bat`

3. Select **"Run as administrator"**

4. The script will:
   - ✅ Find your Android SDK location
   - ✅ Find your JDK location
   - ✅ Set ANDROID_HOME
   - ✅ Set JAVA_HOME
   - ✅ Update PATH with all required paths

5. **Close ALL terminals** and open a **NEW** one

6. **Verify it worked**:
   ```bash
   java -version    # Should show version
   adb version      # Should show version
   ```

7. **Run your app**:
   ```bash
   cd "G:\School Mgmt System\mobile-app"
   npm run android
   ```

✅ **Done!**

---

### **Option 2: Manual Setup** (5 minutes)

If the script doesn't work:

#### Step 1: Open Android Studio

1. Launch **Android Studio**
2. Click **More Actions** → **SDK Manager**
3. See the **"Android SDK Location"** at the top
4. **COPY THIS PATH** (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)

#### Step 2: Set Environment Variables

1. Press **Windows Key**, type **"environment variables"**
2. Click **"Edit the system environment variables"**
3. Click **"Environment Variables"** button

#### Step 3: Add ANDROID_HOME

Under **System variables** (bottom section):
1. Click **"New"**
2. Variable name: `ANDROID_HOME`
3. Variable value: *[Paste the SDK path from Step 1]*
4. Click **"OK"**

#### Step 4: Add JAVA_HOME

1. Click **"New"** again
2. Variable name: `JAVA_HOME`
3. Variable value: `C:\Program Files\Android\Android Studio\jbr`
4. Click **"OK"**

#### Step 5: Update PATH

1. Find **"Path"** in System variables
2. Click **"Edit"**
3. Click **"New"** for each of these:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`
   - `%JAVA_HOME%\bin`
4. Click **"OK"** on all windows

#### Step 6: Restart Terminal

**IMPORTANT**: Close ALL terminals, open a NEW one

#### Step 7: Verify

```bash
java -version       # ✓ Should work
adb version        # ✓ Should work
echo %ANDROID_HOME% # ✓ Should show path
```

#### Step 8: Run App

```bash
cd "G:\School Mgmt System\mobile-app"
npm run android
```

---

## 🎬 What Happens Next

After environment variables are set:

1. **First time you run `npm run android`**:
   - Gradle downloads dependencies (1-2 min)
   - Builds your app (2-3 min)
   - Installs on device/emulator
   - Launches app
   - **Login screen appears!** 🎉

2. **Every time after that**:
   - Builds in 30-60 seconds
   - Much faster!

---

## 📱 Before Running

Make sure you have **ONE** of these:

### Option A: Android Emulator

1. Open Android Studio
2. **More Actions** → **Virtual Device Manager**
3. **Create Device** (if you haven't)
4. **Start** the emulator (▶ button)
5. Wait for it to boot fully

### Option B: Physical Android Phone

1. Enable Developer Mode (tap Build Number 7 times)
2. Enable USB Debugging
3. Connect via USB
4. Verify: `adb devices` shows your phone

---

## ✅ Verification Checklist

Before running the app, verify these all work:

```bash
# Test 1: Java
java -version
# ✓ Should show: openjdk version "17.0.x"

# Test 2: ADB
adb version
# ✓ Should show: Android Debug Bridge version x.x.x

# Test 3: ANDROID_HOME
echo %ANDROID_HOME%
# ✓ Should show: C:\Users\...\Android\Sdk

# Test 4: JAVA_HOME
echo %JAVA_HOME%
# ✓ Should show: C:\Program Files\...\jbr

# Test 5: Device connected
adb devices
# ✓ Should show: emulator-5554 or your phone
```

**If ALL tests pass** → You're ready! Run `npm run android`

**If ANY test fails** → Check environment variables again

---

## 🐛 Quick Fixes

### "java not found"
- Restart terminal (environment variables only load on startup)
- Check JAVA_HOME is set correctly
- Verify path exists: `dir "C:\Program Files\Android\Android Studio\jbr"`

### "adb not found"
- Restart terminal
- Check ANDROID_HOME is set
- Verify PATH includes `%ANDROID_HOME%\platform-tools`

### "Variables set but still not working"
- **Restart your computer** (some systems need this)
- Make sure you set **System Variables**, not User Variables

---

## 🎯 After Setup

Once environment is working:

```bash
# Start Metro bundler (optional, it auto-starts)
npm start

# In another terminal, run the app
npm run android
```

**First build**: 2-3 minutes
**Subsequent builds**: 30-60 seconds

---

## 📝 Need Help?

If automated script fails:
- Follow **Manual Setup** steps above
- Or check: **MANUAL_ENV_SETUP.md** for detailed instructions

If you get errors when running app:
- Check: **FIX_ANDROID_SETUP.md** for troubleshooting

---

**Choose your method and let's get your app running! 🚀**
