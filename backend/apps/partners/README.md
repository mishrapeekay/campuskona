# Lead Generator (Partner) Commission Engine

## Overview

The Partner Commission Engine is a comprehensive system for tracking lead generators (partners), managing their submitted leads, calculating commissions on conversions, and processing payouts. This system enables the platform to scale through a partner network while maintaining complete transparency and automation.

---

## Database Schema

### 1. Partner Model
**Table:** `public_partners`

Stores information about lead generation partners.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Partner name |
| email | EMAIL | Unique email |
| phone | VARCHAR(15) | Contact phone |
| company_name | VARCHAR(255) | Company name (optional) |
| partner_code | VARCHAR(20) | Unique referral code (e.g., PARTNER0001) |
| commission_type | VARCHAR(20) | PERCENTAGE, FLAT, or TIERED |
| commission_rate | DECIMAL(5,2) | Commission percentage (0-100) |
| flat_commission_amount | DECIMAL(10,2) | Flat commission amount |
| bank_name | VARCHAR(100) | Bank name for payouts |
| account_number | VARCHAR(50) | Bank account number |
| ifsc_code | VARCHAR(11) | IFSC code |
| pan_number | VARCHAR(10) | PAN number |
| gst_number | VARCHAR(15) | GST number |
| upi_id | VARCHAR(100) | UPI ID for quick payments |
| status | VARCHAR(20) | ACTIVE, INACTIVE, SUSPENDED |
| total_leads | INTEGER | Total leads submitted |
| total_conversions | INTEGER | Total conversions |
| total_commission_earned | DECIMAL(12,2) | Total commission earned |
| total_commission_paid | DECIMAL(12,2) | Total commission paid |
| joined_date | DATE | Partner join date |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- partner_code (unique)
- email (unique)
- status

---

### 2. Lead Model
**Table:** `public_leads`

Tracks leads submitted by partners.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| partner_id | UUID | Foreign key to Partner |
| school_name | VARCHAR(255) | School name |
| contact_person | VARCHAR(255) | Contact person name |
| email | EMAIL | Contact email |
| phone | VARCHAR(15) | Contact phone |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State |
| estimated_students | INTEGER | Estimated student count |
| board | VARCHAR(50) | Educational board |
| notes | TEXT | Additional notes |
| status | VARCHAR(20) | NEW, CONTACTED, DEMO_SCHEDULED, DEMO_COMPLETED, NEGOTIATION, CONVERTED, LOST, INVALID |
| converted_school_id | UUID | Foreign key to School (if converted) |
| conversion_date | TIMESTAMP | Conversion timestamp |
| lost_reason | VARCHAR(20) | Reason if lost |
| lost_notes | TEXT | Additional notes for lost leads |
| assigned_to_id | UUID | Foreign key to User (sales person) |
| submitted_date | TIMESTAMP | Lead submission date |
| last_contacted_date | TIMESTAMP | Last contact date |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- partner_id, status
- status
- email
- converted_school_id

---

### 3. CommissionRule Model
**Table:** `public_commission_rules`

Defines commission calculation rules.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Rule name |
| description | TEXT | Rule description |
| partner_id | UUID | Foreign key to Partner (null for global rules) |
| subscription_tier | VARCHAR(20) | BASIC, STANDARD, PREMIUM, ENTERPRISE (blank for all) |
| calculation_type | VARCHAR(30) | PERCENTAGE, FLAT, PERCENTAGE_RECURRING |
| commission_percentage | DECIMAL(5,2) | Commission percentage |
| flat_amount | DECIMAL(10,2) | Flat commission amount |
| recurring_months | INTEGER | Number of months for recurring commission |
| priority | INTEGER | Rule priority (higher = more priority) |
| is_active | BOOLEAN | Active status |
| valid_from | DATE | Validity start date |
| valid_until | DATE | Validity end date |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

---

### 4. Commission Model
**Table:** `public_commissions`

Tracks individual commission records.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| partner_id | UUID | Foreign key to Partner |
| lead_id | UUID | Foreign key to Lead |
| school_id | UUID | Foreign key to School |
| subscription_amount | DECIMAL(10,2) | Original subscription amount |
| commission_amount | DECIMAL(10,2) | Calculated commission amount |
| commission_rule_id | UUID | Foreign key to CommissionRule |
| commission_type | VARCHAR(20) | INITIAL, RECURRING, RENEWAL, UPGRADE |
| period_start | DATE | Period start (for recurring) |
| period_end | DATE | Period end (for recurring) |
| status | VARCHAR(20) | PENDING, APPROVED, PAID, CANCELLED |
| payout_id | UUID | Foreign key to Payout |
| notes | TEXT | Additional notes |
| earned_date | DATE | Commission earned date |
| approved_date | TIMESTAMP | Approval timestamp |
| paid_date | TIMESTAMP | Payment timestamp |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- partner_id, status
- status
- earned_date

