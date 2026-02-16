# Partner Commission Engine - API Usage Examples

## Authentication

All endpoints (except lead submission) require authentication using JWT tokens.

```bash
# Get access token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'

# Use token in subsequent requests
Authorization: Bearer <access_token>
```

---

## 1. Partner Management

### Create a Partner

```bash
curl -X POST http://localhost:8000/api/v1/partners/partners/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@leadgen.com",
    "phone": "9876543210",
    "company_name": "Lead Gen Pro",
    "commission_type": "PERCENTAGE",
    "commission_rate": 10.00,
    "bank_name": "HDFC Bank",
    "account_number": "1234567890",
    "ifsc_code": "HDFC0001234",
    "pan_number": "ABCDE1234F",
    "upi_id": "john@paytm"
  }'
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@leadgen.com",
  "partner_code": "PARTNER0001",
  "commission_type": "PERCENTAGE",
  "commission_rate": "10.00",
  "status": "ACTIVE",
  "total_leads": 0,
  "total_conversions": 0,
  "conversion_rate": 0,
  "total_commission_earned": "0.00",
  "total_commission_paid": "0.00",
  "pending_commission": "0.00"
}
```

### List Partners

```bash
curl -X GET "http://localhost:8000/api/v1/partners/partners/?status=ACTIVE" \
  -H "Authorization: Bearer <token>"
```

### Get Partner Statistics

```bash
curl -X GET http://localhost:8000/api/v1/partners/partners/{partner_id}/statistics/ \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "partner": {
    "id": "uuid",
    "name": "John Doe",
    "partner_code": "PARTNER0001",
    "conversion_rate": 25.50
  },
  "leads": {
    "total_leads": 100,
    "converted_leads": 25,
    "lost_leads": 15,
    "active_leads": 60,
    "conversion_rate": 25.50
  },
  "commissions": {
    "total_commissions": 30,
    "pending_commissions": 5,
    "approved_commissions": 10,
    "paid_commissions": 15,
    "total_earned": "150000.00",
    "total_paid": "75000.00"
  },
  "payouts": {
    "total_payouts": 3,
    "completed_payouts": 2,
    "total_payout_amount": "67500.00"
  }
}
```

---

## 2. Lead Management

### Submit a Lead (Public Endpoint - No Auth Required)

```bash
curl -X POST http://localhost:8000/api/v1/partners/leads/submit/ \
  -H "Content-Type: application/json" \
  -d '{
    "partner_code": "PARTNER0001",
    "school_name": "ABC International School",
    "contact_person": "Dr. Sharma",
    "email": "principal@abcschool.com",
    "phone": "9876543210",
    "city": "Mumbai",
    "state": "Maharashtra",
    "estimated_students": 500,
    "board": "CBSE",
    "notes": "Interested in premium plan"
  }'
```

**Response:**
```json
{
  "id": "lead-uuid",
  "partner": "partner-uuid",
  "partner_name": "John Doe",
  "partner_code": "PARTNER0001",
  "school_name": "ABC International School",
  "contact_person": "Dr. Sharma",
  "email": "principal@abcschool.com",
  "phone": "9876543210",
  "city": "Mumbai",
  "state": "Maharashtra",
  "estimated_students": 500,
  "board": "CBSE",
  "status": "NEW",
  "submitted_date": "2026-02-08T16:30:00Z"
}
```

### List Leads

```bash
# All leads
curl -X GET http://localhost:8000/api/v1/partners/leads/ \
  -H "Authorization: Bearer <token>"

# Filter by partner
curl -X GET "http://localhost:8000/api/v1/partners/leads/?partner_id=uuid" \
  -H "Authorization: Bearer <token>"

# Filter by status
curl -X GET "http://localhost:8000/api/v1/partners/leads/?status=NEW" \
  -H "Authorization: Bearer <token>"

# Search
curl -X GET "http://localhost:8000/api/v1/partners/leads/?search=ABC" \
  -H "Authorization: Bearer <token>"
```

