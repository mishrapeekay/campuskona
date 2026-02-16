import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import studentsReducer from './slices/studentsSlice';
import staffReducer from './slices/staffSlice';
import academicsReducer from './slices/academicsSlice';
import attendanceReducer from './slices/attendanceSlice';
import timetableReducer from './slices/timetableSlice';
import examinationsReducer from './slices/examinationsSlice';
import financeReducer from './slices/financeSlice';
import communicationReducer from './slices/communicationSlice';
import transportReducer from './slices/transportSlice';
import libraryReducer from './slices/librarySlice';
import uiReducer from './slices/uiSlice';
import admissionsReducer from './slices/admissionsSlice';
import hostelReducer from './slices/hostelSlice';
import hrPayrollReducer from './slices/hrPayrollSlice';
import reportsReducer from './slices/reportsSlice';
import assignmentsReducer from './slices/assignmentsSlice';
import workflowsReducer from './slices/workflowsSlice';
import lessonPlansReducer from './slices/lessonPlansSlice';
import partnersReducer from './slices/partnersSlice';
import analyticsReducer from './slices/analyticsSlice';
import parentPortalReducer from './slices/parentPortalSlice';
import aiQuestionsReducer from './slices/aiQuestionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentsReducer,
    staff: staffReducer,
    academics: academicsReducer,
    attendance: attendanceReducer,
    timetable: timetableReducer,
    examinations: examinationsReducer,
    finance: financeReducer,
    communication: communicationReducer,
    transport: transportReducer,
    library: libraryReducer,
    admissions: admissionsReducer,
    hostel: hostelReducer,
    hrPayroll: hrPayrollReducer,
    reports: reportsReducer,
    assignments: assignmentsReducer,
    workflows: workflowsReducer,
    lessonPlans: lessonPlansReducer,
    partners: partnersReducer,
    analytics: analyticsReducer,
    parentPortal: parentPortalReducer,
    aiQuestions: aiQuestionsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['students/uploadDocument/pending', 'students/uploadDocument/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file', 'meta.arg.file'],
        // Ignore these paths in the state
        ignoredPaths: ['students.uploadProgress'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Optional: Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
