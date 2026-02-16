# Platform Finance API Examples

## 📚 Complete API Usage Guide

This document provides practical examples for all Platform Finance API endpoints.

---

## 🔐 Authentication

All endpoints require JWT authentication:

```bash
# Get access token
curl -X POST "http://localhost:8000/api/v1/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vedatechno.com",
    "password": "your_password"
  }'

# Use token in requests
export TOKEN="your_access_token_here"
```

---

## 📊 Investor Dashboard APIs

### 1. Get Complete Dashboard

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/investor/dashboard/dashboard/" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "summary": {
    "mrr": 500000.00,
    "arr": 6000000.00,
    "churn_rate": 2.5,
    "growth_rate": 15.3,
    "total_schools": 120,
    "active_schools": 115,
    "cac": 12000.00,
    "ltv": 150000.00,
    "ltv_cac_ratio": 12.5
  },
  "growth": {
    "regions": {
      "Maharashtra": 40,
      "Delhi": 30,
      "Karnataka": 25
    },
    "tiers": {
      "Premium": 50,
      "Standard": 45,
      "Basic": 20
    },
    "new_schools_this_month": 8,
    "churned_schools_this_month": 3
  },
  "trends": [...],
  "financial_health": {
    "ltv_cac_ratio": 12.5,
    "ltv_cac_status": "Excellent",
    "churn_status": "Healthy",
    "growth_status": "Growing"
  }
}
```

### 2. Refresh Metrics (Force Recalculation)

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/investor/dashboard/refresh_metrics/" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Historical Metrics

```bash
# Last 90 days (default)
curl -X GET "http://localhost:8000/api/v1/platform-finance/investor/dashboard/metrics_history/" \
  -H "Authorization: Bearer $TOKEN"

# Last 180 days
curl -X GET "http://localhost:8000/api/v1/platform-finance/investor/dashboard/metrics_history/?days=180" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Add Marketing Spend

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/investor/marketing-spend/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": "2026-02-01",
    "digital_marketing": 50000.00,
    "events_conferences": 30000.00,
    "content_marketing": 20000.00,
    "partner_incentives": 15000.00,
    "sales_team_cost": 100000.00,
    "other_expenses": 10000.00,
    "notes": "February 2026 marketing spend"
  }'
```

### 5. Create Investor Profile

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/investor/profiles/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": "user-uuid-here",
    "investor_name": "John Doe",
    "investor_type": "VC",
    "firm_name": "Acme Ventures",
    "investment_amount": 5000000.00,
    "investment_date": "2025-01-15",
    "equity_percentage": 15.0,
    "dashboard_access": true,
    "financial_reports_access": true,
    "board_member": true,
    "email": "john@acmeventures.com",
    "phone": "+91-9876543210"
  }'
```

---

## 💰 Financial Ledger APIs

### 1. View Ledger Entries

```bash
# All entries
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/" \
  -H "Authorization: Bearer $TOKEN"

# Filter by category
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/?category=PLATFORM_REVENUE" \
  -H "Authorization: Bearer $TOKEN"

# Filter by transaction type
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/?transaction_type=PLATFORM_SUBSCRIPTION" \
  -H "Authorization: Bearer $TOKEN"

# Filter by tenant
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/?tenant=school_abc" \
  -H "Authorization: Bearer $TOKEN"

# Filter by date range
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/?start_date=2026-01-01&end_date=2026-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Create Ledger Entry - Platform Revenue

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/ledger/create_entry/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_type": "PLATFORM_SUBSCRIPTION",
    "amount": 50000.00,
    "description": "Annual subscription - ABC School",
    "tenant_schema": "school_abc",
    "reference_id": "subscription-uuid-here",
    "metadata": {
      "tenant_name": "ABC School",
      "tier": "Premium",
      "billing_cycle": "YEARLY",
      "start_date": "2026-01-01",
      "end_date": "2026-12-31"
    }
  }'
```

