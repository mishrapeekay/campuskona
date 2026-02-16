### Phase 3: Module-Specific Verification (Horizontal Validation)
*Status: Ready for Execution*

**Objective**: Verify that the Mobile App is authenticating against the local backend and fetching REAL data, not just displaying mock fallbacks.

#### 3.1 Authentication & Data Flow Test
1.  **Select Tenant**: Tap **"Demo High School"**.
2.  **Login**:
    *   **Email**: `teacher@demo.com`
    *   **Password**: `School@123`
    *   *Note*: This user was confirmed to exist in your local database.
3.  **Verify Dashboard**:
    *   **Header**: Should say "Hello, [Name]" (fetched from `/auth/users/me/`).
    *   **Stats**: Look at "My Classes" or "Students". 
    *   **Pull-to-Refresh**: Swipe down. If successful, it re-fetches without error.

#### 3.2 Troubleshooting Data Connection
If the dashboard shows "0" for everything or fallback data:
1.  **Check Terminal**: Look at the Metro logs for `[GET] /api/v1/academic/classes/?page_size=1`.
2.  **Verify Backend**: Ensure the Django server log shows a response code `200`.

#### 3.3 Next Steps (After successful login)
*   **Attendance**: Go to "Quick Actions" -> "Mark Attendance".
*   **Timetable**: Verify the grid loads.

Please execute Step 3.1 and report if you see the specific Teacher Name or if it stays as "Hello, Teacher".
