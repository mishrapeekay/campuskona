# School Management System - Mobile Application

A comprehensive, cross-platform mobile application for managing school operations built with React Native and TypeScript.

## Features

### Role-Based Dashboards

#### 🏫 School Admin / Principal Dashboard
- **Overview Statistics**: Real-time metrics for students, teachers, attendance, fees, and exams
- **Student Management**: Complete student lifecycle management
- **Staff Management**: Teacher and staff administration
- **Academic Management**: Classes, subjects, and academic year configuration
- **Finance Reports**: Fee collection and expense tracking
- **Quick Actions**: Streamlined access to common operations

#### 👨‍🏫 Teacher Dashboard
- **My Classes**: View assigned classes and subjects
- **Attendance Marking**: Quick attendance entry with class-wise view
- **Student Management**: Access to class students' information
- **Marks Entry**: Enter and update exam marks
- **Timetable**: View personal teaching schedule
- **Leave Requests**: Submit and track leave applications

#### 🎓 Student Dashboard
- **My Attendance**: View attendance records and percentage
- **My Exams**: Upcoming exams and previous results
- **My Marks**: Subject-wise marks and performance analytics
- **My Fees**: Fee details, payment history, and pending dues
- **Timetable**: Class schedule
- **Library**: Issued books and due dates
- **Transport**: Route and stop information
- **Notices**: School announcements and events

#### 👨‍👩‍👧 Parent Dashboard
- **Children Overview**: Multi-child management
- **Attendance Tracking**: Real-time attendance for each child
- **Academic Performance**: Exam results and progress reports
- **Fee Management**: View and pay fees online
- **Leave Application**: Request leaves for children
- **Teacher Communication**: Direct messaging with teachers
- **Notifications**: Important updates and alerts

### Core Modules

#### 📚 Library Management
- **Book Catalog**: Browse and search books by title, author, or category
- **Issue/Return**: Streamlined book borrowing process
- **Overdue Tracking**: Automatic fine calculation
- **My Books**: Track issued books and return dates
- **Statistics**: Library usage analytics

#### 🚌 Transportation Management
- **Routes & Stops**: Complete route information with timings
- **Vehicle Tracking**: Vehicle details and capacity
- **Driver Information**: Contact details and license validation
- **Student Allocation**: Route and stop assignment
- **Real-time Updates**: (Future) GPS tracking integration

## Technology Stack

### Frontend
- **Framework**: React Native 0.73.2
- **Language**: TypeScript 5.3.3
- **State Management**: Redux Toolkit + Redux Persist
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Charts**: Victory Native
- **Icons**: React Native Vector Icons

### Storage & Caching
- **AsyncStorage**: Token and user data persistence
- **MMKV**: High-performance key-value storage
- **Redux Persist**: State persistence
- **Offline Support**: Sync queue for offline operations

### Push Notifications
- **Firebase Cloud Messaging**: Real-time notifications
- **Topic Subscription**: Role-based notification delivery

## Project Structure

