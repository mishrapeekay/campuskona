# Frontend Quick Reference Guide

## Getting Started

### Development Servers
```bash
# Frontend (Vite)
cd frontend
npm run dev
# → http://localhost:3000

# Backend (Django)
cd backend
python manage.py runserver
# → http://127.0.0.1:8000
```

### Login Credentials (Test)
```
Email: admin@demo.com (or appropriate test user)
Password: [Your test password]
Tenant: demo (X-Tenant-Subdomain header)
```

---

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client modules (12 files)
│   │   ├── client.js     # Axios instance with JWT interceptors
│   │   ├── auth.js       # Authentication APIs
│   │   ├── students.js   # Student management APIs
│   │   ├── staff.js      # Staff management APIs
│   │   ├── attendance.js # Attendance APIs
│   │   └── ...
│   │
│   ├── components/       # Reusable components
│   │   ├── common/       # UI components (12 components)
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── DataTable.jsx  # Advanced table
│   │   │   ├── FormField.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── StatsCard.jsx  # Dashboard cards
│   │   │   └── ...
│   │   └── layout/       # Layout components
│   │       ├── MainLayout.jsx
│   │       ├── Sidebar.jsx
│   │       └── Header.jsx
│   │
│   ├── pages/            # Page components
│   │   ├── Dashboard/    # 8 dashboard pages
│   │   │   ├── EnhancedAdminDashboard.jsx  # ⭐ NEW
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── ...
│   │   ├── Students/     # Student management
│   │   │   ├── StudentList.jsx     # List with filters
│   │   │   ├── StudentDetail.jsx   # Detail with 6 tabs
│   │   │   ├── StudentForm.jsx     # 5-step wizard
│   │   │   └── BulkUpload.jsx
│   │   ├── Staff/        # Staff management
│   │   ├── Attendance/   # Attendance management
│   │   │   ├── MarkAttendance.jsx  # Bulk marking
│   │   │   ├── AttendanceReports.jsx
│   │   │   └── LeaveManagement.jsx
│   │   ├── Examinations/ # Exam management
│   │   ├── Finance/      # Finance management
│   │   └── Communication/# Notice/Calendar
│   │
│   ├── store/            # Redux store
│   │   ├── index.js      # Store configuration
│   │   └── slices/       # Redux slices
│   │       ├── authSlice.js
│   │       ├── studentsSlice.js     # ⭐ MODIFIED
│   │       ├── staffSlice.js        # ⭐ MODIFIED
│   │       ├── attendanceSlice.js
│   │       ├── communicationSlice.js
│   │       └── ...
│   │
│   ├── App.jsx           # Main app with routing
│   └── main.jsx          # Entry point
│
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind CSS config
```

---

## Key Features by Module

### 1. Dashboard
**Route:** `/`
**Component:** `EnhancedAdminDashboard.jsx` (for admins)

**Features:**
- Real-time stats cards (Students, Staff, Classes, Attendance %)
- 3 interactive charts (Chart.js): Gender, Category, Department
- Quick actions panel
- Recent notices & events
- Activity feed

**APIs Used:**
```javascript
fetchStudentStats()
fetchStaffStats()
fetchNotices()
fetchEvents()
getAttendanceSummary()
```

### 2. Student Management
**Routes:**
- `/students` → List
- `/students/new` → Create
- `/students/:id` → Detail
- `/students/:id/edit` → Edit

**Features:**
- Advanced filtering (Gender, Category, Status)
- Search by name/admission number
- Multi-step form (Personal → Address → Academic → Medical → Review)
- 6 detail tabs (Personal, Academic, Guardians, Documents, Health, Notes)
- Bulk operations (Upload, Export, Promote)

**Redux:**
```javascript
fetchStudents(filters)
fetchStudentById(id)
createStudent(data)
updateStudent({ id, data })
deleteStudent(id)
```

### 3. Staff Management
**Routes:** Similar to Students

**Features:**
- Filters (Department, Designation, Employment Type, Status)
- Similar CRUD operations
- Department management
- Subject assignment

### 4. Attendance
**Route:** `/attendance`
**Component:** `MarkAttendance.jsx`

**Features:**
- Class/Section selector
- Date picker
- Bulk marking (All Present/Absent)
- Individual status buttons (Present, Absent, Late, Half Day, Leave)
- Real-time statistics
- Remarks for each student

**APIs:**
```javascript
fetchClassAttendance({ class_id, section_id, date })
markBulkAttendance({ class_id, section_id, date, attendance_data })
```

### 5. Examinations
**Routes:**
- `/examinations/marks` → Mark Entry
- `/examinations/results` → Results View

### 6. Finance
**Routes:**
- `/finance` → Dashboard
- `/finance/categories` → Category Manager
- `/finance/structures` → Structure Manager
- `/finance/collection` → Fee Collection
- `/finance/expenses` → Expense Management

### 7. Communication
**Routes:**
- `/communication/notices` → Notice Board
- `/communication/calendar` → School Calendar

---

## Common Components Usage

### DataTable
```jsx
<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> }
  ]}
  data={students}
  loading={loading}
  pagination={{ page: 1, pageSize: 20, count: 100 }}
  onPageChange={(page) => setPage(page)}
  onSort={(column, direction) => setSorting({ column, direction })}
  selectable
  selectedRows={selected}
  onSelectRow={(row, checked) => handleSelect(row, checked)}
  actions={(row) => (
    <>
      <Button onClick={() => view(row)}>View</Button>
      <Button onClick={() => edit(row)}>Edit</Button>
    </>
  )}
