# Today View API - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MOBILE APPLICATION                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Student Dashboard / Parent Dashboard                             │  │
│  │  - Pull to refresh                                                │  │
│  │  - Display timetable, homework, fees, remarks                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                      │
│                                   │ HTTP GET                             │
│                                   ▼                                      │
└─────────────────────────────────────────────────────────────────────────┘

                    GET /api/mobile-bff/student/today/
                    GET /api/mobile-bff/parent/today/

┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Django REST)                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  StudentTodayView / ParentTodayView                               │  │
│  │  - Permission checks                                              │  │
│  │  - Cache lookup                                                   │  │
│  │  - Service orchestration                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                      │
│                    ┌──────────────┴──────────────┐                      │
│                    │                              │                      │
│                    ▼                              ▼                      │
│          ┌──────────────────┐          ┌──────────────────┐            │
│          │  REDIS CACHE     │          │  SERVICE LAYER   │            │
│          │                  │          │                  │            │
│          │  Cache Key:      │          │  TodayViewService│            │
│          │  today_view:     │          │  - Parallel fetch│            │
│          │  student:uuid:   │          │  - Error handling│            │
│          │  date            │          │                  │            │
│          │                  │          │                  │            │
│          │  TTL: Dynamic    │          │                  │            │
│          │  30min - 2hrs    │          │                  │            │
│          └──────────────────┘          └──────────────────┘            │
│                    │                              │                      │
│                    │ Cache Miss                   │                      │
│                    └──────────────┬───────────────┘                      │
│                                   │                                      │
│                                   ▼                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    AGGREGATION LAYER (Async)                             │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  asyncio.gather() - Parallel Data Fetching                       │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │  Timetable   │  │  Homework    │  │  Fees Due    │          │   │
│  │  │  - Today's   │  │  - Pending   │  │  - Overdue   │          │   │
│  │  │    schedule  │  │  - Due soon  │  │  - Due today │          │   │
│  │  │  - Holidays  │  │  - Status    │  │  - Upcoming  │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │  Remarks     │  │  Attendance  │  │  Student     │          │   │
│  │  │  - Recent    │  │  - Today's   │  │  - Profile   │          │   │
│  │  │    notes     │  │    status    │  │  - Class     │          │   │
│  │  │  - Important │  │  - Marked by │  │  - Section   │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│                                   │ Database Queries                     │
│                                   ▼                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER (PostgreSQL)                      │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Students    │  │  Timetable   │  │  Assignments │                  │
│  │  Enrollment  │  │  TimeSlots   │  │  Submissions │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Fees        │  │  Attendance  │  │  Notes       │                  │
│  │  Payments    │  │  Records     │  │  Remarks     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘

                                   ▲
                                   │
                    Django Signals (Auto Invalidation)
                                   │

┌─────────────────────────────────────────────────────────────────────────┐
│                    CACHE INVALIDATION TRIGGERS                           │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Django Signals (post_save, post_delete)                         │   │
│  │                                                                   │   │
│  │  • Assignment created/updated    → Invalidate section            │   │
│  │  • Fee payment made              → Invalidate student + parent   │   │
│  │  • Teacher note added            → Invalidate student + parent   │   │
│  │  • Timetable substitution        → Invalidate section (date)     │   │
│  │  • Attendance marked             → Invalidate student + parent   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│                                   ▼                                      │
│                          ┌──────────────────┐                           │
│                          │  REDIS CACHE     │                           │
│                          │  Delete Keys     │                           │
│                          └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            DATA FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════

SCENARIO 1: Cache Hit (Fast Path)
─────────────────────────────────
Mobile App → API → Redis Cache → Return Cached Data (< 50ms)


SCENARIO 2: Cache Miss (Slow Path)
──────────────────────────────────
Mobile App → API → Service Layer → Database (Parallel Queries) 
           ↓
        Cache Result → Return Fresh Data (300-800ms)


SCENARIO 3: Data Update (Cache Invalidation)
────────────────────────────────────────────
Teacher adds homework → Django Signal → Cache Invalidation → Next request fetches fresh data


═══════════════════════════════════════════════════════════════════════════
                         CACHING STRATEGY
═══════════════════════════════════════════════════════════════════════════

Cache Key Format:
  today_view:student:{student_id}:{date}
  today_view:parent:{parent_id}:{date}

Dynamic TTL:
  Morning (6 AM - 12 PM):    2 hours   (fewer updates)
  Afternoon (12 PM - 6 PM):  1 hour    (moderate activity)
  Evening (6 PM onwards):    30 min    (frequent updates)

Invalidation Strategy:
  • Automatic: Django signals on data changes
  • Manual: Admin API endpoint
  • Bulk: Section-wide invalidation for class changes

Cache Warming:
  • Scheduled task at 5:30 AM daily
  • Proactive warming for active sections
  • Predictive warming based on usage patterns


═══════════════════════════════════════════════════════════════════════════
                      PERFORMANCE CHARACTERISTICS
═══════════════════════════════════════════════════════════════════════════

Response Times:
  Cached Request:           < 50ms
  Uncached Request:         300-800ms
  Parent (3 children):      < 100ms (cached), 1-2s (uncached)

Database Queries:
  Cached:                   0 queries
  Uncached:                 8-12 queries (optimized with joins)

Cache Hit Rate Target:      > 80%

Scalability:
  Supports:                 100+ schools, 100k+ students
  Concurrent requests:      1000+ req/s (with Redis cluster)


═══════════════════════════════════════════════════════════════════════════
                         SECURITY & PERMISSIONS
═══════════════════════════════════════════════════════════════════════════

Access Control:
  Student:     Can view own data only
  Parent:      Can view children's data only
  Teacher:     Can view all students in their classes
  Admin:       Can view all students

Data Privacy:
  • Confidential notes excluded from parent view
  • PII encrypted at rest
  • HTTPS enforced
  • Rate limiting applied


═══════════════════════════════════════════════════════════════════════════
```