```
mobile-app/
├── src/
│   ├── assets/                 # Images, fonts, etc.
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Generic components (Button, Card, Input, etc.)
│   │   ├── layout/             # Layout components
│   │   ├── charts/             # Data visualization components
│   │   └── features/           # Feature-specific components
│   ├── constants/              # App constants (colors, fonts, spacing, etc.)
│   ├── hooks/                  # Custom React hooks
│   ├── navigation/             # Navigation configuration
│   │   ├── AppNavigator.tsx    # Main app navigator
│   │   ├── AuthNavigator.tsx   # Authentication flow
│   │   └── MainNavigator.tsx   # Role-based tab navigation
│   ├── screens/                # Screen components
│   │   ├── Auth/               # Login, Register, Forgot Password
│   │   ├── Dashboard/          # Role-specific dashboards
│   │   ├── Student/            # Student management
│   │   ├── Attendance/         # Attendance tracking
│   │   ├── Exam/               # Examination management
│   │   ├── Fee/                # Fee management
│   │   ├── Library/            # Library operations
│   │   ├── Transport/          # Transport management
│   │   └── Profile/            # User profile and settings
│   ├── services/               # Business logic and API integration
│   │   ├── api/                # API service layer
│   │   │   ├── client.ts       # Axios client with interceptors
│   │   │   ├── auth.service.ts
│   │   │   ├── student.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── exam.service.ts
│   │   │   ├── fee.service.ts
│   │   │   ├── library.service.ts
│   │   │   ├── transport.service.ts
│   │   │   └── communication.service.ts
│   │   ├── storage.service.ts  # Offline storage management
│   │   └── notification.service.ts # Push notifications
│   ├── store/                  # Redux state management
│   │   ├── slices/             # Redux slices
│   │   ├── hooks.ts            # Typed hooks
│   │   └── index.ts            # Store configuration
│   ├── types/                  # TypeScript type definitions
│   │   ├── models.ts           # Data models
│   │   ├── api.ts              # API types
│   │   └── navigation.ts       # Navigation types
│   └── utils/                  # Utility functions
├── android/                    # Android native code
├── ios/                        # iOS native code
├── package.json
├── tsconfig.json
├── babel.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**

```bash
cd "G:\School Mgmt System\mobile-app"
```

2. **Install dependencies**

```bash
npm install
```

3. **Install iOS dependencies (macOS only)**

```bash
cd ios
pod install
cd ..
```

4. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=http://10.0.2.2:8000/api/v1  # Android Emulator
# API_BASE_URL=http://localhost:8000/api/v1  # iOS Simulator

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

5. **Configure backend URL**

Update the `API_CONFIG.BASE_URL` in `src/constants/index.ts` if needed.

### Running the App

#### Development Mode

**Android**
```bash
npm run android
```

**iOS** (macOS only)
```bash
npm run ios
```

**Start Metro Bundler**
```bash
npm start
```

#### Production Build

**Android Release APK**
```bash
cd android
./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/app-release.apk
```

**Android App Bundle (for Google Play Store)**
```bash
cd android
./gradlew bundleRelease
# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

**iOS Archive** (macOS only)
```bash
cd ios
xcodebuild -workspace SchoolManagementApp.xcworkspace \
  -scheme SchoolManagementApp \
  -configuration Release \
  -archivePath build/SchoolManagementApp.xcarchive \
  archive
```

## Configuration

### Multi-Tenancy

The app supports multiple schools (tenants). Each tenant is identified by their subdomain.

**Tenant Selection Flow**:
1. User logs in with credentials
2. If user belongs to multiple schools, tenant selection screen appears
3. Selected tenant is stored in local storage
4. All API requests include `X-Tenant-Subdomain` header

### Authentication

- **JWT-based authentication** with access and refresh tokens
- **Access Token Lifetime**: 15 minutes
- **Refresh Token Lifetime**: 7 days
- **Automatic token refresh** via Axios interceptors
- **Secure storage** using AsyncStorage

### Role-Based Access Control (RBAC)

The app implements comprehensive permission-based access control:

- **User Types**: Super Admin, School Admin, Principal, Teacher, Student, Parent, Accountant, Librarian, Transport Manager
- **Dynamic Navigation**: Tab bar changes based on user role
- **Permission Checks**: Component-level permission validation
- **Feature Flags**: Tenant-specific feature enablement

## Features in Detail

### Offline Support

The app implements robust offline functionality:

1. **Data Caching**: Frequently accessed data is cached locally
2. **Sync Queue**: Offline operations are queued and synced when online
3. **Cache Expiry**: Configurable TTL for cached data
4. **Smart Refresh**: Automatic data refresh on network reconnection

### Push Notifications

Firebase Cloud Messaging integration for real-time notifications:

- **Topic Subscription**: Role-based notification channels
- **Deep Linking**: Navigate to relevant screen from notification
- **Badge Management**: Unread count on app icon
- **In-app Notifications**: Notification list and management

### Data Visualization

Charts and graphs for better insights:

- **Attendance Charts**: Line and bar charts for attendance trends
- **Fee Collection**: Pie charts for payment status
- **Exam Performance**: Subject-wise performance visualization
- **Student Analytics**: Growth and improvement tracking

## API Integration

### Base URL Configuration

```typescript
const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:8000/api/v1',  // Development
  TIMEOUT: 30000,
};
```