### Assign Lead to Sales Person

```bash
curl -X POST http://localhost:8000/api/v1/partners/leads/{lead_id}/assign/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "sales-person-uuid"
  }'
```

### Update Lead Status

```bash
curl -X POST http://localhost:8000/api/v1/partners/leads/{lead_id}/update_status/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED"
  }'
```

### Convert Lead

```bash
curl -X POST http://localhost:8000/api/v1/partners/leads/{lead_id}/convert/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "school_id": "school-uuid"
  }'
```

**Response:**
```json
{
  "lead": {
    "id": "lead-uuid",
    "status": "CONVERTED",
    "converted_school": "school-uuid",
    "conversion_date": "2026-02-08T17:00:00Z"
  },
  "commission": {
    "id": "commission-uuid",
    "partner": "partner-uuid",
    "subscription_amount": "50000.00",
    "commission_amount": "5000.00",
    "commission_type": "INITIAL",
    "status": "PENDING",
    "earned_date": "2026-02-08"
  }
}
```

### Get Lead Statistics

```bash
curl -X GET "http://localhost:8000/api/v1/partners/leads/statistics/?partner_id=uuid&start_date=2026-01-01&end_date=2026-01-31" \
  -H "Authorization: Bearer <token>"
```

---

## 3. Commission Management

### List Commissions

```bash
# All commissions
curl -X GET http://localhost:8000/api/v1/partners/commissions/ \
  -H "Authorization: Bearer <token>"

# Filter by partner
curl -X GET "http://localhost:8000/api/v1/partners/commissions/?partner_id=uuid" \
  -H "Authorization: Bearer <token>"

# Filter by status
curl -X GET "http://localhost:8000/api/v1/partners/commissions/?status=PENDING" \
  -H "Authorization: Bearer <token>"

# Filter by date range
curl -X GET "http://localhost:8000/api/v1/partners/commissions/?start_date=2026-01-01&end_date=2026-01-31" \
  -H "Authorization: Bearer <token>"
```

### Get Pending Commissions

```bash
curl -X GET http://localhost:8000/api/v1/partners/commissions/pending/ \
  -H "Authorization: Bearer <token>"
```

### Approve Single Commission

```bash
curl -X POST http://localhost:8000/api/v1/partners/commissions/{commission_id}/approve/ \
  -H "Authorization: Bearer <token>"
```

### Bulk Approve Commissions

```bash
curl -X POST http://localhost:8000/api/v1/partners/commissions/approve_bulk/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "commission_ids": [
      "commission-uuid-1",
      "commission-uuid-2",
      "commission-uuid-3"
    ]
  }'
```

**Response:**
```json
{
  "approved_count": 3,
  "message": "3 commissions approved successfully"
}
```

---

## 4. Commission Rules

### Create Global Commission Rule

```bash
curl -X POST http://localhost:8000/api/v1/partners/commission-rules/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Tier 15% Commission",
    "description": "15% commission for Premium tier subscriptions",
    "partner": null,
    "subscription_tier": "PREMIUM",
    "calculation_type": "PERCENTAGE",
    "commission_percentage": 15.00,
    "recurring_months": 3,
    "priority": 10,
    "is_active": true
  }'
```

### Create Partner-Specific Rule

```bash
curl -X POST http://localhost:8000/api/v1/partners/commission-rules/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Special Partner Rate",
    "description": "20% commission for top partner",
    "partner": "partner-uuid",
    "subscription_tier": "",
    "calculation_type": "PERCENTAGE",
    "commission_percentage": 20.00,
    "recurring_months": 6,
    "priority": 20,
    "is_active": true,
    "valid_from": "2026-01-01",
    "valid_until": "2026-12-31"
  }'
```

### List Commission Rules

```bash
# All rules
curl -X GET http://localhost:8000/api/v1/partners/commission-rules/ \
  -H "Authorization: Bearer <token>"

# Active rules only
curl -X GET "http://localhost:8000/api/v1/partners/commission-rules/?is_active=true" \
  -H "Authorization: Bearer <token>"
```