### 3. Create Ledger Entry - Partner Commission

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/ledger/create_entry/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_type": "PARTNER_COMMISSION",
    "amount": 5000.00,
    "description": "Commission payout to Partner XYZ",
    "reference_id": "commission-uuid-here",
    "metadata": {
      "partner_name": "Partner XYZ",
      "partner_code": "PARTNER001",
      "commission_type": "INITIAL"
    }
  }'
```

### 4. Create Ledger Entry - Investor Payout

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/ledger/create_entry/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_type": "INVESTOR_DIVIDEND",
    "amount": 100000.00,
    "description": "Q1 2026 dividend payout",
    "metadata": {
      "quarter": "Q1",
      "year": 2026,
      "investor_count": 5
    }
  }'
```

### 5. Create Ledger Entry - Platform Expense

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/ledger/create_entry/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_type": "MARKETING_EXPENSE",
    "amount": 25000.00,
    "description": "Google Ads campaign - February 2026",
    "metadata": {
      "campaign_name": "School Acquisition Feb 2026",
      "platform": "Google Ads",
      "duration": "1 month"
    }
  }'
```

### 6. Verify Ledger Integrity

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/verify_integrity/" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "is_valid": true,
  "total_entries": 1523,
  "errors": [],
  "last_verified": "2026-02-09T19:30:00Z"
}
```

### 7. Export Ledger to Excel

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/export/?start_date=2026-01-01&end_date=2026-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "report_id": "report-uuid-here",
  "download_url": "/media/financial_reports/2026/02/ledger_export_20260209.xlsx",
  "entries_count": 245
}
```

---

## 📸 Financial Snapshots APIs

### 1. List Snapshots

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/snapshots/" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Get Specific Snapshot

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/snapshots/{snapshot-id}/" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create Daily Snapshot

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/snapshots/create_snapshot/" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Financial Segregation Report

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/snapshots/segregation_report/" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "platform_revenue": {
    "total": 5000000.00,
    "mtd": 500000.00,
    "ytd": 1500000.00
  },
  "school_collections": {
    "total": 50000000.00,
    "mtd": 5000000.00
  },
  "partner_commissions": {
    "paid": 250000.00,
    "pending": 50000.00
  },
  "investor_payouts": {
    "total": 500000.00,
    "ytd": 150000.00
  },
  "platform_expenses": {
    "total": 2000000.00,
    "mtd": 200000.00
  },
  "net_metrics": {
    "gross_profit": 3000000.00,
    "net_profit": 2250000.00,
    "profit_margin": 45.0
  }
}
```

---

## 🔍 Audit Logs APIs

### 1. View All Audit Logs

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/audit-logs/" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Filter Audit Logs

```bash
# By model
curl -X GET "http://localhost:8000/api/v1/platform-finance/audit-logs/?model=FinancialLedger" \
  -H "Authorization: Bearer $TOKEN"

# By user
curl -X GET "http://localhost:8000/api/v1/platform-finance/audit-logs/?user=user-uuid" \
  -H "Authorization: Bearer $TOKEN"

# By action
curl -X GET "http://localhost:8000/api/v1/platform-finance/audit-logs/?action=VIEW" \
  -H "Authorization: Bearer $TOKEN"

# By date range
curl -X GET "http://localhost:8000/api/v1/platform-finance/audit-logs/?start_date=2026-02-01&end_date=2026-02-09" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📄 Reports APIs

### 1. List Generated Reports

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/reports/" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Generate Investor Dashboard Report

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/reports/generate/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "INVESTOR_DASHBOARD",
    "report_format": "EXCEL",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "parameters": {
      "include_trends": true,
      "include_regional_breakdown": true
    }
  }'
```

### 3. Generate Ledger Export

```bash
curl -X POST "http://localhost:8000/api/v1/platform-finance/reports/generate/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "LEDGER_EXPORT",
    "report_format": "EXCEL",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  }'
```