/>
```

### StatsCard
```jsx
<StatsCard
  title="Total Students"
  value={1250}
  icon={<UsersIcon className="h-6 w-6" />}
  trend="up"
  trendValue="+12%"
  color="blue"
  onClick={() => navigate('/students')}
/>
```

### PageHeader
```jsx
<PageHeader
  title="Students"
  subtitle="Manage student records"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Students' }
  ]}
  actions={
    <Button onClick={handleAdd}>Add Student</Button>
  }
/>
```

### Card
```jsx
<Card title="Student Information" padding="md">
  <p>Card content here</p>
</Card>
```

### Button
```jsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, outline, danger, success, ghost
// Sizes: sm, md, lg
```

### Modal
```jsx
<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Confirm Delete"
  size="sm"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this item?</p>
</Modal>
```

---

## Redux Patterns

### Reading State
```javascript
import { useSelector } from 'react-redux';
import { selectStudents, selectStudentLoading } from '@/store/slices/studentsSlice';

const students = useSelector(selectStudents);
const loading = useSelector(selectStudentLoading);

// Or inline:
const { stats, loading } = useSelector((state) => state.students);
```

### Dispatching Actions
```javascript
import { useDispatch } from 'react-redux';
import { fetchStudents, createStudent } from '@/store/slices/studentsSlice';

const dispatch = useDispatch();

// Fetch list
useEffect(() => {
  dispatch(fetchStudents({ page: 1, pageSize: 20 }));
}, [dispatch]);

// Create
const handleSubmit = async (data) => {
  const result = await dispatch(createStudent(data));
  if (createStudent.fulfilled.match(result)) {
    navigate('/students');
  }
};
```

### Creating New Slice (Template)
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/mymodule';

export const fetchItems = createAsyncThunk(
  'mymodule/fetchItems',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getItems(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

const mymoduleSlice = createSlice({
  name: 'mymodule',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.results || action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = mymoduleSlice.actions;
export const selectItems = (state) => state.mymodule.list;
export default mymoduleSlice.reducer;
```

---

## API Client Patterns

### Making API Calls
```javascript
import { getStudents, getStudentById, createStudent } from '@/api/students';

// GET with query params
const response = await getStudents({
  page: 1,
  pageSize: 20,
  search: 'john',
  gender: 'M'
});

// GET by ID
const student = await getStudentById(123);

// POST
const newStudent = await createStudent({
  first_name: 'John',
  last_name: 'Doe',
  // ...
});

// PUT
const updated = await updateStudent(123, { first_name: 'Jane' });

// DELETE
await deleteStudent(123);
```

### File Upload
```javascript
import { bulkUploadStudents } from '@/api/students';

const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  await bulkUploadStudents(file, (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Upload Progress: ${percentCompleted}%`);
  });
};
```

### Creating New API Module
```javascript
// api/mymodule.js
import apiClient from './client';

const BASE_URL = '/mymodule';

export const getItems = (params) => {
  const queryString = buildQueryString(params);
  return apiClient.get(`${BASE_URL}/?${queryString}`);
};

export const getItemById = (id) => {
  return apiClient.get(`${BASE_URL}/${id}/`);
};

export const createItem = (data) => {
  return apiClient.post(`${BASE_URL}/`, data);
};

export const updateItem = (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}/`, data);
};

export const deleteItem = (id) => {
  return apiClient.delete(`${BASE_URL}/${id}/`);
};
```

---

## Styling Guidelines

### Tailwind Classes (Common Patterns)

**Layout:**
```jsx
// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flex
<div className="flex items-center justify-between gap-4">
```

**Typography:**
```jsx
// Heading
<h1 className="text-2xl font-bold text-gray-900">Title</h1>

// Subtitle
<p className="text-sm text-gray-500">Subtitle</p>

// Label
<label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
```

**Buttons:**
```jsx
// Primary
className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"

// Secondary
className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300"

// Danger
className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
```