---

## 5. Payout Management

### Create Payout

```bash
curl -X POST http://localhost:8000/api/v1/partners/payouts/create_payout/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "partner-uuid",
    "period_start": "2026-01-01",
    "period_end": "2026-01-31",
    "tds_percentage": 10.00
  }'
```

**Response:**
```json
{
  "id": "payout-uuid",
  "partner": "partner-uuid",
  "partner_name": "John Doe",
  "partner_code": "PARTNER0001",
  "payout_number": "PAY-2026-02-001",
  "total_amount": "50000.00",
  "commission_count": 10,
  "period_start": "2026-01-01",
  "period_end": "2026-01-31",
  "tds_percentage": "10.00",
  "tds_amount": "5000.00",
  "net_amount": "45000.00",
  "status": "PENDING"
}
```

### Process Payout

```bash
curl -X POST http://localhost:8000/api/v1/partners/payouts/{payout_id}/process/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "BANK_TRANSFER",
    "transaction_reference": "TXN123456789",
    "notes": "Paid via NEFT on 2026-02-05"
  }'
```

**Response:**
```json
{
  "id": "payout-uuid",
  "status": "COMPLETED",
  "payout_date": "2026-02-05",
  "payment_method": "BANK_TRANSFER",
  "transaction_reference": "TXN123456789",
  "net_amount": "45000.00"
}
```

### List Payouts

```bash
# All payouts
curl -X GET http://localhost:8000/api/v1/partners/payouts/ \
  -H "Authorization: Bearer <token>"

# Filter by partner
curl -X GET "http://localhost:8000/api/v1/partners/payouts/?partner_id=uuid" \
  -H "Authorization: Bearer <token>"

# Filter by status
curl -X GET "http://localhost:8000/api/v1/partners/payouts/?status=COMPLETED" \
  -H "Authorization: Bearer <token>"

# Filter by year
curl -X GET "http://localhost:8000/api/v1/partners/payouts/?year=2026" \
  -H "Authorization: Bearer <token>"
```

### Get Payout Commissions

```bash
curl -X GET http://localhost:8000/api/v1/partners/payouts/{payout_id}/commissions/ \
  -H "Authorization: Bearer <token>"
```

### Get Payout Summary

```bash
curl -X GET "http://localhost:8000/api/v1/partners/payouts/summary/?partner_id=uuid&year=2026" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "total_payouts": 12,
  "total_amount": "600000.00",
  "total_tds": "60000.00",
  "total_net_amount": "540000.00",
  "completed_payouts": 10,
  "pending_payouts": 2
}
```

### Download Payout Report (Excel)

```bash
curl -X GET http://localhost:8000/api/v1/partners/payouts/{payout_id}/download_report/ \
  -H "Authorization: Bearer <token>" \
  -o payout_report.xlsx
```

### Download Partner Annual Summary (Excel)

```bash
curl -X GET "http://localhost:8000/api/v1/partners/payouts/download_partner_summary/?partner_id=uuid&year=2026" \
  -H "Authorization: Bearer <token>" \
  -o partner_summary_2026.xlsx
```

---

## 6. Dashboard & Statistics

### Partner Program Dashboard

```bash
curl -X GET http://localhost:8000/api/v1/partners/partners/dashboard/ \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "statistics": {
    "total_partners": 50,
    "active_partners": 45,
    "total_leads": 5000,
    "converted_leads": 1250,
    "conversion_rate": 25.00,
    "total_commission_earned": "6250000.00",
    "total_commission_paid": "4500000.00",
    "pending_commission": "1750000.00"
  },
  "recent_leads": [...],
  "recent_conversions": [...]
}
```

---

## Complete Workflow Example

### Scenario: Partner submits a lead that converts to a paying school

