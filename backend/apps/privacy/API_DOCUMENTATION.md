# DPDP Act 2023 Compliance - API Documentation

## Overview

This API implements the Digital Personal Data Protection Act, 2023 (DPDP Act) compliance for the School Management System. It provides endpoints for managing parental consent, grievance redressal, data subject rights, and data breach notifications.

## Base URL

```
/api/v1/privacy/
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Consent Management

### 1. List Consent Purposes

Get all available consent purposes.

**Endpoint:** `GET /api/v1/privacy/consent-purposes/`

**Response:**
```json
[
  {
    "id": 1,
    "code": "CORE_EDUCATIONAL",
    "name": "Core Educational Activities",
    "description": "Processing student data for core educational purposes...",
    "is_mandatory": true,
    "category": "EDUCATIONAL",
    "legal_basis": "Essential for contract performance (DPDP Act Section 7)",
    "retention_period_days": 3650,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2. Request Consent

Request parental consent for a specific purpose. Sends OTP for verification.

**Endpoint:** `POST /api/v1/privacy/consents/request_consent/`

**Request Body:**
```json
{
  "student_id": 1,
  "purpose_code": "COMMUNICATION_NOTICES",
  "verification_method": "EMAIL_OTP"
}
```

**Verification Methods:**
- `EMAIL_OTP` - Email OTP (6 digits, 5-minute expiry)
- `SMS_OTP` - SMS OTP (6 digits, 5-minute expiry)
- `EXISTING_IDENTITY` - Use verified email/phone on file
- `AADHAAR_VIRTUAL_TOKEN` - Aadhaar verification (not yet implemented)
- `MANUAL_VERIFICATION` - In-person verification by school staff

**Response:**
```json
{
  "message": "Verification code sent",
  "consent_id": "550e8400-e29b-41d4-a716-446655440000",
  "verification_method": "EMAIL_OTP"
}
```

**Error Responses:**
- `403 Forbidden` - User is not parent/guardian of student
- `404 Not Found` - Student or purpose not found
- `500 Internal Server Error` - Failed to send verification code

---

### 3. Grant Consent

Grant consent after OTP verification.

**Endpoint:** `POST /api/v1/privacy/consents/grant_consent/`

**Request Body:**
```json
{
  "consent_id": "550e8400-e29b-41d4-a716-446655440000",
  "otp": "123456",
  "agreed": true
}
```

**Response:**
```json
{
  "message": "Consent granted successfully",
  "consent": {
    "id": 1,
    "consent_id": "550e8400-e29b-41d4-a716-446655440000",
    "student": 1,
    "student_name": "John Doe",
    "parent_user": 5,
    "parent_name": "Jane Doe",
    "purpose": 2,
    "purpose_details": { ... },
    "consent_given": true,
    "consent_date": "2024-01-15T10:30:00Z",
    "verification_method": "EMAIL_OTP",
    "verified_at": "2024-01-15T10:30:00Z",
    "withdrawn": false,
    "is_valid": true,
    "audit_logs": [
      {
        "action": "REQUESTED",
        "performed_by_name": "Jane Doe",
        "timestamp": "2024-01-15T10:25:00Z"
      },
      {
        "action": "GIVEN",
        "performed_by_name": "Jane Doe",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request` - OTP invalid/expired or agreement not checked
- `404 Not Found` - Consent record not found

---

### 4. Get My Consents

Get all consent records for the current parent user.

**Endpoint:** `GET /api/v1/privacy/consents/my_consents/`

**Query Parameters:**
- `student_id` (optional) - Filter by specific student

**Example:** `GET /api/v1/privacy/consents/my_consents/?student_id=1`

**Response:**
```json
[
  {
    "id": 1,
    "consent_id": "550e8400-e29b-41d4-a716-446655440000",
    "student": 1,
    "student_name": "John Doe",
    "purpose_details": {
      "code": "COMMUNICATION_NOTICES",
      "name": "Communication & Notices",
      "is_mandatory": false
    },
    "consent_given": true,
    "consent_date": "2024-01-15T10:30:00Z",
    "withdrawn": false,
    "is_valid": true
  }
]
```

---

### 5. Withdraw Consent

Withdraw previously granted consent (implements Right to Withdrawal).

**Endpoint:** `POST /api/v1/privacy/consents/{id}/withdraw_consent/`

**Request Body:**
```json
{
  "reason": "No longer wish to receive SMS communications"
}
```

**Response:**
```json
{
  "message": "Consent withdrawn successfully. Data will be deleted as per retention policy.",
  "consent": { ... }
}
```

**Error Responses:**
- `400 Bad Request` - Cannot withdraw mandatory consent
- `403 Forbidden` - Not authorized to withdraw this consent

**Note:** Mandatory consents cannot be withdrawn as they are essential for providing educational services.

---

## Grievance Redressal

### 6. File Grievance

File a new grievance (DPDP Act Section 12).

**Endpoint:** `POST /api/v1/privacy/grievances/`

**Request Body:**
```json
{
  "student": 1,
  "category": "CONSENT_ISSUE",
  "subject": "Unable to withdraw consent",
  "description": "I am unable to withdraw consent for communication purposes...",
  "severity": "MEDIUM"
}
```

**Categories:**
- `CONSENT_ISSUE` - Issues with consent management
- `DATA_ACCESS` - Unable to access personal data
- `DATA_CORRECTION` - Issues with data correction requests
- `DATA_DELETION` - Issues with data deletion requests
- `UNAUTHORIZED_PROCESSING` - Data processed without consent
- `DATA_BREACH` - Suspected data breach
- `OTHER` - Other privacy-related concerns

**Severity Levels:**
- `CRITICAL` - Resolution required within 24 hours
- `HIGH` - Resolution required within 48 hours
- `MEDIUM` - Resolution required within 72 hours
- `LOW` - Resolution required within 7 days

**Response:**
```json
{
  "id": 1,
  "grievance_id": "GRV-2024-001",
  "status": "SUBMITTED",
  "filed_at": "2024-01-15T14:00:00Z",
  "category": "CONSENT_ISSUE",
  "severity": "MEDIUM"
}
```

---

### 7. Add Comment to Grievance

Add a comment/update to an existing grievance.

**Endpoint:** `POST /api/v1/privacy/grievances/{id}/add_comment/`

**Request Body:**
```json
{
  "comment": "I have checked and the issue persists",
  "is_internal": false
}
```

**Response:**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": 1,
    "user_name": "Jane Doe",
    "comment": "I have checked and the issue persists",
    "is_internal": false,
    "created_at": "2024-01-15T15:00:00Z"
  }
}
```

---

### 8. List My Grievances

Get all grievances filed by the current user.

**Endpoint:** `GET /api/v1/privacy/grievances/`

**Response:**
```json
[
  {
    "id": 1,
    "grievance_id": "GRV-2024-001",
    "student_name": "John Doe",
    "category": "CONSENT_ISSUE",
    "subject": "Unable to withdraw consent",
    "severity": "MEDIUM",
    "status": "ACKNOWLEDGED",
    "filed_at": "2024-01-15T14:00:00Z",
    "acknowledged_at": "2024-01-15T16:00:00Z",
    "is_overdue": false,
    "comments": [...]
  }
]
```

---

## Data Subject Rights

### 9. Request Data Deletion

Request deletion of personal data (Right to Erasure - Section 14).

**Endpoint:** `POST /api/v1/privacy/deletion-requests/`

**Request Body:**
```json
{
  "student": 1,
  "reason": "Student has left the institution"
}
```

**Response:**
```json
{
  "id": 1,
  "request_id": "DEL-2024-001",
  "student_name": "John Doe",
  "status": "PENDING",
  "requested_at": "2024-01-15T10:00:00Z"
}
```

---

### 10. Request Data Correction

Request correction of inaccurate personal data (Right to Correction - Section 13).

**Endpoint:** `POST /api/v1/privacy/correction-requests/`

**Request Body:**
```json
{
  "student": 1,
  "field_name": "date_of_birth",
  "current_value": "2010-05-15",
  "corrected_value": "2010-05-16",
  "reason": "Incorrect date in records"
}
```

**Response:**
```json
{
  "id": 1,
  "request_id": "COR-2024-001",
  "student_name": "John Doe",
  "status": "PENDING",
  "requested_at": "2024-01-15T11:00:00Z"
}
```

---

## Admin/Staff Endpoints

### 11. Acknowledge Grievance

Acknowledge a grievance (staff only, within 24-hour requirement).

**Endpoint:** `POST /api/v1/privacy/grievances/{id}/acknowledge/`

**Response:**
```json
{
  "message": "Grievance acknowledged",
  "grievance": { ... }
}
```

---

### 12. Resolve Grievance

Mark a grievance as resolved (staff only).

**Endpoint:** `POST /api/v1/privacy/grievances/{id}/resolve/`

**Request Body:**
```json
{
  "resolution_notes": "Issue has been resolved. The consent withdrawal feature is now working correctly."
}
```

**Response:**
```json
{
  "message": "Grievance resolved successfully",
  "grievance": { ... }
}
```

---

## Error Handling

All endpoints follow standard HTTP status codes:

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request (resource created)
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User does not have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

**Error Response Format:**
```json
{
  "error": "Detailed error message"
}
```

---

## DPDP Act Compliance Features

### Verifiable Consent (Section 9.1)
- OTP-based verification (Email/SMS)
- 5-minute expiry for security
- Immutable audit trail of consent actions
- IP address and user agent logging

### Timelines
- **Grievance Acknowledgment:** Within 24 hours (auto-tracking)
- **Grievance Resolution:** Based on severity (24h to 7 days)
- **Data Breach Notification:** Within 72 hours to DPB (auto-tracking)

### Audit Logging
All consent actions are automatically logged:
- REQUESTED - Consent request initiated
- GIVEN - Consent granted by parent
- WITHDRAWN - Consent withdrawn by parent
- EXPIRED - Consent expired (future feature)

### Data Subject Rights
- Right to Access (Section 11) - Export personal data
- Right to Correction (Section 13) - Request data corrections
- Right to Erasure (Section 14) - Request data deletion
- Right to Grievance Redressal (Section 12) - File complaints

---

## Rate Limiting

To prevent abuse:
- OTP requests: Max 3 per hour per user
- Consent requests: Max 10 per hour per user

---

## Testing with Postman/cURL

### Example: Request and Grant Consent

**Step 1: Request Consent**
```bash
curl -X POST http://localhost:8000/api/v1/privacy/consents/request_consent/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "purpose_code": "COMMUNICATION_NOTICES",
    "verification_method": "EMAIL_OTP"
  }'
```

**Step 2: Check Email for OTP (123456)**

**Step 3: Grant Consent**
```bash
curl -X POST http://localhost:8000/api/v1/privacy/consents/grant_consent/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consent_id": "550e8400-e29b-41d4-a716-446655440000",
    "otp": "123456",
    "agreed": true
  }'
```

---

## Support

For issues or questions regarding DPDP compliance:
- **Data Protection Officer (DPO):** dpo@school.edu.in
- **Technical Support:** support@school.edu.in
- **Grievance Portal:** https://school.edu.in/privacy/grievances

---

## Changelog

### Version 1.0.0 (January 2024)
- Initial implementation of DPDP Act 2023 compliance
- Consent management with OTP verification
- Grievance redressal system
- Data subject rights (Access, Correction, Erasure)
- Data breach notification framework