**Forms:**
```jsx
// Input
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

// Select
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

// Error
className="text-sm text-red-600 mt-1"
```

**Cards:**
```jsx
className="bg-white rounded-lg shadow border border-gray-200 p-6"
```

**Badges:**
```jsx
// Success
className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"

// Danger
className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
```

---

## Chart.js Integration

### Setup
```javascript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
```

### Bar Chart
```javascript
const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Students',
      data: [65, 59, 80, 81, 56],
      backgroundColor: '#3B82F6',
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

<div className="h-64">
  <Bar data={data} options={options} />
</div>
```

### Doughnut Chart
```javascript
const data = {
  labels: ['Male', 'Female', 'Other'],
  datasets: [
    {
      data: [680, 550, 20],
      backgroundColor: ['#3B82F6', '#EC4899', '#10B981'],
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
};

<div className="h-64">
  <Doughnut data={data} options={options} />
</div>
```

---

## Formik + Yup Validation

### Basic Form
```javascript
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  first_name: Yup.string()
    .required('First name is required')
    .min(2, 'Must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  age: Yup.number()
    .min(0, 'Must be positive')
    .max(120, 'Invalid age')
    .required('Age is required'),
});

const formik = useFormik({
  initialValues: {
    first_name: '',
    email: '',
    age: '',
  },
  validationSchema,
  onSubmit: async (values) => {
    await dispatch(createStudent(values));
    navigate('/students');
  },
});

<form onSubmit={formik.handleSubmit}>
  <input
    name="first_name"
    value={formik.values.first_name}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
  />
  {formik.touched.first_name && formik.errors.first_name && (
    <p className="text-red-600">{formik.errors.first_name}</p>
  )}

  <button type="submit" disabled={formik.isSubmitting}>
    Submit
  </button>
</form>
```

---

## Troubleshooting

### Common Issues

**1. "Token expired" / 401 Errors**
- Check localStorage for access_token
- Verify token refresh logic in `api/client.js`
- Re-login to get fresh tokens

**2. "X-Tenant-Subdomain" header missing**
- Set `localStorage.setItem('selectedTenant', 'demo')`
- Check `api/client.js` request interceptor

**3. Charts not rendering**
- Verify Chart.js components are registered
- Check data format matches chart type
- Ensure parent div has defined height

**4. Redux state not updating**
- Check if action is dispatched
- Verify reducer extraReducers logic
- Use Redux DevTools to inspect state

**5. Filters not working**
- Check if `setFilters` action is dispatched
- Verify `useEffect` dependency array includes filters
- Check backend API query parameter names

---

## Development Tips

### Hot Reload
- Vite HMR is enabled by default
- Changes reflect instantly in browser
- If stuck, refresh browser (Ctrl+R)

### Redux DevTools
- Install Redux DevTools browser extension
- Inspect state, actions, time-travel debug
- Available in development mode only

### React DevTools
- Install React DevTools browser extension
- Inspect component tree
- Check props, state, hooks

### Console Logging
```javascript
// Debug API calls
console.log('[API] Request:', { url, params });
console.log('[API] Response:', response.data);

// Debug Redux
console.log('[Redux] Dispatching:', action);
console.log('[Redux] State:', state);

// Debug component
console.log('[Component] Mounted');
console.log('[Component] Props:', props);
```

### Network Inspection
- Open DevTools → Network tab
- Filter by "XHR" to see API calls
- Check request headers (Authorization, X-Tenant-Subdomain)
- Verify response status codes

---

## Build & Deployment

### Production Build
```bash
cd frontend
npm run build

# Output: dist/ folder
# Verify: npm run preview
```

### Environment Variables
```bash
# .env.production
VITE_API_BASE_URL=https://api.production.com/api/v1
VITE_APP_NAME="School Management System"
```

### Deploy to Nginx
```nginx
server {
  listen 80;
  server_name school.example.com;

  root /var/www/school-frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## Keyboard Shortcuts

**Browser:**
- `Ctrl+R` - Reload page
- `Ctrl+Shift+R` - Hard reload (clear cache)
- `F12` - Open DevTools
- `Ctrl+Shift+I` - Open DevTools

**Vite:**
- `r` - Restart server (in terminal)
- `q` - Quit server

**VSCode:**
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Search in files
- `Ctrl+/` - Toggle comment
- `Alt+Up/Down` - Move line up/down

---

## Useful Links

**Documentation:**
- React: https://react.dev
- Redux Toolkit: https://redux-toolkit.js.org
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- Chart.js: https://www.chartjs.org
- Formik: https://formik.org
- Yup: https://github.com/jquense/yup

**Project:**
- Frontend Dev: http://localhost:3000
- Backend API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/api/docs/
- Admin Panel: http://127.0.0.1:8000/admin/

---

**Quick Reference Last Updated:** 2026-01-21
