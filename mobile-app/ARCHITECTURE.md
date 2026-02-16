# Mobile App Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SCHOOL MANAGEMENT SYSTEM                         │
│                            Mobile Application                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Admin     │  │   Teacher   │  │   Student   │  │   Parent    │  │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Feature Screens                               │  │
│  ├──────────────┬──────────────┬──────────────┬──────────────────┤  │
│  │ Attendance   │ Examinations │ Fee Payment  │ Library          │  │
│  │ Management   │ & Marks      │ & Invoices   │ Operations       │  │
│  ├──────────────┼──────────────┼──────────────┼──────────────────┤  │
│  │ Transport    │ Communication│ Student      │ Staff            │  │
│  │ Tracking     │ & Notices    │ Management   │ Management       │  │
│  └──────────────┴──────────────┴──────────────┴──────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NAVIGATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ React Navigation v6                                               │  │
│  ├────────────────┬─────────────────────┬──────────────────────────┤  │
│  │ Stack Navigator│  Tab Navigator      │ Drawer Navigator         │  │
│  │ (Auth Flow)    │  (Role-based Tabs)  │ (Settings Menu)          │  │
│  └────────────────┴─────────────────────┴──────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       STATE MANAGEMENT LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Redux Toolkit Store                                               │  │
│  ├────────┬────────┬────────┬────────┬────────┬────────┬──────────┤  │
│  │ Auth   │ User   │ Tenant │Student │Attendance│Exam   │   Fee    │  │
│  │ Slice  │ Slice  │ Slice  │ Slice  │  Slice  │ Slice │  Slice   │  │
│  ├────────┼────────┼────────┼────────┼─────────┼───────┼──────────┤  │
│  │Library │Transport│Notice │ Cache  │Offline │ ...   │   ...    │  │
│  │ Slice  │ Slice  │ Slice  │Manager │ Queue  │       │          │  │
│  └────────┴────────┴────────┴────────┴─────────┴───────┴──────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Redux Persist                                                     │  │
│  │ - AsyncStorage for tokens & user data                            │  │
│  │ - Automatic rehydration on app launch                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ API Services (TypeScript)                                         │  │
│  ├──────────────┬──────────────┬──────────────┬───────────────────┤  │
│  │ authService  │studentService│attendanceServ│  examService      │  │
│  ├──────────────┼──────────────┼──────────────┼───────────────────┤  │
│  │ feeService   │libraryService│transportServ │communicationServ  │  │
│  └──────────────┴──────────────┴──────────────┴───────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Utility Services                                                  │  │
│  ├──────────────────────┬───────────────────────────────────────────┤  │
│  │ storageService       │ - MMKV for high-performance caching       │  │
│  │                      │ - Cache expiry management                 │  │
│  │                      │ - Offline sync queue                      │  │
│  ├──────────────────────┼───────────────────────────────────────────┤  │
│  │ notificationService  │ - FCM token management                    │  │
│  │                      │ - Push notification handling              │  │
│  │                      │ - Topic subscription                      │  │
│  └──────────────────────┴───────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER (API Client)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Axios HTTP Client                                                 │  │
│  │                                                                    │  │
│  │ REQUEST INTERCEPTOR:                                              │  │
│  │ ✓ Add Authorization: Bearer {access_token}                        │  │
│  │ ✓ Add X-Tenant-Subdomain: {tenant_subdomain}                     │  │
│  │ ✓ Set Content-Type headers                                        │  │
│  │                                                                    │  │
│  │ RESPONSE INTERCEPTOR:                                             │  │
│  │ ✓ Handle 401 (Auto token refresh)                                 │  │
│  │ ✓ Handle 403 (Permission denied)                                  │  │
│  │ ✓ Handle network errors                                           │  │
│  │ ✓ Error normalization                                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Django)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Base URL: https://api.schoolmgmt.com/api/v1                           │
│                                                                          │
│  Endpoints:                                                              │
│  ├─ /auth/              - Authentication & Authorization                │
│  ├─ /students/          - Student Management                            │
│  ├─ /staff/             - Staff Management                              │
│  ├─ /academics/         - Academic Structure                            │
│  ├─ /attendance/        - Attendance Tracking                           │
│  ├─ /examinations/      - Exams & Grading                              │
│  ├─ /finance/           - Fee Management                                │
│  ├─ /library/           - Library Operations                            │
│  ├─ /transport/         - Transport Management                          │
│  └─ /communication/     - Notices & Events                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐          ┌────────────────────────────────────┐    │
│  │ Public Schema  │          │ Tenant Schemas (Per School)        │    │
│  ├────────────────┤          ├────────────────────────────────────┤    │
│  │ - Schools      │          │ - Users (School-specific)          │    │
│  │ - Subscriptions│          │ - Students                         │    │
│  │ - Domains      │          │ - StaffMembers                     │    │
│  │ - TenantConfig │          │ - Classes & Subjects               │    │
│  │ - Super Admins │          │ - Attendance Records               │    │
│  └────────────────┘          │ - Exam Results                     │    │
│                              │ - Fee Records                      │    │
│                              │ - Library Transactions             │    │
│                              │ - Transport Allocations            │    │
│                              │ - Notices & Events                 │    │
│                              └────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          UI COMPONENT HIERARCHY                          │
└─────────────────────────────────────────────────────────────────────────┘