---

### 5. Payout Model
**Table:** `public_payouts`

Manages payout batches for partners.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| partner_id | UUID | Foreign key to Partner |
| payout_number | VARCHAR(50) | Unique payout reference (e.g., PAY-2026-01-001) |
| total_amount | DECIMAL(12,2) | Total gross amount |
| commission_count | INTEGER | Number of commissions included |
| period_start | DATE | Payout period start |
| period_end | DATE | Payout period end |
| payment_method | VARCHAR(20) | BANK_TRANSFER, UPI, CHEQUE, CASH |
| transaction_reference | VARCHAR(100) | Payment transaction reference |
| status | VARCHAR(20) | DRAFT, PENDING, PROCESSING, COMPLETED, FAILED |
| tds_percentage | DECIMAL(5,2) | TDS percentage deducted |
| tds_amount | DECIMAL(10,2) | TDS amount |
| net_amount | DECIMAL(12,2) | Net payable amount (after TDS) |
| invoice_url | URL | Invoice document URL |
| payment_receipt_url | URL | Payment receipt URL |
| notes | TEXT | Additional notes |
| payout_date | DATE | Actual payout date |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| created_by_id | UUID | Foreign key to User (creator) |

**Indexes:**
- partner_id, status
- payout_number (unique)
- status

---

## Commission Calculation Logic

### Rule Priority System

The system uses a priority-based rule matching system:

1. **Partner-specific rule for subscription tier** (highest priority)
2. **Partner-specific rule (any tier)**
3. **Global rule for subscription tier**
4. **Global rule (any tier)** (lowest priority)

### Calculation Types

#### 1. PERCENTAGE
```python
commission_amount = (subscription_amount * commission_percentage) / 100
```

**Example:**
- Subscription: ₹50,000/year
- Commission Rate: 10%
- Commission: ₹5,000

#### 2. FLAT
```python
commission_amount = flat_amount
```

**Example:**
- Flat Amount: ₹3,000
- Commission: ₹3,000 (regardless of subscription amount)

#### 3. PERCENTAGE_RECURRING
```python
# Initial commission
initial_commission = (subscription_amount * commission_percentage) / 100

# Recurring commissions for N months
monthly_amount = subscription_amount / 12
recurring_commission = (monthly_amount * commission_percentage) / 100
# Repeat for recurring_months
```

**Example:**
- Subscription: ₹60,000/year
- Commission Rate: 10%
- Recurring Months: 6
- Initial Commission: ₹6,000
- Monthly Recurring: ₹500 × 6 months = ₹3,000
- **Total Commission: ₹9,000**

---

## REST API Endpoints

### Partner Management

#### List Partners
```
GET /api/v1/partners/partners/
Query Parameters:
  - status: Filter by status (ACTIVE, INACTIVE, SUSPENDED)
  - search: Search by name, code, or email
```

#### Create Partner
```
POST /api/v1/partners/partners/
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "commission_type": "PERCENTAGE",
  "commission_rate": 10.00,
  "bank_name": "HDFC Bank",
  "account_number": "1234567890",
  "ifsc_code": "HDFC0001234"
}
```

#### Get Partner Statistics
```
GET /api/v1/partners/partners/{id}/statistics/
Response: {
  "partner": {...},
  "leads": {
    "total_leads": 50,
    "converted_leads": 10,
    "conversion_rate": 20.00
  },
  "commissions": {
    "total_commissions": 15,
    "pending_commissions": 5,
    "total_earned": 75000.00
  },
  "payouts": {
    "total_payouts": 2,
    "total_payout_amount": 50000.00
  }
}
```

#### Partner Dashboard
```
GET /api/v1/partners/partners/dashboard/
Response: Overall partner program statistics
```

---

### Lead Management

#### Submit Lead (Public Endpoint)
```
POST /api/v1/partners/leads/submit/
Body: {
  "partner_code": "PARTNER0001",
  "school_name": "ABC International School",
  "contact_person": "Principal Name",
  "email": "principal@abcschool.com",
  "phone": "9876543210",
  "city": "Mumbai",
  "state": "Maharashtra",
  "estimated_students": 500,
  "board": "CBSE"
}
```