### 4. Download Report

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/reports/{report-id}/download/" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "download_url": "/media/financial_reports/2026/02/investor_dashboard_2026-01-01_2026-01-31.xlsx",
  "file_size": 245678,
  "download_count": 3
}
```

---

## 🔐 Role-Based Access Control APIs

### 1. List All Roles

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/access-control/" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Get Specific Role

```bash
curl -X GET "http://localhost:8000/api/v1/platform-finance/access-control/{role-id}/" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Update Role Permissions

```bash
curl -X PUT "http://localhost:8000/api/v1/platform-finance/access-control/{role-id}/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "can_view_platform_revenue": true,
    "can_view_school_collections": false,
    "can_export_ledger": true
  }'
```

---

## 🐍 Python SDK Examples

### Using Requests Library

```python
import requests
from datetime import date, timedelta

class PlatformFinanceClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_dashboard(self, refresh=False):
        """Get investor dashboard"""
        url = f"{self.base_url}/investor/dashboard/dashboard/"
        if refresh:
            url += "?refresh=true"
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def create_ledger_entry(self, transaction_type, amount, description, **kwargs):
        """Create ledger entry"""
        url = f"{self.base_url}/ledger/create_entry/"
        data = {
            'transaction_type': transaction_type,
            'amount': amount,
            'description': description,
            **kwargs
        }
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()
    
    def get_segregation_report(self):
        """Get financial segregation report"""
        url = f"{self.base_url}/snapshots/segregation_report/"
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def verify_ledger(self):
        """Verify ledger integrity"""
        url = f"{self.base_url}/ledger/verify_integrity/"
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def generate_report(self, report_type, start_date, end_date, report_format='EXCEL'):
        """Generate financial report"""
        url = f"{self.base_url}/reports/generate/"
        data = {
            'report_type': report_type,
            'report_format': report_format,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        }
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()

# Usage
client = PlatformFinanceClient(
    base_url='http://localhost:8000/api/v1/platform-finance',
    token='your_access_token'
)

# Get dashboard
dashboard = client.get_dashboard(refresh=True)
print(f"MRR: ₹{dashboard['summary']['mrr']:,.2f}")
print(f"Active Schools: {dashboard['summary']['active_schools']}")

# Create ledger entry
entry = client.create_ledger_entry(
    transaction_type='PLATFORM_SUBSCRIPTION',
    amount=50000.00,
    description='Subscription payment',
    tenant_schema='school_abc',
    metadata={'tier': 'Premium'}
)
print(f"Created entry #{entry['sequence_number']}")

# Get segregation report
report = client.get_segregation_report()
print(f"Net Profit: ₹{report['net_metrics']['net_profit']:,.2f}")

# Verify ledger
integrity = client.verify_ledger()
print(f"Ledger valid: {integrity['is_valid']}")

# Generate report
report = client.generate_report(
    report_type='INVESTOR_DASHBOARD',
    start_date=date(2026, 1, 1),
    end_date=date(2026, 1, 31)
)
print(f"Report generated: {report['id']}")
```

---

## 🧪 Testing Workflows

### Complete Workflow: Monthly Investor Report

```bash
#!/bin/bash

# 1. Refresh metrics
curl -X POST "http://localhost:8000/api/v1/platform-finance/investor/dashboard/refresh_metrics/" \
  -H "Authorization: Bearer $TOKEN"

# 2. Create financial snapshot
curl -X POST "http://localhost:8000/api/v1/platform-finance/snapshots/create_snapshot/" \
  -H "Authorization: Bearer $TOKEN"

# 3. Verify ledger integrity
curl -X GET "http://localhost:8000/api/v1/platform-finance/ledger/verify_integrity/" \
  -H "Authorization: Bearer $TOKEN"

# 4. Generate investor report
curl -X POST "http://localhost:8000/api/v1/platform-finance/reports/generate/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "INVESTOR_DASHBOARD",
    "report_format": "EXCEL",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  }'
```

---

## 📞 Support

For more examples and detailed documentation:
- See `apps/platform_finance/README.md`
- Visit Django Admin: `/admin/platform_finance/`
- API Documentation: `/api/docs/`