App.tsx
 │
 ├─ GestureHandlerRootView
 │   │
 │   ├─ SafeAreaProvider
 │   │   │
 │   │   ├─ Redux Provider
 │   │   │   │
 │   │   │   ├─ PersistGate
 │   │   │   │   │
 │   │   │   │   ├─ PaperProvider (Material Design)
 │   │   │   │   │   │
 │   │   │   │   │   └─ AppNavigator
 │   │   │   │   │       │
 │   │   │   │   │       ├─ Auth Stack (if not authenticated)
 │   │   │   │   │       │   ├─ LoginScreen
 │   │   │   │   │       │   ├─ RegisterScreen
 │   │   │   │   │       │   └─ ForgotPasswordScreen
 │   │   │   │   │       │
 │   │   │   │   │       ├─ Tenant Selection (if no tenant)
 │   │   │   │   │       │   └─ TenantSelectionScreen
 │   │   │   │   │       │
 │   │   │   │   │       └─ Main Navigator (authenticated)
 │   │   │   │   │           │
 │   │   │   │   │           └─ Bottom Tab Navigator (Role-based)
 │   │   │   │   │               │
 │   │   │   │   │               ├─ Dashboard Tab
 │   │   │   │   │               │   ├─ AdminDashboard
 │   │   │   │   │               │   ├─ TeacherDashboard
 │   │   │   │   │               │   ├─ StudentDashboard
 │   │   │   │   │               │   └─ ParentDashboard
 │   │   │   │   │               │
 │   │   │   │   │               ├─ Feature Tabs (based on role)
 │   │   │   │   │               │   ├─ AttendanceScreen
 │   │   │   │   │               │   ├─ ExamScreen
 │   │   │   │   │               │   ├─ FeeScreen
 │   │   │   │   │               │   ├─ LibraryScreen
 │   │   │   │   │               │   └─ TransportScreen
 │   │   │   │   │               │
 │   │   │   │   │               └─ Profile Tab
 │   │   │   │   │                   └─ ProfileScreen
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UNIDIRECTIONAL DATA FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

                          USER INTERACTION
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   UI Component         │
                    │   (e.g., Button Click) │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Dispatch Action      │
                    │   (Redux Thunk)        │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   API Service Call     │
                    │   (Axios Request)      │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Backend API          │
                    │   (Django REST)        │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Database Query       │
                    │   (PostgreSQL)         │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Response Data        │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Update Redux State   │
                    │   (Reducer)            │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Re-render Component  │
                    │   (useSelector hook)   │
                    └────────────────────────┘
                                 │
                                 ▼
                          UPDATED UI
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

User Opens App
      │
      ▼
Check Stored Tokens
      │
      ├─ No Tokens? ──────────────────────────────┐
      │                                            │
      ▼                                            ▼
Access Token Valid?                         Login Screen
      │                                            │
      ├─ Yes ────────────────────┐                │
      │                           │                │
      ▼                           │                ▼
Check Tenant Selection            │         User Enters Credentials
      │                           │                │
      ├─ No Tenant? ──────┐      │                │
      │                    │      │                ▼
      ▼                    │      │         POST /auth/login/
Main Dashboard             │      │                │
      │                    │      │                │
      ▼                    │      │                ▼
Tenant Selection Screen ◄──┘      │         Receive JWT Tokens
      │                           │                │
      │                           │                ├─ Store access_token
      ▼                           │                ├─ Store refresh_token
Select Tenant ────────────────────┘                └─ Store user_data
      │                                            │
      │                                            ▼
      │◄───────────────────────────────────  Set isAuthenticated = true
      │                                            │
      ▼                                            ▼
Role-based Dashboard                         Role-based Dashboard


┌─────────────────────────────────────────────────────────────────────────┐
│                         TOKEN REFRESH FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

API Request with Access Token
      │
      ▼
Backend Returns 401 Unauthorized
      │
      ▼
Axios Interceptor Catches Error
      │
      ▼
Check if Refresh Already in Progress
      │
      ├─ Yes ──► Add to Queue ──► Wait for New Token
      │                                  │
      ▼                                  ▼
POST /auth/refresh/ with refresh_token   Retry Original Request
      │                                        with New Token
      │
      ├─ Success ──────────────────┐
      │                             │
      ▼                             ▼