#### List Leads
```
GET /api/v1/partners/leads/
Query Parameters:
  - partner_id: Filter by partner
  - status: Filter by status
  - assigned_to: Filter by assigned user
  - search: Search by school name, contact, email, phone
```

#### Convert Lead
```
POST /api/v1/partners/leads/{id}/convert/
Body: {
  "school_id": "uuid-of-converted-school"
}
Response: {
  "lead": {...},
  "commission": {...}
}
```

#### Assign Lead
```
POST /api/v1/partners/leads/{id}/assign/
Body: {
  "user_id": "uuid-of-sales-person"
}
```

#### Update Lead Status
```
POST /api/v1/partners/leads/{id}/update_status/
Body: {
  "status": "CONTACTED",
  "lost_reason": "PRICE",  // if status is LOST
  "lost_notes": "Budget constraints"
}
```

#### Lead Statistics
```
GET /api/v1/partners/leads/statistics/
Query Parameters:
  - partner_id: Filter by partner
  - start_date: Start date (YYYY-MM-DD)
  - end_date: End date (YYYY-MM-DD)
```

---

### Commission Management

#### List Commissions
```
GET /api/v1/partners/commissions/
Query Parameters:
  - partner_id: Filter by partner
  - status: Filter by status
  - commission_type: Filter by type
  - start_date: Filter by earned date
  - end_date: Filter by earned date
```

#### Approve Commission
```
POST /api/v1/partners/commissions/{id}/approve/
```

#### Bulk Approve Commissions
```
POST /api/v1/partners/commissions/approve_bulk/
Body: {
  "commission_ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### Get Pending Commissions
```
GET /api/v1/partners/commissions/pending/
Query Parameters:
  - partner_id: Filter by partner
```

---

### Commission Rules

#### List Rules
```
GET /api/v1/partners/commission-rules/
Query Parameters:
  - partner_id: Filter by partner
  - is_active: Filter by active status
```

#### Create Rule
```
POST /api/v1/partners/commission-rules/
Body: {
  "name": "Premium Tier 15% Commission",
  "partner": null,  // null for global rule
  "subscription_tier": "PREMIUM",
  "calculation_type": "PERCENTAGE",
  "commission_percentage": 15.00,
  "recurring_months": 3,
  "priority": 10,
  "is_active": true
}
```

---

### Payout Management

#### List Payouts
```
GET /api/v1/partners/payouts/
Query Parameters:
  - partner_id: Filter by partner
  - status: Filter by status
  - year: Filter by year
```

#### Create Payout
```
POST /api/v1/partners/payouts/create_payout/
Body: {
  "partner_id": "uuid-of-partner",
  "period_start": "2026-01-01",
  "period_end": "2026-01-31",
  "tds_percentage": 10.00
}
```

#### Process Payout
```
POST /api/v1/partners/payouts/{id}/process/
Body: {
  "payment_method": "BANK_TRANSFER",
  "transaction_reference": "TXN123456789",
  "notes": "Paid via NEFT"
}
```

#### Get Payout Commissions
```
GET /api/v1/partners/payouts/{id}/commissions/
```

#### Payout Summary
```
GET /api/v1/partners/payouts/summary/
Query Parameters:
  - partner_id: Filter by partner
  - year: Filter by year
```

#### Download Payout Report
```
GET /api/v1/partners/payouts/{id}/download_report/
Response: Excel file with detailed payout report
```

#### Download Partner Summary
```
GET /api/v1/partners/payouts/download_partner_summary/
Query Parameters:
  - partner_id: Required
  - year: Optional (default: current year)
