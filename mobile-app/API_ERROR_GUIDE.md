# Mobile App API Error - Troubleshooting Guide

**Error:** `Error fetching students: Server error. Please try again later.`  
**Date:** January 24, 2026, 12:11 IST

---

## 🔍 What's Happening

The mobile app is successfully running and making API requests to the backend:

```
✅ App Running: emulator-5554
✅ Metro Bundler: Connected
✅ Tenant Selected: demo (Demo High School)
✅ API Requests: Being sent to backend
❌ Error: "Server error. Please try again later."
```

---

## 📊 Root Cause

The error occurs because:

1. **App is not logged in** - No authentication token
2. **API requires authentication** - Student endpoints need valid JWT token
3. **Dashboard tries to load data** - Before user logs in

This is **NORMAL BEHAVIOR** - the app needs you to login first!

---

## ✅ Solution: Login to the App

### **Step 1: Check Emulator Screen**

You should see the **Login Screen** with:
- Tenant selection dropdown
- Email input field
- Password input field
- Login button

---

### **Step 2: Select Tenant**

Tap the tenant dropdown and select:
```
Demo High School
```

---

### **Step 3: Enter Credentials**

**For Teacher Dashboard:**
```
Email: teacher@demo.com
Password: School@123
```

**For Admin Dashboard:**
```
Email: admin@demohighschool.edu.in
Password: School@123
```

---

### **Step 4: Tap Login**

After successful login, you should see:
- ✅ Dashboard loads with data
- ✅ Student count: 270
- ✅ Classes: 9
- ✅ Quick Actions available

---

## 🔧 If Login Screen Not Visible

### **Reload the App:**

**Method 1: Metro Bundler**
- Press **R** twice in the Metro Bundler terminal

**Method 2: Dev Menu**
- Press **D** in Metro terminal
- Or **Ctrl+M** in emulator
- Select "Reload"

**Method 3: Restart App**
```powershell
npm run android
```

---

## 🐛 Debugging API Errors

### **Check Backend Logs:**

The backend terminal should show API requests. Look for:

```
GET /api/v1/students/ - 401 Unauthorized
```

This confirms the app needs to login first.

---

### **Check Metro Bundler Logs:**

You should see:
```
LOG  🏫 API Request to tenant: demo (Demo High School)
ERROR  Error fetching students: Server error. Please try again later.
```

This is expected before login!

---

### **After Login, You Should See:**

```
LOG  🏫 API Request to tenant: demo (Demo High School)
LOG  ✅ Login successful
LOG  ✅ Students loaded: 270
LOG  ✅ Dashboard data loaded
```

---

## 📱 Expected Login Flow

1. **App Starts** → Shows Login Screen
2. **Select Tenant** → "Demo High School"
3. **Enter Credentials** → teacher@demo.com / School@123
4. **Tap Login** → API call to `/auth/login/`
5. **Token Received** → Stored in AsyncStorage
6. **Dashboard Loads** → API calls with authentication token
7. **Data Displayed** → Students, classes, attendance, etc.

---

## 🔍 Verify Backend is Accessible

Test from your computer:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:8000/health/" -UseBasicParsing

# Should return: {"status": "healthy", "database": "connected"}
```

---

## 🌐 API Configuration

The mobile app is correctly configured:

**API Base URL:** `http://10.0.2.2:8000/api/v1`
- `10.0.2.2` = Android emulator's way to access `localhost`
- Port `8000` = Backend Django server
- `/api/v1` = API version prefix

**Tenant Header:** `X-Tenant-Subdomain: demo`
- Automatically added to all requests
- Ensures data isolation

---

## ✅ Success Indicators

After login, you should see:

### **In Metro Bundler:**
```
LOG  🏫 API Request to tenant: demo (Demo High School)
LOG  ✅ User authenticated
LOG  ✅ Dashboard data loaded
```

### **In Emulator:**
- Teacher Dashboard with metrics
- 9 Classes displayed
- 270 Students count
- Quick Actions buttons
- Bottom navigation tabs

---

## 🎯 Quick Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Mobile app running on emulator
- [ ] Metro bundler connected
- [ ] Login screen visible
- [ ] Tenant selected: "Demo High School"
- [ ] Credentials entered correctly
- [ ] Login button tapped
- [ ] Dashboard loaded successfully

---

## 🆘 If Login Fails

### **Check Credentials:**
- Email must be exact: `teacher@demo.com`
- Password is case-sensitive: `School@123`
- Tenant must be selected first

### **Check Backend:**
```powershell
# Verify backend is running
Invoke-WebRequest -Uri "http://localhost:8000/health/" -UseBasicParsing
```

### **Check Network:**
```powershell
# From emulator, test backend connectivity
adb shell ping -c 3 10.0.2.2
```

### **View Detailed Logs:**
```powershell
# React Native logs
adb logcat | findstr "ReactNativeJS"

# Backend logs
# Check the terminal running Django server
```

---

## 📚 Test Accounts Available

### **Demo High School (Subdomain: demo)**

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Teacher | `teacher@demo.com` | `School@123` | 9 classes, 270 students |
| Admin | `admin@demohighschool.edu.in` | `School@123` | Full admin access |
| Principal | `mr..robert dsouza@demo.school` | `School@123` | Admin features |

---

## 🎓 What Happens After Login

1. **Authentication Token** stored in AsyncStorage
2. **User Data** cached locally
3. **Tenant Config** saved
4. **Dashboard API calls** made with token
5. **Data Displayed:**
   - My Classes: 9
   - Students: 270
   - Pending Attendance: varies
   - Upcoming Exams: varies

6. **Navigation Available:**
   - Dashboard Tab
   - Attendance Tab
   - Exams Tab
   - Profile Tab

---

## 💡 Pro Tips

1. **First Time Login:** May take 2-3 seconds to load data
2. **Subsequent Logins:** Faster due to caching
3. **Pull to Refresh:** Works on all screens
4. **Offline Mode:** Some data cached for offline viewing

---

## 🔄 Reset App State

If you need to start fresh:

```powershell
# Clear app data
adb shell pm clear com.schoolmgmttemp

# Reinstall
npm run android
```

---

**Status:** App is working correctly - just needs login!  
**Next Action:** Login with teacher@demo.com / School@123  
**Expected Result:** Dashboard loads with school data

---

**Created:** January 24, 2026  
**Issue:** Pre-login API errors (expected behavior)  
**Solution:** Login to authenticate and access data
