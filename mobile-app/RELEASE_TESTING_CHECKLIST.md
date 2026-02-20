# Android Release Testing Checklist

This guide helps you verify that the release version of the School Management App is working correctly on your Android device.

## 1. Installation Verification
- [ ] **Uninstall Debug App**: Ensure the previous debug version is uninstalled (`adb uninstall com.schoolmgmttemp`).
- [ ] **Install Release APK**: Run `adb install app-release.apk` (or transfer the file to your phone and install).
- [ ] **Launch App**: Verify the app opens without crashing immediately.
- [ ] **SplashScreen**: Confirm the splash screen appears and transitions smoothly.

## 2. Authentication Flow
- [ ] **Tenant Selection**:
    - [ ] Search for "The Himalayan International School" (or your test tenant).
    - [ ] Verify the school logo and branding load correctly.
- [ ] **Login**:
    - [ ] Login as **Super Admin** (if applicable) or **School Admin**.
    - [ ] Login as **Teacher**.
    - [ ] Login as **Student**.
    - [ ] Login as **Parent**.
- [ ] **Login Persistance**: Close the app completely and reopen it. You should remain logged in.
- [ ] **Logout**: Verify logging out returns you to the login/tenant selection screen.

## 3. Core Functionality (Sanity Check)
### Admin
- [ ] **Dashboard**: Verify stats (Students, Teachers) load correctly from the API.
- [ ] **Student Management**: Try adding a dummy student or viewing the list.
- [ ] **Attendance**: View attendance reports.

### Teacher
- [ ] **Dashboard**: Verify the "Today's Schedule" calls the `today-view` API.
- [ ] **Attendance**: Mark attendance for a class.
- [ ] **Homework**: Create a test assignment/homework.

### Student/Parent
- [ ] **Dashboard**: Verify fees, attendance summary, and next class show up.
- [ ] **Fee Payment**:
    - [ ] Go to "Fees" tab.
    - [ ] Click "Pay Now".
    - [ ] **Critical**: Verify Razorpay opens. (Do not complete payment unless using a test card, or verify small amount).

## 4. Performance & UX
- [ ] **Scroll Performance**: Scroll through long lists (e.g., Student List). It should be smooth.
- [ ] **Navigation**: Switch between tabs (Home, Academics, Services). Transitions should be instant.
- [ ] **Network Handling**: Turn off WiFi/Data and try to refresh a page. It should show a "Network Error" or offline state, not crash.

## 5. Specific Fixes Verification
- [ ] **API URL**: Confirm data is coming from `https://www.campuskona.com/api/v1` (you can check if data matches production data).
- [ ] **Push Notifications**: If FCM is configured, send a test notification from Firebase Console and verify the app receives it.

## 6. Troubleshooting
If the app crashes:
1. Connect device to PC.
2. Run `adb logcat *:E` to see error logs.
3. Look for "caused by" or "Exception".

**Common Issues:**
- **White Screen on Launch**: Usually a JavaScript error during startup or missing native dependency.
- **Crash on Navigate**: ProGuard might have stripped a required class. (We updated `proguard-rules.pro` to prevent this).
- **Network Error**: Check internet connection and if `API_BASE_URL` is reachable.
