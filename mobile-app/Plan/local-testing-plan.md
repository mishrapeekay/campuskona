# Comprehensive Local Testing Plan for School Management Mobile App

## 1. Executive Summary
This document outlines the robust testing strategy for the School Management System mobile application. It covers environment setup, backend compatibility verification, multi-tenant validation, and a systematic testing roadmap to ensure the app meets architectural, technical, and UI/UX requirements.

**Target Environment:** Android (via Android Studio Emulator)
**Backend:** Local Django Server (running on Host Machine)
**Objective:** Validate full system integration, tenant isolation, and premium UI/UX delivery.

---

## 2. Environment Setup

### 2.1 Prerequisites
Ensure the following are installed and configured on your Windows machine:
1.  **Node.js**: LTS version (v18+).
2.  **Java Development Kit (JDK)**: Version 11 or 17 (OpenJDK recommended).
3.  **Android Studio**: Hedgehog or newer.
4.  **Python**: For the backend server.

### 2.2 Android Studio Configuration
1.  **SDK Manager**:
    *   Install Android SDK Platform 34 (Android 14).
    *   Install "Android SDK Build-Tools 34.0.0".
    *   Install "Android Emulator" and "Android SDK Platform-Tools".
2.  **Virtual Device Manager (AVD)**:
    *   Create a new device: **Pixel 6 Pro** or **Pixel 7** (for high density, large screen testing).
    *   System Image: **API 34** (UpsideDownCake) or **API 33** (Tiramisu).
    *   *Tip:* In "Advanced Settings", increase RAM to 2GB+ and Internal Storage to 4GB to prevent crashing during heavy debug sessions.

### 2.3 Local Backend Configuration
The mobile app interacts with the backend running on your host machine.
1.  **Start Backend**:
    *   Navigate to `G:\School Mgmt System\backend`.
    *   Activate virtual environment.
    *   Run: `python manage.py runserver 0.0.0.0:8000` (Binding to `0.0.0.0` ensures it is accessible from the network/emulator).
2.  **Verification**:
    *   Open browser on host: `http://localhost:8000/api/v1/health/` (or equivalent endpoint).
    *   Ensure the 2 mock tenants are seeded in the database.

---

## 3. Connectivity & Compatibility Architecture

### 3.1 Network Bridge (Host to Emulator)
The Android Emulator uses a special loopback address `10.0.2.2` to access the host's `localhost`.
*   **Mobile Config**: `src/constants/index.ts` is already configured for this:
    ```typescript
    BASE_URL: __DEV__ ? 'http://10.0.2.2:8000/api/v1' : ...
    ```