```bash
# Step 1: Partner submits lead (no auth required)
curl -X POST http://localhost:8000/api/v1/partners/leads/submit/ \
  -H "Content-Type: application/json" \
  -d '{
    "partner_code": "PARTNER0001",
    "school_name": "XYZ School",
    "contact_person": "Principal Name",
    "email": "principal@xyzschool.com",
    "phone": "9876543210",
    "city": "Delhi",
    "state": "Delhi",
    "estimated_students": 800,
    "board": "CBSE"
  }'
# Response: lead_id = "abc-123"

# Step 2: Sales team assigns lead to themselves
curl -X POST http://localhost:8000/api/v1/partners/leads/abc-123/assign/ \
  -H "Authorization: Bearer <token>" \
  -d '{"user_id": "sales-person-uuid"}'

# Step 3: Update status as contacted
curl -X POST http://localhost:8000/api/v1/partners/leads/abc-123/update_status/ \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "CONTACTED"}'

# Step 4: Schedule demo
curl -X POST http://localhost:8000/api/v1/partners/leads/abc-123/update_status/ \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "DEMO_SCHEDULED"}'

# Step 5: School signs up (creates school record)
# school_id = "school-xyz-789"

# Step 6: Convert lead (automatically creates commission)
curl -X POST http://localhost:8000/api/v1/partners/leads/abc-123/convert/ \
  -H "Authorization: Bearer <token>" \
  -d '{"school_id": "school-xyz-789"}'
# Response: commission_id = "comm-456"

# Step 7: Admin approves commission
curl -X POST http://localhost:8000/api/v1/partners/commissions/comm-456/approve/ \
  -H "Authorization: Bearer <token>"

# Step 8: End of month - Create payout
curl -X POST http://localhost:8000/api/v1/partners/payouts/create_payout/ \
  -H "Authorization: Bearer <token>" \
  -d '{
    "partner_id": "partner-uuid",
    "period_start": "2026-02-01",
    "period_end": "2026-02-28",
    "tds_percentage": 10.00
  }'
# Response: payout_id = "payout-789"

# Step 9: Download payout report
curl -X GET http://localhost:8000/api/v1/partners/payouts/payout-789/download_report/ \
  -H "Authorization: Bearer <token>" \
  -o payout_feb_2026.xlsx

# Step 10: Process payment
curl -X POST http://localhost:8000/api/v1/partners/payouts/payout-789/process/ \
  -H "Authorization: Bearer <token>" \
  -d '{
    "payment_method": "BANK_TRANSFER",
    "transaction_reference": "NEFT123456",
    "notes": "Paid on 2026-03-05"
  }'
```

---

## Error Responses

### Invalid Partner Code
```json
{
  "error": "Invalid or inactive partner code: INVALID001"
}
```

### Duplicate Lead
```json
{
  "error": "Lead with email principal@school.com already exists"
}
```

### Lead Already Converted
```json
{
  "error": "Lead is already converted"
}
```

### No Approved Commissions
```json
{
  "error": "No approved commissions found for this period"
}
```

### Invalid Status Transition
```json
{
  "error": "Only pending payouts can be processed"
}
```

---

## Rate Limiting

All endpoints are subject to rate limiting:
- Anonymous: 1000 requests/hour
- Authenticated: 10,000 requests/hour
- Per tenant: 100,000 requests/hour

---

## Pagination

List endpoints support pagination:
```bash
curl -X GET "http://localhost:8000/api/v1/partners/leads/?page=2&page_size=50" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "count": 500,
  "next": "http://localhost:8000/api/v1/partners/leads/?page=3",
  "previous": "http://localhost:8000/api/v1/partners/leads/?page=1",
  "results": [...]
}
```

---

## Filtering & Searching

Most list endpoints support filtering and searching:

```bash
# Multiple filters
curl -X GET "http://localhost:8000/api/v1/partners/leads/?status=NEW&partner_id=uuid&search=Mumbai" \
  -H "Authorization: Bearer <token>"

# Date range filtering
curl -X GET "http://localhost:8000/api/v1/partners/commissions/?start_date=2026-01-01&end_date=2026-01-31&status=PAID" \
  -H "Authorization: Bearer <token>"
```