Store New Access Token      Process Queued Requests
      │                             │
      │                             │
      ▼                             ▼
Retry Original Request        Return Responses
      │
      │
      ├─ Refresh Token Expired ────────────────┐
      │                                         │
      ▼                                         ▼
Clear All Tokens                          Redirect to Login
```

---

## Offline Support Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       OFFLINE-FIRST ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────┘

User Action (e.g., Mark Attendance)
      │
      ▼
Check Network Status
      │
      ├─────────────────────────┬──────────────────────────┐
      │                         │                          │
      ▼                         ▼                          ▼
  ONLINE                    OFFLINE                  AIRPLANE MODE
      │                         │                          │
      │                         │                          │
      ▼                         ▼                          ▼
Make API Call          Add to Sync Queue           Add to Sync Queue
      │                         │                          │
      │                         ├─ Store in MMKV          ├─ Store in MMKV
      ▼                         ├─ Update UI (Optimistic) ├─ Update UI
Success Response                └─ Show "Offline" Badge   └─ Show "Offline" Badge
      │
      │
      ▼
Update Redux State
      │
      ▼
Cache Response (with TTL)
      │
      ▼
Update UI


┌─────────────────────────────────────────────────────────────────────────┐
│                         SYNC QUEUE PROCESSING                            │
└─────────────────────────────────────────────────────────────────────────┘

Network Connection Restored
      │
      ▼
Check Sync Queue
      │
      ├─ Empty? ──────────────────────────────► Do Nothing
      │
      ▼
Get Queued Operations
      │
      ▼
Sort by Timestamp
      │
      ▼
Process Operations Sequentially
      │
      ├─ For Each Operation:
      │   │
      │   ├─ Make API Call
      │   │    │
      │   │    ├─ Success ──► Remove from Queue
      │   │    │                    │
      │   │    │                    ▼
      │   │    │              Update UI Status
      │   │    │
      │   │    └─ Failure ──► Keep in Queue
      │   │                        │
      │   │                        ▼
      │   │                  Retry Later (with backoff)
      │   │
      │   └─ Next Operation
      │
      ▼
All Operations Synced
      │
      ▼
Show Success Notification
```

---

## Push Notification Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PUSH NOTIFICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

App Launch
    │
    ▼
Request Notification Permission
    │
    ├─ Granted ─────────────────┐
    │                            │
    ▼                            ▼
Request FCM Token          Save Permission Status
    │
    ▼
Get FCM Token
    │
    ├─ Send to Backend ──────────────┐
    │                                 │
    ▼                                 ▼
Store Token Locally           Backend Stores Token
    │                         (Associated with User)
    │
    ▼
Subscribe to Topics
    │
    ├─ User Role Topic (e.g., "teachers")
    ├─ School/Tenant Topic (e.g., "school_veda")
    └─ Custom Topics (e.g., "class_10A")


┌─────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION HANDLING                                 │
└─────────────────────────────────────────────────────────────────────────┘

Firebase Cloud Messaging Sends Notification
    │
    ├─────────────────────┬─────────────────────┬──────────────────────┐
    │                     │                     │                      │
    ▼                     ▼                     ▼                      ▼
APP FOREGROUND       APP BACKGROUND       APP QUIT STATE      NOTIFICATION TAPPED
    │                     │                     │                      │
    │                     │                     │                      │
    ▼                     ▼                     ▼                      ▼
onMessage Handler   Background Handler   Background Handler   onNotificationOpened
    │                     │                     │                      │
    │                     │                     │                      │
    ▼                     ▼                     ▼                      ▼
Show In-App         System Notification  System Notification  Open App +
Notification        (OS handles)         (OS handles)         Navigate to Screen
    │                                                                  │
    │                                                                  │
    ▼                                                                  ▼
User Interacts ──────────────────────────────────────────────► Deep Link Handler
    │                                                                  │
    │                                                                  │
    ▼                                                                  ▼
Parse Payload                                                   Navigate to
    │                                                           Relevant Screen
    │                                                           (e.g., NoticeDetails)
    ▼
Navigate to Screen
    │
    ▼
