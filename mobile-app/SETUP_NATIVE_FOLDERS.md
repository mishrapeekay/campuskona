# Setting Up Native Android & iOS Folders

Your mobile app code is complete, but we need to add the native Android and iOS folders. Here are your options:

## Option 1: Create New React Native Project & Copy Code (Recommended)

This is the cleanest approach:

### Step 1: Create a Fresh React Native Project

```bash
# Go to a different directory (not inside mobile-app)
cd "G:\School Mgmt System"

# Create a new React Native project
npx react-native@0.73.2 init SchoolManagementAppTemp
```

### Step 2: Copy Native Folders

```bash
# Copy android and ios folders to your mobile-app directory
xcopy "SchoolManagementAppTemp\android" "mobile-app\android" /E /I /H
xcopy "SchoolManagementAppTemp\ios" "mobile-app\ios" /E /I /H

# On Linux/Mac use:
# cp -r SchoolManagementAppTemp/android mobile-app/
# cp -r SchoolManagementAppTemp/ios mobile-app/
```

### Step 3: Update Configuration Files

Copy these files from temp project to mobile-app:
```bash
copy "SchoolManagementAppTemp\metro.config.js" "mobile-app\"
copy "SchoolManagementAppTemp\.watchmanconfig" "mobile-app\"
copy "SchoolManagementAppTemp\react-native.config.js" "mobile-app\" 2>nul
```

### Step 4: Update App Name in Native Code

**Android** (`android/app/src/main/res/values/strings.xml`):
```xml
<string name="app_name">School Management</string>
```

**iOS** (`ios/SchoolManagementApp/Info.plist`):
```xml
<key>CFBundleDisplayName</key>
<string>School Management</string>
```

### Step 5: Link Vector Icons

**Android** (`android/app/build.gradle`):
```gradle
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

**iOS**: Run pod install
```bash
cd ios
pod install
cd ..
```

### Step 6: Clean Up
```bash
# Delete temp project
rmdir /s "G:\School Mgmt System\SchoolManagementAppTemp"
```

---

## Option 2: Use Expo (Simpler but Different Workflow)

If you want a simpler setup without dealing with native code:

### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
```

### Step 2: Convert to Expo
This requires modifying your app structure slightly, but avoids native folder complexity.

**Note**: This changes some aspects of your project, so Option 1 is recommended.

---

## Option 3: Download Template Native Folders

I can provide you with a ZIP file containing pre-configured android and ios folders for React Native 0.73.2.

### What You Need:
1. Download the native folders template
2. Extract to your mobile-app directory
3. Run `npm install`
4. For iOS: `cd ios && pod install && cd ..`
5. Run the app

---

## After Setup - Running the App

Once you have android/ios folders:

### Start Metro Bundler:
```bash
npm start
```

### Run on Android:
```bash
npm run android
```

### Run on iOS (macOS only):
```bash
npm run ios
```

---

## Quick Check - Do You Have These?

After setup, verify you have:
- ✅ `android/` folder with gradle files
- ✅ `ios/` folder with .xcworkspace
- ✅ `metro.config.js`
- ✅ `.watchmanconfig`

---

## Troubleshooting

### Error: "Could not find or load main class org.gradle.wrapper.GradleWrapperMain"
```bash
cd android
./gradlew wrapper --gradle-version 8.3
cd ..
```

### Error: "No Podfile found"
```bash
cd ios
pod init
pod install
cd ..
```

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

---

## Need Help?

If you encounter issues with any of these steps, let me know and I can help debug!
