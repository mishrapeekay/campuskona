# Mobile App Deployment Guide

Complete guide for deploying the School Management System mobile application to Google Play Store and Apple App Store.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Android Deployment](#android-deployment)
3. [iOS Deployment](#ios-deployment)
4. [Firebase Configuration](#firebase-configuration)
5. [CI/CD Setup](#cicd-setup)
6. [Testing](#testing)
7. [Release Management](#release-management)

---

## 1. Pre-Deployment Checklist

### Code Preparation

- [ ] All features implemented and tested
- [ ] No console.log statements in production code
- [ ] All API endpoints point to production server
- [ ] Environment variables configured correctly
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Offline support tested
- [ ] Push notifications configured

### Assets

- [ ] App icon created (1024x1024 for iOS, 512x512 for Android)
- [ ] Splash screen created
- [ ] Screenshots prepared for app stores (multiple device sizes)
- [ ] App description written
- [ ] Privacy policy prepared
- [ ] Terms of service prepared

### Configuration

- [ ] Update app version in `package.json`
- [ ] Update build number
- [ ] Configure release signing
- [ ] Set production API URL
- [ ] Configure Firebase project

---

## 2. Android Deployment

### Step 1: Generate Signing Key

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 \
  -keystore school-mgmt-release.keystore \
  -alias school-mgmt-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Important**: Save the keystore file and passwords securely!

### Step 2: Configure Gradle Signing

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    defaultConfig {
        applicationId "com.schoolmgmt.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Set Gradle Properties

Create `android/gradle.properties` (or edit existing):

```properties
MYAPP_RELEASE_STORE_FILE=school-mgmt-release.keystore
MYAPP_RELEASE_KEY_ALIAS=school-mgmt-key
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password

# Increase memory for builds
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
```

**Security Note**: Add `gradle.properties` to `.gitignore`!

### Step 4: Configure ProGuard (Optional)

Edit `android/app/proguard-rules.pro`:

```proguard
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.swmansion.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep model classes
-keep class com.schoolmgmt.app.models.** { *; }
```

### Step 5: Build Release APK

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 6: Build App Bundle (for Google Play)

```bash
cd android
./gradlew bundleRelease
```

AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 7: Test the Release Build

```bash
# Install on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or use bundletool for AAB
bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=app.apks \
  --mode=universal

bundletool install-apks --apks=app.apks
```

### Step 8: Google Play Console Setup

1. **Create Google Play Console Account**
   - Go to https://play.google.com/console
   - Pay one-time $25 registration fee

2. **Create App**
   - Click "Create app"
   - Fill in app details:
     - App name: School Management System
     - Default language: English
     - App or game: App
     - Free or paid: Free/Paid

3. **Store Listing**
   - Short description (80 chars max)
   - Full description (4000 chars max)
   - Screenshots (minimum 2 per type)
   - Feature graphic (1024 x 500)
   - App icon (512 x 512)

4. **Content Rating**
   - Fill out questionnaire
   - Get rating certificate

5. **App Access**
   - Specify if login required
   - Provide test credentials if needed

6. **Privacy Policy**
   - Add privacy policy URL

7. **Upload App Bundle**
   - Go to "Production" → "Create new release"
   - Upload AAB file
   - Add release notes
   - Review and rollout

### Step 9: Version Management

Update version for each release in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2        // Increment by 1 for each release
    versionName "1.0.1"  // Semantic versioning
}
```

---

## 3. iOS Deployment

### Step 1: Configure Xcode Project

1. Open `ios/SchoolManagementApp.xcworkspace` in Xcode
2. Select project → General tab
3. Update:
   - Display Name: School Management System
   - Bundle Identifier: com.schoolmgmt.app
   - Version: 1.0.0
   - Build: 1

### Step 2: Configure Signing

1. Select project → Signing & Capabilities
2. Choose Team
3. Enable "Automatically manage signing"
4. Or manually configure provisioning profiles

### Step 3: Configure App Icons

1. Add icon set to `ios/SchoolManagementApp/Images.xcassets/AppIcon.appiconset/`
2. Required sizes:
   - 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### Step 4: Configure Launch Screen

Edit `ios/SchoolManagementApp/LaunchScreen.storyboard`

### Step 5: Update Info.plist

Add required permissions in `ios/SchoolManagementApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture photos for profiles and documents</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location access for bus tracking</string>

<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for video calls</string>
```

### Step 6: Build for Release

```bash
# Clean build
cd ios
xcodebuild clean -workspace SchoolManagementApp.xcworkspace -scheme SchoolManagementApp

# Archive
xcodebuild -workspace SchoolManagementApp.xcworkspace \
  -scheme SchoolManagementApp \
  -sdk iphoneos \
  -configuration Release \
  -archivePath $PWD/build/SchoolManagementApp.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath $PWD/build/SchoolManagementApp.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath $PWD/build
```

### Step 7: App Store Connect Setup

1. **Create Apple Developer Account**
   - Go to https://developer.apple.com
   - Enroll in Apple Developer Program ($99/year)

2. **App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Click "+" to add new app
   - Fill in app information:
     - Platform: iOS
     - Name: School Management System
     - Primary Language: English
     - Bundle ID: com.schoolmgmt.app
     - SKU: unique identifier

3. **App Information**
   - Subtitle (30 chars)
   - Description (4000 chars max)
   - Keywords (100 chars max, comma-separated)
   - Support URL
   - Marketing URL (optional)

4. **Pricing and Availability**
   - Set price tier (Free or Paid)
   - Select countries/regions

5. **Screenshots**
   Required sizes:
   - 6.5" Display (iPhone 14 Pro Max, etc.)
   - 5.5" Display (iPhone 8 Plus, etc.)
   - 12.9" Display (iPad Pro 12.9", etc.)

6. **Upload Build**
   ```bash
   # Using Application Loader or Xcode
   xcodebuild -exportArchive \
     -archivePath build/SchoolManagementApp.xcarchive \
     -exportPath build \
     -exportOptionsPlist ExportOptions.plist

   # Or use Transporter app
   ```

7. **Submit for Review**
   - Add app review information
   - Add contact information
   - Add demo account credentials (if login required)
   - Submit

### Step 8: Version Management

Update version in Xcode:
- Version: 1.0.1 (user-facing version)
- Build: 2 (increment for each submission)

---

## 4. Firebase Configuration

### Android Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Add project

2. **Add Android App**
   - Package name: com.schoolmgmt.app
   - Download `google-services.json`
   - Place in `android/app/`

3. **Update build.gradle**

`android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

`android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'
}
```

### iOS Setup

1. **Add iOS App to Firebase**
   - Bundle ID: com.schoolmgmt.app
   - Download `GoogleService-Info.plist`
   - Add to Xcode project

2. **Update Podfile**

```ruby
platform :ios, '13.0'

target 'SchoolManagementApp' do
  pod 'Firebase/Analytics'
  pod 'Firebase/Messaging'
end
```

3. **Install Pods**

```bash
cd ios
pod install
```

4. **Configure AppDelegate**

Already configured in React Native Firebase setup.

### Cloud Messaging Setup

1. **Android**: Configure FCM in Firebase Console
2. **iOS**: Upload APNs certificate or key
3. **Test notifications** using Firebase Console

---

## 5. CI/CD Setup

### GitHub Actions

Create `.github/workflows/android.yml`:

```yaml
name: Android Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Cache Gradle
      uses: actions/cache@v3
      with:
        path: |
          ~/.gradle/caches
          ~/.gradle/wrapper
        key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}

    - name: Build Android Release
      run: |
        cd android
        ./gradlew assembleRelease

    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release
        path: android/app/build/outputs/apk/release/app-release.apk
```

Create `.github/workflows/ios.yml`:

```yaml
name: iOS Build

on:
  push:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Install Pods
      run: |
        cd ios
        pod install

    - name: Build iOS
      run: |
        cd ios
        xcodebuild -workspace SchoolManagementApp.xcworkspace \
          -scheme SchoolManagementApp \
          -sdk iphoneos \
          -configuration Release \
          build
```

### Fastlane Setup (Optional)

```bash
# Install Fastlane
sudo gem install fastlane

# Initialize
cd android
fastlane init

cd ../ios
fastlane init
```

---

## 6. Testing

### Pre-Release Testing Checklist

#### Functional Testing
- [ ] Login/Logout works correctly
- [ ] All dashboards load properly
- [ ] API calls succeed
- [ ] Data persistence works
- [ ] Offline mode functions correctly
- [ ] Push notifications received
- [ ] Deep linking works
- [ ] File uploads work
- [ ] Payment gateway integration (if applicable)

#### Device Testing
- [ ] Test on multiple Android devices (different versions)
- [ ] Test on multiple iOS devices (different versions)
- [ ] Test on tablets
- [ ] Test different screen sizes
- [ ] Test landscape/portrait modes

#### Performance Testing
- [ ] App launches quickly
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Efficient battery usage
- [ ] Low data consumption

#### Security Testing
- [ ] Secure token storage
- [ ] HTTPS only
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

### Beta Testing

#### Android (Google Play)

1. Create Internal Testing track
2. Upload AAB
3. Invite testers via email
4. Collect feedback

#### iOS (TestFlight)

1. Upload build to App Store Connect
2. Add external testers
3. Submit for beta review
4. Distribute to testers

---

## 7. Release Management

### Version Numbering

Follow Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH

Example: 1.2.3

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes
```

### Release Process

1. **Create Release Branch**
   ```bash
   git checkout -b release/1.0.0
   ```

2. **Update Version Numbers**
   - package.json
   - Android: build.gradle (versionCode, versionName)
   - iOS: Xcode project (Version, Build)

3. **Build and Test**
   - Run all tests
   - Build release versions
   - Test on real devices

4. **Create Release Notes**
   - List new features
   - List bug fixes
   - List breaking changes

5. **Tag Release**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

6. **Deploy**
   - Upload to Google Play
   - Upload to App Store
   - Update release notes

7. **Monitor**
   - Check crash reports
   - Monitor user feedback
   - Track analytics

### Post-Release

- Monitor app store reviews
- Track crash reports (Firebase Crashlytics)
- Collect user feedback
- Plan next release

---

## Troubleshooting

### Android Issues

**Build Fails with "Execution failed for task ':app:lintVitalRelease'"**
```gradle
// android/app/build.gradle
android {
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
}
```

**App Crashes on Release Build**
- Check ProGuard rules
- Ensure all dependencies are included
- Test debug build thoroughly first

### iOS Issues

**Archive Validation Fails**
- Check provisioning profiles
- Verify bundle identifier
- Ensure all capabilities are configured

**App Rejected for Missing Description**
- Add all required usage descriptions in Info.plist
- Provide clear explanations for permissions

---

## Useful Commands

### Android
```bash
# List connected devices
adb devices

# Install APK
adb install app-release.apk

# View logs
adb logcat

# Clear app data
adb shell pm clear com.schoolmgmt.app
```

### iOS
```bash
# List simulators
xcrun simctl list devices

# Install on simulator
xcrun simctl install booted build/SchoolManagementApp.app

# View logs
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "SchoolManagementApp"'
```

---

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Fastlane Documentation](https://docs.fastlane.tools/)

---

**Last Updated**: January 2026
