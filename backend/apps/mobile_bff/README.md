# Mobile Backend-for-Frontend (BFF) Application

This Django application serves as the dedicated backend-for-frontend layer for the mobile application. It aggregates data, shapes payloads for mobile consumption, and orchestrates offline sync.

## Architecture
- **Views**: Aggregation endpoints, optimized for mobile bandwidth and latency.
- **Services**: Business logic for fetching and combining data from domain apps (Students, Attendance, Finance, etc.).
- **Sync**: Orchestrator for handling offline push/pull operations with conflict logging.
- **Async**: Uses `asyncio` and `sync_to_async` for parallel data fetching.

## Key Endpoints
- `/api/mobile/v1/dashboard/{role}/`: Role-specific dashboards (Admin, Teacher, Student, Parent).
- `/api/mobile/v1/parent/overview/`: Unified view for parents with all children data.
- `/api/mobile/v1/attendance/class-roster/`: Lightweight roster for attendance marking.
- `/api/mobile/v1/notifications/feed/`: Unified notification feed (Personal + System).
- `/api/mobile/v1/sync/push/` & `/pull/`: Offline data synchronization.

## Setup
1. Ensure `apps.mobile_bff` is in `TENANT_APPS` in `settings.py`.
2. Run migrations: `python manage.py makemigrations mobile_bff` and `python manage.py migrate_schemas`.

## Sync Metadata
Sync logs and conflict data are stored in `mongo_sync_logs` and `mobile_sync_conflicts` tables within the tenant schema.
