# Mobile App Android Deployment Plan

## 1. Analysis & Gap Resolution (Completed)
We have analyzed the mobile app codebase and identified discrepancies with the new web application (`https://www.campuskona.com`).

### 1.1 Critical Fixes Applied
- **API Endpoint Sync**: Updated `src/constants/index.ts` to point to `https://www.campuskona.com/api/v1` in production.
- **Environment config**: Updated `.env.production` to match the correct API URL.
- **Logging**: Disabled verbose tenant logging in production (`client.ts`).
- **Release Preparation**:
  - Enabled **ProGuard** in `android/app/build.gradle`.
  - Generated a **Release Keystore** (`release.keystore`) for signing.
  - Configured `signingConfigs.release` to use the generated keystore.

### 1.2 Remaining Gaps (Non-Blocking for Initial Release)
- **Sentry**: Initialization is missing. Using default error boundaries for now.
- **Push Notifications**: Currently commented out. Can be enabled in a future update.
- **iOS Config**: Project name mismatch on iOS side (ignored for Android deployment).
- **Razorpay Key**: Uses a placeholder (`rzp_test_change_this`). **Action Required**: Update this key in `src/constants/index.ts` or via backend config before going live if payments are critical.

## 2. Deployment Steps

### 2.1 Build Release APK/Bundle
You can now build the signed release APK/AAB.

**Command:**
```bash
cd android
./gradlew assembleRelease
```
*Output*: `android/app/build/outputs/apk/release/app-release.apk`

### 2.2 Verify Artifact
1. Install the APK on a physical device.
2. Verify it connects to `https://www.campuskona.com`.
3. Check login and dashboard data sync.

### 2.3 Play Store Upload (Manual)
1. Create an app entry in Google Play Console.
2. Upload the `app-release.aab` (run `./gradlew bundleRelease` for AAB).
3. Fill in store listing details (Title, Description, Screenshots).

## 3. Post-Deployment
- Monitor `Sentry` (once enabled) or Firebase Crashlytics.
- Verify Push Notifications when enabled.
- Monitor API logs on `https://www.campuskona.com` for any mobile-specific errors.