Update Redux State
(e.g., Mark as Read)
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: Transport Security                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ HTTPS/TLS for all API communication                                   │
│ ✓ Certificate pinning (optional, for production)                        │
│ ✓ No plain HTTP allowed                                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: Authentication & Authorization                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ JWT-based authentication                                              │
│ ✓ Short-lived access tokens (15 min)                                    │
│ ✓ Refresh token rotation                                                │
│ ✓ Token stored in secure storage (AsyncStorage)                         │
│ ✓ Role-based access control (RBAC)                                      │
│ ✓ Permission-based feature access                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: Data Protection                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Encrypted storage for sensitive data                                  │
│ ✓ No sensitive data in logs                                             │
│ ✓ Secure deletion on logout                                             │
│ ✓ Input validation and sanitization                                     │
│ ✓ XSS prevention                                                         │
│ ✓ SQL injection prevention (backend)                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: Application Security                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Obfuscated release builds (ProGuard/R8)                              │
│ ✓ No debug logs in production                                           │
│ ✓ Secure random number generation                                       │
│ ✓ Protected against screenshot (sensitive screens)                      │
│ ✓ Jailbreak/Root detection (optional)                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 5: Network Security                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Request rate limiting                                                  │
│ ✓ Timeout configuration                                                  │
│ ✓ Network security config (Android)                                     │
│ ✓ App Transport Security (iOS)                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CI/CD PIPELINE (GitHub Actions)                     │
└─────────────────────────────────────────────────────────────────────────┘

Developer Push to Repository
      │
      ▼
GitHub Actions Triggered
      │
      ├────────────────────────┬────────────────────────┐
      │                        │                        │
      ▼                        ▼                        ▼
Android Build           iOS Build              Tests
      │                        │                        │
      ▼                        ▼                        ▼
Setup Node.js          Setup Xcode            Run Unit Tests
      │                        │                        │
      ▼                        ▼                        ▼
npm install            pod install            Run Integration Tests
      │                        │                        │
      ▼                        ▼                        ▼
Setup Java             Build Archive          Generate Coverage Report
      │                        │                        │
      ▼                        ▼                        ▼
./gradlew assembleRelease  Export IPA         Upload to CodeCov
      │                        │                        │
      ▼                        ▼                        ▼
Upload APK Artifact    Upload IPA Artifact    ✓ Tests Passed
      │                        │
      ▼                        ▼
Manual Review          Manual Review
      │                        │
      ▼                        ▼
Upload to Play Store   Upload to App Store Connect
      │                        │
      ▼                        ▼
Internal Testing       TestFlight Beta
      │                        │
      ▼                        ▼
Production Rollout     Production Release
```

---

## Performance Optimization Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATION                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Rendering Performance                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ React.memo for expensive components                                   │
│ ✓ useMemo for expensive calculations                                    │
│ ✓ useCallback for stable function references                            │
│ ✓ FlashList for large scrollable lists                                  │
│ ✓ Image lazy loading with React Native Fast Image                       │
│ ✓ Code splitting with React.lazy (for web)                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Network Performance                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Response caching with TTL                                             │
│ ✓ Request debouncing for search inputs                                  │
│ ✓ Pagination for large data sets                                        │
│ ✓ Optimistic UI updates                                                 │
│ ✓ GraphQL (optional) for precise data fetching                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Bundle Size Optimization                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Tree shaking in production builds                                     │
│ ✓ Code obfuscation (ProGuard/R8 for Android)                           │
│ ✓ Asset optimization (image compression)                                │
│ ✓ Remove unused dependencies                                            │
│ ✓ Split bundles (Android App Bundle)                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Memory Management                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Proper cleanup in useEffect hooks                                     │
│ ✓ Unsubscribe from event listeners                                      │
│ ✓ Clear timers and intervals                                            │
│ ✓ Release image resources                                               │
│ ✓ Limit cache size                                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Startup Performance                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Splash screen while loading                                           │
│ ✓ Lazy load non-critical screens                                        │
│ ✓ Preload essential data only                                           │
│ ✓ Hermes engine for faster JS execution                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SCALABILITY STRATEGY                             │
└─────────────────────────────────────────────────────────────────────────┘

Tenant Isolation
    ├─ Schema-per-tenant in PostgreSQL
    ├─ Header-based tenant routing
    └─ Independent data and configuration

Horizontal Scaling
    ├─ Stateless API design
    ├─ Load balancing with NGINX/AWS ALB
    └─ CDN for static assets

Caching Strategy
    ├─ Redis for session data
    ├─ Client-side caching (MMKV)
    └─ API response caching with TTL

Database Optimization
    ├─ Indexed queries
    ├─ Connection pooling
    ├─ Read replicas for reporting
    └─ Partitioning for large tables

API Rate Limiting
    ├─ Per-user limits
    ├─ Per-tenant limits
    └─ DDoS protection

Monitoring & Analytics
    ├─ Firebase Analytics
    ├─ Crashlytics for error tracking
    ├─ Performance monitoring
    └─ User behavior analytics
```

---

This architecture is designed to be:
- **Scalable**: Supports unlimited tenants and users
- **Maintainable**: Clear separation of concerns
- **Testable**: Modular design with dependency injection
- **Performant**: Optimized at every layer
- **Secure**: Multi-layered security approach
- **Resilient**: Offline support and error recovery

---

**Last Updated**: January 2026
**Version**: 1.0.0