*   **Action**: No manual IP configuration changes are needed unless you are testing on a *physical* device (in which case, use your machine's LAN IP).

### 3.2 Multi-Tenancy Compatibility
The existing Web App likely uses subdomains (e.g., `tenant1.school.com`). The Mobile App handles this via **Header Injection**.
*   **Mechanism**: The `ApiClient` in `src/services/api/client.ts` injects `X-Tenant-Subdomain` into every request.
*   **Testing Requirement**: You must ensure the backend middleware accepts this header and switches the schema accordingly for `10.0.2.2` requests, even if the "Host" header is `10.0.2.2:8000`.

### 3.3 Data Consistency (Web <-> Mobile)
Since both apps share the same database:
1.  **Web Dashboard**: Log in as Super Admin to view tenant data.
2.  **Mobile App**: Log in as a User (Student/Teacher) belonging to that tenant.
3.  **Real-time Check**: Changes made in the Web Admin panel (e.g., "Add Notice") should appear in the Mobile App upon "Pull to Refresh".

---

## 4. Comprehensive Testing Strategy

### Phase 1: Smoke Testing (Health Check)
*Goal: Ensure the app builds, installs, and connects.*

1.  **Clean Build**:
    ```poweshell
    cd "G:\School Mgmt System\mobile-app"
    npm run clean
    npm install
    ```
2.  **Launch Emulator**: Open your Pixel AVD.
3.  **Run App**:
    ```powershell
    npm run android
    ```
4.  **Verification**:
    *   Does Metro Bundler start?
    *   Does the App launch to the "Tenant Selection" or "Login" screen?
    *   **CRITICAL**: Check Metro terminal for "Backend Connection Successful" logs or valid network traffic.

### Phase 2: Tenant & Authentication Flow
*Goal: Verify isolation between the two mock tenants.*

**Test Case 2.1: Tenant A Login**
1.  Launch App.
2.  Enter Tenant A Subdomain (e.g., `school-a`).
3.  Login with Mock Teacher A credentials.
4.  **Verify**: Dashboard shows data specific to School A (Header logo, School Name).

**Test Case 2.2: Tenant B Login**
1.  Logout.
2.  Enter Tenant B Subdomain (e.g., `school-b`).
3.  Login with Mock Student B credentials.
4.  **Verify**: Dashboard shows data specific to School B.
5.  **Data Isolation Check**: Ensure Student B cannot see notices/events from School A.

### Phase 3: Module-Specific Verification (Horizontal Validation)
*Based on the 'ancient-rolling-wirth.md' plan.*

#### 3.1 Dashboard (UI/UX & Data)
*   **Visual**: Check glassmorphism cards, gentle shadows `MODERN_SHADOWS`, and gradient headers.
*   **Data**: Compare "Attendance %" on Mobile vs Web Dashboard for the same student.
*   **Interaction**: Test "Pull to Refresh" to update stats.

#### 3.2 Attendance (Teacher Flow)
*   **Action**: Use "Bulk Attendance" mode.
*   **Step**: Mark 3 students absent, 1 late. Submit.
*   **Verify**: 
    1.  Toast "Attendance Submitted".
    2.  Check Web Portal: Do those students show as Absent for today?

#### 3.3 Academics & Timetable
*   **Action**: Open Timetable tab.
*   **Verify**: Grid renders correctly without overflow issues. Current period highlighted.

#### 3.4 Library
*   **Action**: Search for a book "Harry Potter".
*   **Verify**: Results load from backend. Images (if any) display correctly.

### Phase 4: UI/UX & Premium Aesthetic Audit
*As the "Main Designer", rigorous visual testing is required.*

1.  **Typography**: Ensure `Roboto` (Android) loads correctly. No default system serif fonts.
2.  **Spacing**: Verify consistent 8px/16px usage. No crowded elements.
3.  **Dark Mode (If implemented)**: Toggle device theme. Ensure text remains readable (contrast check).
4.  **Animations**:
    *   Page transitions (Stack navigation slide).
    *   Button press feedback (Ripple effect).
    *   Loading skeletons instead of blank screens.

---

## 5. Automated Teting Plan (Unit & Integration)

While manual testing covers flows, automated tests ensure stability.

### 5.1 Unit Tests (Jest)
Run `npm test`.
*   **Focus**: `src/utils/`, `src/store/slices/`.
*   **Coverage Goal**: 80% on business logic (e.g., GPA calculation, Attendance summary logic).

### 5.2 Component Snapshots
*   Create snapshot tests for complex UI components (`TimetableGrid`, `GradeCard`) to prevent regression in styling.

---

## 6. Compatibility Matrix Checklist

| Feature | Web App (Source of Truth) | Mobile App (Client) | Status |
| :--- | :--- | :--- | :--- |
| **Auth** | Login (Session/JWT) | Login (JWT + Refresh Token) | 🔲 |
| **Tenants** | Subdomain Routing | Header (`X-Tenant-Subdomain`) | 🔲 |
| **Students**| Full Record Management | Read-Only Profile + Edit specific fields | 🔲 |
| **Fees** | Create Invoices | View Invoices + Mock Pay | 🔲 |
| **Files** | Upload S3/Local | PDF Viewer / Image Preview | 🔲 |

---

## 7. Troubleshooting Common Issues

*   **Error: "Network Request Failed"**:
    *   Check if backend is running on `0.0.0.0:8000`.
    *   Verify `src/constants/index.ts` has `http://10.0.2.2:8000...`.
    *   Run `adb reverse tcp:8000 tcp:8000` (optional fix if standard loopback fails).
*   **Error: "Gradle Build Failed"**:
    *   Ensure JDK 17 is set in `JAVA_HOME`.
    *   Run `cd android && ./gradlew clean`.
*   **Red Screen (Runtime Error)**:
    *   Check Metro logs.
    *   Reset Cache: `npm start -- --reset-cache`.

## 8. Next Steps
1.  Execute **Phase 1 (Smoke Test)** immediately.
2.  Perform **Phase 2 (Tenant Check)** using the mock data.
3.  Report implementation gaps back to the development roadmap.