### Request Interceptor

Automatically adds:
- **Authorization header**: `Bearer {access_token}`
- **Tenant header**: `X-Tenant-Subdomain: {subdomain}`
- **Content-Type**: `application/json`

### Response Interceptor

Handles:
- **401 Unauthorized**: Auto token refresh
- **403 Forbidden**: Permission denied handling
- **Network errors**: User-friendly error messages
- **Error logging**: Sentry integration (optional)

### Available API Services

All services are located in `src/services/api/`:

- **authService**: Authentication and user management
- **studentService**: Student CRUD operations
- **attendanceService**: Attendance marking and reporting
- **examService**: Exam and marks management
- **feeService**: Fee structure and payments
- **libraryService**: Book catalog and issue/return
- **transportService**: Routes, vehicles, and allocations
- **communicationService**: Notices, events, and notifications

## UI/UX Design

### Design System

**Color Palette**
- Primary: Blue (#1E40AF)
- Secondary: Purple (#7C3AED)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)

**Typography**
- Font Family: System (iOS), Roboto (Android)
- Sizes: xs (10) to 6xl (36)

**Spacing**
- Consistent spacing scale: xs (4) to 6xl (64)

**Components**
- Material Design inspired
- Accessible and touch-friendly
- Responsive layouts

## Security

### Data Protection

- **Encrypted Storage**: Sensitive data encrypted at rest
- **HTTPS Only**: All API communication over HTTPS
- **Token Security**: Tokens stored in secure storage
- **Session Management**: Auto-logout on token expiration
- **Input Validation**: Client-side and server-side validation

### Authentication Security

- **Password Requirements**: Minimum 8 characters, complexity rules
- **Account Lockout**: After 5 failed login attempts
- **Password Reset**: Secure token-based reset flow
- **Email Verification**: Required for account activation

## Testing

### Unit Tests

```bash
npm test
```

### Coverage Report

```bash
npm test -- --coverage
```

### E2E Tests (Future)

```bash
npm run test:e2e
```

## Troubleshooting

### Common Issues

**1. Metro Bundler Port Already in Use**
```bash
npx react-native start --reset-cache
```

**2. Android Build Fails**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**3. iOS Build Fails**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

**4. Network Request Failed**
- Check API_BASE_URL in constants
- Ensure backend server is running
- For Android emulator, use `10.0.2.2` instead of `localhost`

## Performance Optimization

### Implemented Optimizations

1. **List Virtualization**: Using FlashList for large lists
2. **Image Optimization**: React Native Fast Image
3. **Code Splitting**: Lazy loading of screens
4. **Memoization**: React.memo and useMemo for expensive renders
5. **Debouncing**: Search input debouncing
6. **Caching**: API response caching

### Performance Monitoring

- **React Native Performance Monitor**: Built-in dev tool
- **Flipper**: Advanced debugging (optional)
- **Firebase Performance**: Production monitoring (optional)

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement features following coding standards
3. Write unit tests
4. Submit pull request
5. Code review and merge

### Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb style guide
- **Prettier**: Code formatting
- **Naming Conventions**: PascalCase for components, camelCase for functions

## Roadmap

### Phase 1 (Current)
- ✅ Core dashboards for all user types
- ✅ Student and staff management
- ✅ Attendance tracking
- ✅ Examination management
- ✅ Fee management
- ✅ Library operations
- ✅ Transportation tracking

### Phase 2 (Future)
- 🔄 Real-time GPS tracking for buses
- 🔄 Video conferencing integration
- 🔄 Assignment submission module
- 🔄 Digital diary/homework
- 🔄 Hostel management
- 🔄 HR & Payroll integration

### Phase 3 (Future)
- 🔄 AI-powered analytics
- 🔄 Chatbot for queries
- 🔄 Voice commands
- 🔄 AR/VR learning modules

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please contact:
- Email: support@schoolmgmt.com
- Phone: +91 XXXXXXXXXX

## Acknowledgments

Built with:
- React Native Team
- TypeScript Community
- React Navigation Contributors
- Redux Team
- All open-source contributors

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Developed by**: School Management System Development Team