Response: Excel file with annual partner summary
```

---

## Sample Payout Report

### Excel Report Structure

#### Sheet 1: Payout Details

**Header Section:**
- Payout Number: PAY-2026-01-001
- Partner Name: John Doe
- Partner Code: PARTNER0001
- Period: 2026-01-01 to 2026-01-31
- Payout Date: 2026-02-05
- Payment Method: Bank Transfer

**Commission Details Table:**
| S.No | School Name | Lead Contact | Commission Type | Subscription Amount | Commission Amount | Earned Date | Status |
|------|-------------|--------------|-----------------|---------------------|-------------------|-------------|--------|
| 1 | ABC School | Principal A | INITIAL | ₹50,000 | ₹5,000 | 2026-01-15 | PAID |
| 2 | XYZ School | Principal B | INITIAL | ₹75,000 | ₹7,500 | 2026-01-20 | PAID |
| 3 | DEF School | Principal C | RECURRING | ₹5,000 | ₹500 | 2026-01-25 | PAID |

**Summary Section:**
- Total Commissions: 3
- Gross Amount: ₹13,000.00
- TDS (10%): ₹1,300.00
- **Net Payable Amount: ₹11,700.00**

**Bank Details:**
- Bank Name: HDFC Bank
- Account Number: 1234567890
- IFSC Code: HDFC0001234
- PAN Number: ABCDE1234F

---

## Payout Schedule

### Monthly Payout Process

1. **Day 1-5:** Commission approval period
   - Review pending commissions
   - Approve eligible commissions

2. **Day 6-10:** Payout creation
   - Create payout batches for approved commissions
   - Calculate TDS
   - Generate payout reports

3. **Day 11-15:** Payment processing
   - Process bank transfers
   - Update transaction references
   - Mark commissions as paid

4. **Day 16-20:** Reconciliation
   - Verify payments
   - Send payout reports to partners
   - Update partner statistics

---

## Business Rules

### Lead Validation
- Email must be unique across all leads
- Partner must be ACTIVE to submit leads
- All required fields must be provided

### Commission Calculation
- Commission is calculated only on successful subscription billing
- Recurring commissions are created automatically based on rules
- Commission status flow: PENDING → APPROVED → PAID

### Payout Processing
- Only APPROVED commissions can be included in payouts
- TDS is automatically calculated and deducted
- Payout status flow: DRAFT → PENDING → PROCESSING → COMPLETED

### Partner Statistics
- Statistics are updated in real-time
- Conversion rate = (total_conversions / total_leads) × 100
- Pending commission = total_earned - total_paid

---

## Integration Points

### 1. School Onboarding
When a new school is onboarded:
```python
# Check if school came from a lead
lead = Lead.objects.filter(email=school.email).first()
if lead:
    # Convert lead
    LeadManagementService.convert_lead(lead.id, school.id)
```

### 2. Subscription Billing
When a subscription is successfully billed:
```python
# Commission is automatically calculated
# Recurring commissions are created if applicable
```

### 3. Partner Portal
Partners can:
- Submit leads via public API
- View their statistics
- Track commission status
- Download reports

---

## Security Considerations

1. **Public Lead Submission**
   - No authentication required
   - Rate limiting applied
   - Partner code validation

2. **Admin Operations**
   - Only Super Admins can manage partners
   - Only Super Admins can approve commissions
   - Only Super Admins can process payouts

3. **Data Privacy**
   - Bank details are sensitive
   - PAN and GST numbers are protected
   - Payout reports contain financial data

---

## Performance Optimizations

1. **Denormalized Statistics**
   - Partner statistics stored in Partner model
   - Updated via signals/transactions
   - Avoids expensive aggregations

2. **Indexed Queries**
   - All foreign keys indexed
   - Status fields indexed
   - Date fields indexed for range queries

3. **Select Related**
   - All list views use select_related
   - Reduces N+1 query problems

---

## Future Enhancements

1. **Tiered Commission Structure**
   - Different rates based on conversion volume
   - Bonus for high performers

2. **Automated Payouts**
   - Integration with payment gateways
   - Automatic bank transfers

3. **Partner Portal**
   - Dedicated web interface for partners
   - Real-time lead tracking
   - Commission dashboard

4. **Lead Scoring**
   - ML-based lead quality prediction
   - Prioritization for sales team

5. **Referral Tracking**
   - UTM parameters
   - Landing page tracking
   - Attribution analytics

---

## Testing

### Sample Test Data

```python
# Create a partner
partner = Partner.objects.create(
    name="Test Partner",
    email="partner@test.com",
    phone="9876543210",
    partner_code="PARTNER0001",
    commission_type="PERCENTAGE",
    commission_rate=10.00,
    status="ACTIVE"
)

# Submit a lead
lead = LeadManagementService.submit_lead(
    partner_code="PARTNER0001",
    lead_data={
        "school_name": "Test School",
        "contact_person": "Test Principal",
        "email": "principal@testschool.com",
        "phone": "9876543210",
        "city": "Mumbai",
        "state": "Maharashtra"
    }
)

# Convert lead
commission = LeadManagementService.convert_lead(
    lead_id=lead.id,
    school_id=school.id
)

# Approve commission
commission.approve()

# Create payout
payout = PayoutService.create_payout(
    partner_id=partner.id,
    period_start=date(2026, 1, 1),
    period_end=date(2026, 1, 31),
    tds_percentage=10
)

# Process payout
payout.process_payout()
```

---

## Conclusion

The Partner Commission Engine provides a complete solution for managing lead generation partners, tracking conversions, calculating commissions, and processing payouts. The system is designed for scalability, transparency, and automation, enabling the platform to grow through a partner network while maintaining complete control and visibility.
