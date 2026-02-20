# Testing Guide: Android Release Build

## 1. Prerequisites
To test the release build on your physical Android device:

1.  **Enable Developer Options**:
    *   Go to **Settings > About Phone**.
    *   Tap **Build Number** 7 times until you see "You are now a developer".
2.  **Enable USB Debugging**:
    *   Go to **Settings > System > Developer Options**.
    *   Enable **USB debugging**.
3.  **Connect via USB**:
    *   Connect your phone to the computer.
    *   Accept the "Allow USB debugging" prompt on your phone screen.

## 2. Verify Connection
Run the following command in your terminal:
```bash
adb devices
```
You should see your device listed (e.g., `ZP2019... device`).

## 3. Install the App
Run this command from the `mobile-app` directory:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Troubleshooting Installation
If you see an error like `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, it means you have a debug version installed. Uninstall it first:

```bash
adb uninstall com.schoolmgmttemp
# Then try installing again
adb install android/app/build/outputs/apk/release/app-release.apk
```

## 4. What to Test
1.  **Launch**: Open the app. It should not show a "Metro" connection warning (since it's a release build).
2.  **API Connection**: Attempt to login.
    *   The app is configured to connect to `https://www.campuskona.com/api/v1`.
    *   If login fails with a network error, check your internet connection.
3.  **Performance**: The app should feel smoother than debug mode (ProGuard enabled).

## 5. Sharing the APK
You can also copy the APK file to your phone manually:
*   **File Path**: `g:\School Mgmt System\mobile-app\android\app\build\outputs\apk\release\app-release.apk`
*   Transfer it via USB, Google Drive, or WhatsApp, and install it directly on the phone (you may need to allow "Install unknown apps").
