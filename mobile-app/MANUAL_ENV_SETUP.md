# Manual Environment Variables Setup

If the automated script doesn't work, follow these manual steps:

## Step 1: Find Your SDK Location

1. **Open Android Studio**
2. Click **Configure** or **More Actions** → **SDK Manager**
3. At the top, you'll see **"Android SDK Location"**
4. **Copy this path** (example: `C:\Users\YourName\AppData\Local\Android\Sdk`)

## Step 2: Set Environment Variables Manually

### A. Open Environment Variables Window

1. Press **Windows Key**
2. Type: **"environment variables"**
3. Click: **"Edit the system environment variables"**
4. Click: **"Environment Variables"** button at the bottom

### B. Set ANDROID_HOME

1. Under **"System variables"** (bottom section), click **"New"**
2. **Variable name**: `ANDROID_HOME`
3. **Variable value**: Paste your SDK path from Step 1
   - Example: `C:\Users\YourName\AppData\Local\Android\Sdk`
4. Click **"OK"**

### C. Set JAVA_HOME

1. Still in **System variables**, click **"New"** again
2. **Variable name**: `JAVA_HOME`
3. **Variable value**: `C:\Program Files\Android\Android Studio\jbr`
   - *(This is Android Studio's bundled Java)*
4. Click **"OK"**

### D. Update PATH Variable

1. Find **"Path"** in System variables
2. Click **"Edit"**
3. Click **"New"** and add each of these paths (one at a time):

   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   %JAVA_HOME%\bin
   ```

4. Click **"OK"** on all windows

## Step 3: Verify Setup

**IMPORTANT**: Close ALL terminal windows and open a NEW one.

Then run:

```bash
# Should show Java version
java -version

# Should show ADB version
adb version

# Should show your SDK path
echo %ANDROID_HOME%

# Should show JDK path
echo %JAVA_HOME%
```

**If all commands work**, you're done! ✅

## Screenshots Guide

### Finding SDK Location
```
Android Studio
  └─ More Actions
      └─ SDK Manager
          └─ Android SDK Location: [Copy this path]
```

### Setting Environment Variables
```
Windows Settings
  └─ System
      └─ About
          └─ Advanced system settings
              └─ Environment Variables
                  └─ System variables
                      └─ New...
```

## Common Paths

**SDK Path** (usually):
- `C:\Users\YourName\AppData\Local\Android\Sdk`

**JDK Path** (usually):
- `C:\Program Files\Android\Android Studio\jbr`

## Troubleshooting

### "Cannot find path"
- Make sure to use **System Variables**, not User Variables
- Check that the path actually exists (paste it in File Explorer)

### "Access Denied"
- Close File Explorer and any programs using Android tools
- Try again

### "Still not working after setting"
- **Restart your computer** (environment variables load at startup)
- Open a **completely new** terminal

## After Setup

Once all commands work, run:

```bash
cd "G:\School Mgmt System\mobile-app"
npm run android
```

Your app should build! 🚀
