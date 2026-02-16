# Partner Commission Engine - Quick Reference

## 🚀 Quick Start

```bash
# 1. Run migrations
python manage.py migrate partners

# 2. Create a partner via Django admin
http://localhost:8000/admin/partners/partner/add/

# 3. Submit a lead (public API - no auth)
curl -X POST http://localhost:8000/api/v1/partners/leads/submit/ \
  -H "Content-Type: application/json" \
  -d '{"partner_code": "PARTNER0001", "school_name": "Test School", ...}'
```

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `public_partners` | Partner information & statistics |
| `public_leads` | Lead submissions & conversions |
| `public_commission_rules` | Commission calculation rules |
| `public_commissions` | Individual commission records |
| `public_payouts` | Payout batches |

---

## 🔑 Key API Endpoints

### Public (No Auth)
- `POST /api/v1/partners/leads/submit/` - Submit lead

### Partner Management
- `GET /api/v1/partners/partners/` - List partners
- `GET /api/v1/partners/partners/{id}/statistics/` - Partner stats
- `GET /api/v1/partners/partners/dashboard/` - Dashboard

### Lead Management
- `GET /api/v1/partners/leads/` - List leads
- `POST /api/v1/partners/leads/{id}/convert/` - Convert lead
- `POST /api/v1/partners/leads/{id}/assign/` - Assign to sales

### Commission Management
- `GET /api/v1/partners/commissions/` - List commissions
- `POST /api/v1/partners/commissions/{id}/approve/` - Approve
- `POST /api/v1/partners/commissions/approve_bulk/` - Bulk approve

### Payout Management
- `POST /api/v1/partners/payouts/create_payout/` - Create payout
- `POST /api/v1/partners/payouts/{id}/process/` - Process payout
- `GET /api/v1/partners/payouts/{id}/download_report/` - Excel report

---

## 💰 Commission Types

| Type | Formula | Example |
|------|---------|---------|
| PERCENTAGE | `amount × rate / 100` | ₹50,000 × 10% = ₹5,000 |
| FLAT | `fixed_amount` | ₹3,000 (fixed) |
| PERCENTAGE_RECURRING | `initial + (monthly × months)` | ₹6,000 + (₹500 × 6) = ₹9,000 |

---

## 📈 Status Flows

### Lead Status
```
NEW → CONTACTED → DEMO_SCHEDULED → DEMO_COMPLETED → 
NEGOTIATION → CONVERTED (or LOST/INVALID)
```

### Commission Status
```
PENDING → APPROVED → PAID (or CANCELLED)
```

### Payout Status
```
DRAFT → PENDING → PROCESSING → COMPLETED (or FAILED)
```

---

## 🎯 Typical Workflow

1. **Partner submits lead** → Lead created (NEW status)
2. **Sales assigns lead** → Lead assigned to sales person
3. **Sales contacts lead** → Status: CONTACTED
4. **Demo scheduled** → Status: DEMO_SCHEDULED
5. **School signs up** → Lead converted
6. **Commission created** → Status: PENDING
7. **Admin approves** → Status: APPROVED
8. **Month end** → Create payout
9. **Process payment** → Status: PAID
10. **Download report** → Excel file

---

## 🔒 Permissions

| Operation | Required Permission |
|-----------|-------------------|
| Submit lead | None (public) |
| View leads | Authenticated |
| Manage partners | Super Admin |
| Approve commissions | Super Admin |
| Process payouts | Super Admin |

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete system documentation |
| `API_EXAMPLES.md` | Curl command examples |
| `IMPLEMENTATION_SUMMARY.md` | Implementation overview |

---

## 🛠️ Django Admin

Access at: `http://localhost:8000/admin/partners/`

**Available Models:**
- Partners
- Leads
- Commission Rules
- Commissions
- Payouts

---

## 📊 Key Statistics Tracked

### Partner Level
- Total leads submitted
- Total conversions
- Conversion rate (%)
- Total commission earned
- Total commission paid
- Pending commission

### System Level
- Total partners
- Active partners
- Overall conversion rate
- Total commission earned/paid
- Pending commission

---

## 💡 Pro Tips

1. **Create commission rules first** before onboarding partners
2. **Use partner-specific rules** for top performers
3. **Set up recurring commissions** to incentivize long-term value
4. **Approve commissions regularly** to maintain partner trust
5. **Process payouts monthly** for consistency
6. **Download reports** for accounting records

---

## 🔍 Common Queries

### Get all pending commissions for a partner
```bash
GET /api/v1/partners/commissions/?partner_id={uuid}&status=PENDING
```

### Get leads that need follow-up
```bash
GET /api/v1/partners/leads/?status=CONTACTED
```

### Get partner performance for the month
```bash
GET /api/v1/partners/leads/statistics/?partner_id={uuid}&start_date=2026-02-01&end_date=2026-02-28
```

### Create monthly payout
```bash
POST /api/v1/partners/payouts/create_payout/
{
  "partner_id": "uuid",
  "period_start": "2026-02-01",
  "period_end": "2026-02-28",
  "tds_percentage": 10.00
}
```

---

## 🎨 Sample Commission Rule

```json
{
  "name": "Premium Tier 15% + 3 Months Recurring",
  "subscription_tier": "PREMIUM",
  "calculation_type": "PERCENTAGE_RECURRING",
  "commission_percentage": 15.00,
  "recurring_months": 3,
  "priority": 10,
  "is_active": true
}
```

**Result for ₹60,000/year subscription:**
- Initial: ₹9,000 (15% of ₹60,000)
- Recurring: ₹750/month × 3 = ₹2,250
- **Total: ₹11,250**

---

## 📞 Quick Help

**Need to:**
- Create a partner? → Django Admin or POST /partners/
- Submit a lead? → POST /leads/submit/ (no auth)
- Convert a lead? → POST /leads/{id}/convert/
- Approve commissions? → POST /commissions/approve_bulk/
- Create payout? → POST /payouts/create_payout/
- Download report? → GET /payouts/{id}/download_report/

**Documentation:**
- Full guide: `apps/partners/README.md`
- API examples: `apps/partners/API_EXAMPLES.md`
- Summary: `PARTNER_COMMISSION_ENGINE_COMPLETE.md`

---

## ✅ Checklist for Going Live

- [ ] Run migrations
- [ ] Create commission rules
- [ ] Onboard first partner
- [ ] Test lead submission
- [ ] Test lead conversion
- [ ] Test commission approval
- [ ] Test payout creation
- [ ] Test payout processing
- [ ] Download sample report
- [ ] Integrate with school onboarding

---

**Ready to scale through partners! 🚀**
