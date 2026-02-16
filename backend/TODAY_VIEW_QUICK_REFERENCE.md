# Today View API - Quick Reference

## 🚀 Quick Start

### For Frontend Developers

```typescript
// Get student today view
const data = await fetch('/api/mobile-bff/student/today/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get parent today view (all children)
const parentData = await fetch('/api/mobile-bff/parent/today/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Force refresh (bypass cache)
const freshData = await fetch('/api/mobile-bff/student/today/?force_refresh=true', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### For Backend Developers

```python
# Use the service directly
from apps.mobile_bff.services.today_view import TodayViewService

service = TodayViewService(student_id)
data = await service.get_today_data()

# Invalidate cache after bulk operations
from apps.mobile_bff.caching.today_view_cache import TodayViewCache

TodayViewCache.invalidate_by_section(section_id)
```

---

## 📋 API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/mobile-bff/student/today/` | GET | Student today view | Student/Parent/Teacher/Admin |
| `/api/mobile-bff/parent/today/` | GET | Parent today view (all children) | Parent only |
| `/api/mobile-bff/today/cache-stats/` | GET | Cache statistics | Admin only |
| `/api/mobile-bff/today/invalidate-cache/` | POST | Manual cache invalidation | Admin/Teacher |

---

## 🔑 Response Structure (Student)

```json
{
  "date": "2026-02-08",
  "day_of_week": "SATURDAY",
  "student": { /* profile */ },
  "timetable": {
    "is_holiday": false,
    "periods": [ /* array of periods */ ]
  },
  "homework": [ /* pending assignments */ ],
  "fees_due": {
    "total_due": 15000.0,
    "overdue_amount": 0.0,
    "upcoming_fees": [ /* fee items */ ]
  },
  "teacher_remarks": [ /* recent notes */ ],
  "attendance": {
    "marked": true,
    "status": "PRESENT"
  },
  "generated_at": "2026-02-08T16:57:49+05:30"
}
```

---

## ⚡ Cache Behavior

### Cache Keys
- Student: `today_view:student:{id}:{date}`
- Parent: `today_view:parent:{id}:{date}`

### TTL (Time-to-Live)
- **Morning (6-12):** 2 hours
- **Afternoon (12-18):** 1 hour  
- **Evening (18+):** 30 minutes

### Auto-Invalidation Triggers
✅ New assignment published  
✅ Fee payment made  
✅ Teacher note added  
✅ Timetable substitution  
✅ Attendance marked  

---

## 🛠️ Common Tasks

### Check Cache Hit Rate
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://api.school.com/api/mobile-bff/today/cache-stats/
```

### Invalidate Cache for Section
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"section_id": "uuid"}' \
  https://api.school.com/api/mobile-bff/today/invalidate-cache/
```

### Invalidate Cache for Student
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_id": "uuid"}' \
  https://api.school.com/api/mobile-bff/today/invalidate-cache/
```

---

## 🧪 Testing

### Run Unit Tests
```bash
python manage.py test apps.mobile_bff.tests.test_today_view
```

### Test API Endpoint
```bash
# Student view
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/mobile-bff/student/today/

# Parent view
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/mobile-bff/parent/today/
```

---

## 📊 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Cache Hit Rate | > 80% | Monitor daily |
| Cached Response | < 50ms | Redis lookup |
| Uncached Response | < 800ms | Full aggregation |
| Error Rate | < 0.5% | 5xx errors |
| DB Queries | < 15 | Per uncached request |

---

## 🔧 Troubleshooting

### Cache Not Working
1. Check Redis connection: `redis-cli ping`
2. Verify signals registered: Check `apps.py`
3. Check logs for errors

### Slow Response Times
1. Check cache hit rate
2. Review database query count
3. Verify indexes exist
4. Check Redis latency

### Missing Data
1. Verify student enrollment
2. Check academic year is current
3. Verify data permissions
4. Check signal handlers

---

## 📁 Key Files

```
backend/
├── apps/mobile_bff/
│   ├── services/
│   │   └── today_view.py          # Core aggregation logic
│   ├── caching/
│   │   └── today_view_cache.py    # Redis caching
│   ├── views/
│   │   └── today_view.py          # API endpoints
│   ├── serializers/
│   │   └── today_view.py          # Response structure
│   ├── signals.py                 # Auto invalidation
│   └── tests/
│       └── test_today_view.py     # Unit tests
```

---

## 🚨 Important Notes

⚠️ **Always invalidate cache after bulk operations**
```python
TodayViewCache.invalidate_by_section(section_id)
```

⚠️ **Don't bypass cache in production** (unless debugging)
```python
# Avoid in production
force_refresh=True
```

⚠️ **Monitor cache hit rate daily**
```bash
Target: > 80%
Alert if: < 70%
```

---

## 📞 Support

- **Documentation:** `TODAY_VIEW_API_DOCUMENTATION.md`
- **Architecture:** `TODAY_VIEW_ARCHITECTURE.md`
- **API Docs:** `/api/schema/swagger-ui/`
- **Team:** Backend Team

---

## ✅ Deployment Checklist

- [ ] Redis configured and running
- [ ] Signals registered in `apps.py`
- [ ] Tests passing
- [ ] Cache monitoring set up
- [ ] API documented in Swagger
- [ ] Frontend integrated
- [ ] Performance tested
- [ ] Security reviewed

---

**Last Updated:** 2026-02-08  
**Version:** 1.0.0  
**Status:** Production Ready ✅
