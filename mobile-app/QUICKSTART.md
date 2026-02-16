# Quick Start Guide - School Management Mobile App

**Get started with development in 15 minutes!**

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- [ ] **npm** or **yarn** package manager
- [ ] **Git** - [Download](https://git-scm.com/)
- [ ] **React Native CLI** - `npm install -g react-native-cli`
- [ ] **Android Studio** (for Android) - [Download](https://developer.android.com/studio)
- [ ] **Xcode** (for iOS, macOS only) - [Download](https://apps.apple.com/us/app/xcode/id497799835)
- [ ] **JDK 17** (for Android builds)
- [ ] **CocoaPods** (for iOS) - `sudo gem install cocoapods`

---

## 🚀 Step 1: Installation (5 minutes)

### Clone and Install Dependencies

```bash
# Navigate to the mobile app directory
cd "G:\School Mgmt System\mobile-app"

# Install all npm dependencies
npm install

# For iOS only (macOS required)
cd ios
pod install
cd ..
```

**Expected Output:**
```
✓ Dependencies installed successfully
✓ Pods installed (iOS)
```

---

## ⚙️ Step 2: Configuration (3 minutes)

### Create Environment File

Create `.env` in the mobile-app root directory:

```env
# API Configuration
API_BASE_URL=http://10.0.2.2:8000/api/v1  # For Android Emulator
# API_BASE_URL=http://localhost:8000/api/v1  # For iOS Simulator
# API_BASE_URL=https://api.yourschool.com/api/v1  # For Production

# Firebase Configuration (Get from Firebase Console)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

### Update API URL (if needed)

Edit `src/constants/index.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://10.0.2.2:8000/api/v1'  // Development
    : 'https://api.yourschool.com/api/v1',  // Production
  TIMEOUT: 30000,
};
```

---

## 🏃 Step 3: Run the App (2 minutes)

### Start Metro Bundler

Open a terminal:

```bash
npm start
```

### Run on Android

Open another terminal:

```bash
npm run android
```

**Troubleshooting:**
- If you get "SDK location not found", create `android/local.properties`:
  ```properties
  sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
  ```

### Run on iOS (macOS only)

```bash
npm run ios
```

**Troubleshooting:**
- If build fails, try: `cd ios && pod deintegrate && pod install && cd ..`

---

## 🔑 Step 4: Login to the App (2 minutes)

### Test Credentials

Based on your Django backend demo data:

**Veda Academy (Tenant 1)**
```
Subdomain: veda
Email: admin@veda.edu
Password: [your admin password]
```

**Sunrise School (Tenant 2)**
```
Subdomain: sunrise
Email: admin@sunrise.edu
Password: [your admin password]
```

### Login Steps

1. Launch the app
2. Enter email and password
3. Select tenant (if multiple schools)
4. Navigate to role-specific dashboard

---

## 📱 Step 5: Test Features (3 minutes)

### Quick Feature Test Checklist

- [ ] **Login/Logout**
  - Login with test credentials
  - Logout from profile screen

- [ ] **Dashboard**
  - View statistics cards
  - Check quick actions

- [ ] **Attendance** (Admin/Teacher)
  - Mark attendance for a class
  - View attendance reports

- [ ] **Exams** (Student)
  - View upcoming exams
  - Check previous results

- [ ] **Fees** (Parent/Student)
  - View fee details
  - Check payment history

- [ ] **Library**
  - Browse books
  - View issued books

- [ ] **Transport**
  - View route details
  - Check assigned vehicle

---

## 🛠️ Development Tools

### VS Code Extensions (Recommended)

Install these extensions for better development experience:

```
- ES7+ React/Redux/React-Native snippets
- React Native Tools
- TypeScript React code snippets
- Prettier - Code formatter
- ESLint
- React-Native/React/Redux snippets
```

### Enable Hot Reload

In the app (running in emulator/simulator):
- Android: Press `R` twice or Cmd/Ctrl + M → Enable Hot Reloading
- iOS: Cmd + D → Enable Hot Reloading

### Open Developer Menu

- **Android Emulator**: Cmd/Ctrl + M
- **iOS Simulator**: Cmd + D
- **Physical Device**: Shake the device

---

## 📂 Project Structure Quick Reference

```
src/
├── components/       # UI Components
├── constants/        # Colors, fonts, API config
├── navigation/       # App navigation setup
├── screens/          # All screen components
├── services/         # API and business logic
│   └── api/          # API service layer
├── store/            # Redux state management
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

---

## 🧪 Testing Your Changes

### Run Tests

```bash
npm test
```

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

---

## 🐛 Common Issues & Solutions

### Issue: Metro Bundler Port Already in Use

**Solution:**
```bash
npx react-native start --reset-cache --port=8082
```

### Issue: Android Build Fails

**Solution:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: iOS Build Fails with Pod Errors

**Solution:**
```bash
cd ios
pod deintegrate
rm Podfile.lock
pod install
cd ..
npm run ios
```

### Issue: "Unable to resolve module"

**Solution:**
```bash
npm start -- --reset-cache
```

### Issue: Network Request Failed

**Causes & Solutions:**

1. **Backend not running**
   - Start Django backend: `python manage.py runserver`

2. **Wrong API URL**
   - Android Emulator: Use `10.0.2.2` instead of `localhost`
   - iOS Simulator: Use `localhost`
   - Physical Device: Use computer's IP address (e.g., `192.168.1.100`)

3. **CORS Issues**
   - Check Django CORS settings include your mobile app origin

### Issue: Firebase Not Working

**Solution:**
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/`
3. Download `GoogleService-Info.plist`
4. Add to Xcode project

---

## 📝 Making Your First Change

### Example: Change Primary Color

1. **Edit** `src/constants/index.ts`
```typescript
export const COLORS = {
  primary: '#1E40AF',  // Change this to your color
  // ...
};
```

2. **See Changes**
   - Save file
   - Hot reload will update automatically

### Example: Add New Screen

1. **Create Screen File**
```typescript
// src/screens/MyScreen/MyScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

const MyScreen: React.FC = () => {
  return (
    <View>
      <Text>My New Screen</Text>
    </View>
  );
};

export default MyScreen;
```

2. **Add to Navigator**
```typescript
// src/navigation/MainNavigator.tsx
import MyScreen from '@/screens/MyScreen/MyScreen';

// Add to tab navigator
<Tab.Screen name="MyScreen" component={MyScreen} />
```

---

## 🔄 Syncing with Backend

### Ensure Backend is Running

```bash
# In backend directory
python manage.py runserver
```

### Test API Connection

```bash
# From mobile app directory
curl http://localhost:8000/api/v1/auth/login/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@veda.edu","password":"password"}'
```

---

## 📚 Next Steps

### Learning Resources

1. **React Native Documentation**
   - https://reactnavigation.org/

2. **Redux Toolkit**
   - https://redux-toolkit.js.org/

3. **TypeScript**
   - https://www.typescriptlang.org/docs/

4. **React Navigation**
   - https://reactnavigation.org/docs/getting-started

### Explore the Code

1. **Start with Dashboards**
   - `src/screens/Dashboard/AdminDashboard.tsx`
   - See how statistics are fetched and displayed

2. **Study API Integration**
   - `src/services/api/student.service.ts`
   - Learn API service pattern

3. **Understand State Management**
   - `src/store/slices/authSlice.ts`
   - See Redux Toolkit in action

4. **Review Components**
   - `src/components/common/Button.tsx`
   - Learn component creation pattern

---

## 🎯 Development Workflow

### Daily Development Flow

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   npm install  # If package.json changed
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Develop & Test**
   - Make changes
   - Test on emulator/simulator
   - Fix any errors

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add new feature description"
   ```

5. **Push & Create PR**
   ```bash
   git push origin feature/my-new-feature
   ```

---

## 🔐 Environment-Specific Configuration

### Development
```typescript
// Debugging enabled
// Source maps enabled
// Hot reload enabled
// Console logs visible
```

### Staging
```typescript
// Debugging disabled
// Source maps enabled
// API points to staging server
// Limited logging
```

### Production
```typescript
// Debugging disabled
// Source maps disabled
// API points to production server
// No console logs
// Minified code
```

---

## 📊 Monitoring During Development

### React Native Debugger

1. Install React Native Debugger
2. Start Metro bundler
3. Enable Debug JS Remotely in app

### Reactotron (Optional)

```bash
npm install --save-dev reactotron-react-native
```

Configure for API monitoring and state inspection.

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] Code runs without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tests pass (if applicable)
- [ ] Code formatted with Prettier
- [ ] No console.log statements
- [ ] Comments added for complex logic
- [ ] Imports organized

---

## 🎉 You're Ready!

You now have a fully functional development environment for the School Management mobile app.

### Quick Command Reference

```bash
# Start development
npm start                 # Start Metro bundler
npm run android          # Run on Android
npm run ios              # Run on iOS

# Code quality
npm run lint             # Check for errors
npm run format           # Format code
npm test                 # Run tests

# Build
cd android && ./gradlew assembleRelease  # Build Android APK
cd ios && xcodebuild ...                 # Build iOS

# Clean
npm run clean            # Clean build files
```

### Getting Help

- **Documentation**: Check `README.md` and `IMPLEMENTATION_GUIDE.md`
- **Architecture**: See `ARCHITECTURE.md` for system overview
- **Deployment**: Refer to `DEPLOYMENT_GUIDE.md`
- **Issues**: Create issue in project repository

---

**Happy Coding! 🚀**

---

**Last Updated**: January 2026
