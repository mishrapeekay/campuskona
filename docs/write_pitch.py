output_path = "/g/School Mgmt System/docs/campuskona-school-pitch.md"
parts = []

# HEADER COMMENT
p0 = """<!--
  CAMPUSKONA - SCHOOL ONBOARDING STRATEGY PITCH DOCUMENT

  This file is designed to work in TWO ways:

  1. READABLE DOCUMENT - Open in any Markdown viewer or GitHub.
     All formatting, tables, and content display beautifully.

  2. SLIDE DECK - Render as a presentation using Marp:
     VS Code: Install "Marp for VS Code" extension,
     then click the Marp icon (top-right) to Open Preview
     CLI: npx @marp-team/marp-cli pitch.md --pdf
     or:  npx @marp-team/marp-cli pitch.md --html

  Each --- separator marks a new slide in Marp.
-->
"""
parts.append(p0)

# YAML FRONTMATTER
p1 = """---
marp: true
theme: default
paginate: true
header: "\U0001f393 CampusKona \u2014 School Onboarding Strategy"
footer: "Confidential | campuskona.com | v1.0 | February 2026"
style: |
  section {
    font-size: 18px;
  }
  section h1 {
    color: #1a5276;
    border-bottom: 3px solid #2980b9;
    padding-bottom: 8px;
  }
  section h2 {
    color: #1f618d;
  }
  section h3 {
    color: #2471a3;
  }
  table {
    font-size: 15px;
  }
  blockquote {
    border-left: 5px solid #2980b9;
    background: #eaf4fb;
    padding: 10px 16px;
    font-style: italic;
  }
---
"""
parts.append(p1)

# SLIDE 1 - Cover
p2 = """\
# \U0001f393 CampusKona \u2014 School Onboarding Strategy

## A Strategic Pitch for School Management & Principals

### Including Digital Personal Data Protection (DPDP) Act 2023 Compliance

---

**Version:** v1.0 | February 2026

---

> **CONFIDENTIAL** \u2014 This document is intended solely for the recipient school\u2019s
> leadership team. Do not distribute without prior written consent from CampusKona.

---

*campuskona.com | campuskona.com/privacy | campuskona.com/dpdp*

---
"""
parts.append(p2)

# SLIDE 2 - Indian School Reality
p3 = """\
# \U0001f3eb The Indian School Reality

## How Most Schools Run Today

| Area | Current Method |
|---|---|
| \U0001f4cb Attendance | Physical register |
| \U0001f4b8 Fee Collection | Carbon-copy receipt book |
| \U0001f4dd Exam Marks | Hand-tabulated Excel |
| \U0001f4e2 Notices | Printed & pinned on board |
| \U0001f46a Parent Communication | Phone calls / WhatsApp groups |
| \U0001f5c2\ufe0f Student Records | Physical files / Excel sheets |
| \U0001f4bc Staff Salary | Manual calculation |

---

## \U0001f613 Pain Points \u2014 The Daily Grind

- \U0001f4c1 Lost registers and misplaced physical files
- \U0001f4b0 Fee defaulters are hard to track and follow up
- \U0001f4de Parent complaints with no paper trail to refer back to
- \U0001f5d3\ufe0f Staff leave chaos \u2014 no visibility, no system
- \U0001f4ca Board/CBSE compliance takes **days** to compile
- \U0001f3f7\ufe0f TC retrieval takes **30 minutes** per request

---

## \U0001f6a8 The NEW Pain \u2014 DPDP Act 2023

> **The rules changed in 2023. Most schools do not know yet.**

- Under the **Digital Personal Data Protection (DPDP) Act 2023**, your school is now a **Data Fiduciary**
- Student data sitting in Excel = **legal liability**
- No audit trail = **no proof of consent**
- Data breach on a laptop = **school\u2019s legal responsibility**

---
"""
parts.append(p3)

# SLIDE 3 - Mirror Statement
p4 = """\
# \U0001fa9e The Mirror Statement

> *\u201cYou run one of the most complex organisations in India \u2014 a school. Every single day, you are
> simultaneously responsible for 1,000+ children\u2019s safety, 60+ staff members\u2019 livelihoods, hundreds
> of parents\u2019 trust, board & government compliance, fee collection, examination management, and a
> thousand small crises that nobody plans for.*
>
> *We are not here to tell you that your system is broken.*
>
> *The world around it has changed.*
>
> *Parents now expect WhatsApp updates. The government now wants digital compliance reports.
> Your best teachers spend Sunday evenings tabulating marks in Excel. Your office staff spends
> the first week of every month chasing fee defaulters.*
>
> *CampusKona does not ask you to change how you run your school. We ask to carry the paperwork
> burden \u2014 so your school can focus on what it was built for: education.\u201d*

---
"""
parts.append(p4)

# SLIDE 4 - DPDP Act Overview
p5 = """\
# \u2696\ufe0f The DPDP Act 2023 \u2014 What Every School Must Know

## India\u2019s First Comprehensive Data Privacy Law

> Equivalent in scope to Europe\u2019s GDPR. In effect since 2023.
> Enforcement is progressively ramping up.

---

## \U0001f4cb The 5 Key Obligations

| # | Obligation | What It Means for Schools |
|---|---|---|
| 1 | **CONSENT** | Documented, explicit, purpose-specific consent before collecting data |
| 2 | **PURPOSE LIMITATION** | Data collected for admissions cannot be used for marketing |
| 3 | **DATA ERASURE** | Parents/staff can legally demand deletion of all their data |
| 4 | **CHILDREN\u2019S DATA** | Verifiable parental consent required for **every student under 18** |
| 5 | **BREACH REPORTING** | Notify authorities within **72 hours** of any data breach |

---

## \U0001f4a5 The Penalty

> ### Up to **\u20b9250 CRORE** per violation

This is not a regulatory fine that can be managed.
It is an existential threat to the institution.

---
"""
parts.append(p5)

# SLIDE 5 - Hard Question
p6 = """\
# \u2753 The Hard Question

> **\u201cSir / Madam \u2014 where is your student data right now?\u201d**
>
> *If it is in an Excel file on your accountant\u2019s laptop, or in a WhatsApp group shared with
> 40 parents... under the DPDP Act 2023, your school is already carrying a legal liability today.\u201d*

---

## \U0001f534 What Counts as a Data Breach Under DPDP

- \U0001f4bb A laptop with student data gets **stolen**
- \U0001f4e7 An email with marks is sent to the **wrong parent**
- \U0001f4ac A **WhatsApp group** contains student names and attendance
- \U0001f464 An **ex-employee** still has access to school records
- \U0001f50c A **USB drive** with student data is lost
- \U0001f441\ufe0f An **unauthorised person** views student records on screen

---

> **\u201cWe are not here to alarm you.\u201d**
>
> **CampusKona was built from the ground up to make your school DPDP-compliant \u2014 automatically,
> without burdening your staff with legal paperwork.\u201d**

---
"""
parts.append(p6)

# SLIDE 6 - Before vs After
p7 = """\
# \u2705 Before vs. After: DPDP Compliance

## The Compliance Gap \u2014 Closed by CampusKona

| OBLIGATION | WITHOUT CAMPUSKONA | WITH CAMPUSKONA |
|---|---|---|
| **Parental Consent** | Admission form signed; no digital audit trail | Digital consent recorded, timestamped, fully auditable |
| **Purpose Limitation** | No control \u2014 data used for whatever arises | Each field tagged to declared purpose; usage logged |
| **Data Minimisation** | Excel has 50 columns; nobody knows what is needed | Only fields required for declared purpose are collected |
| **Children\u2019s Data** | Parent signed admission form; unclear if covers digital | Verifiable parental consent workflow; guardian role defined; minor flag set |
| **Right to Erasure** | \u201cWe will delete your row from Excel\u201d \u2014 unverifiable | One-click erasure, audit log, all linked records handled in cascade |
| **Data Breach** | No way to know what was accessed or by whom | Real-time access logs, breach detection, 72-hour response workflow |
| **Audit Trail** | None | Every access, change, export, and deletion logged with user + timestamp |

---
"""
parts.append(p7)

# SLIDE 7 - Three Critical DPDP Clauses
p8 = """\
# \U0001f50d Three Critical DPDP Clauses for Schools

## Section 9 \u2014 Children\u2019s Data

> *\u201cEvery student under 18 is a child. That means **ALL** your students.\u201d*

Before storing any of the following, you need **verifiable parental consent**:

Name \u00b7 Date of Birth \u00b7 Address \u00b7 Photograph \u00b7 Attendance records
Exam marks \u00b7 Fee records \u00b7 Medical information

---

### \u26a0\ufe0f The Problem with Your Current Admission Form

A signed admission form from 3 years ago does **NOT** cover digital data storage.

### \u2705 How CampusKona Handles It

- Digital consent capturing: **what** data \u00b7 **why** needed \u00b7 **who** sees it \u00b7 **how long** kept \u00b7 right to withdraw
- Timestamped at collection \u00b7 Stored separately \u00b7 Exportable as evidence on demand

---

## Section 12 \u2014 Right to Erasure

> *\u201cA parent or staff member can legally ask you to delete ALL of their data.\u201d*

| Location | Likely Outcome Without CampusKona |
|---|---|
| Main Excel file | Maybe \u2014 if only one copy exists |
| Email attachments sent to teachers | Unlikely |
| WhatsApp messages in group chats | Impossible |
| Backup drives or cloud sync | Very unlikely |
| Copies on staff personal laptops | Unknown |

**With CampusKona:** One-click erasure \u2192 cascade deletion across all linked records \u2192 deletion certificate issued automatically.

---

## Section 8 \u2014 Breach Notification

> *\u201cYou have 72 hours to notify authorities after discovering a breach.\u201d*

| Violation | Fine |
|---|---|
| Failure to notify a breach | Up to **\u20b9200 Crore** |
| Inadequate security measures | Up to **\u20b9250 Crore** |

**CampusKona:** All access logged \u00b7 Automatic anomaly alerts \u00b7 Role-based access \u00b7 No sensitive data on local devices
72-hour response workflow built in \u00b7 Incident report auto-generated for regulatory submission

---
"""
parts.append(p8)

# SLIDE 8 - Three Circle Model
p9 = """\
# \U0001f465 Who Uses This Platform

## The Three-Circle Model

```
+--------------------------------------------------+
|                                                  |
|   +-------------------------------------------+ |
|   |   CIRCLE 1: SCHOOL ADMINISTRATION          | |
|   |   Principal  VP  Office Staff  Accountant  | |
|   |   +-----------------------------------+    | |
|   |   |  CIRCLE 2: TEACHERS + HR          |    | |
|   |   |  Class Teachers  Subject Teachers  |    | |
|   |   |  Department Heads                  |    | |
|   |   |  +-------------------------+       |    | |
|   |   |  | CIRCLE 3: PARENTS       |       |    | |
|   |   |  | Fee  Notices  Attendance|       |    | |
|   |   |  +-------------------------+       |    | |
|   |   +-----------------------------------+    | |
|   +-------------------------------------------+ |
|                                                  |
|   X  STUDENTS --- NOT ON PLATFORM               |
+--------------------------------------------------+
```

---

## \u274c Why Students Are Not on the Platform

Two independent reasons \u2014 both non-negotiable:

1. **School Mobile Policy** \u2014 Consistent with most Indian school policies prohibiting student mobile usage
2. **DPDP Children\u2019s Data Protection** \u2014 Students are under 18. Self-managed accounts create data consent complexity

---

## \U0001f4f1 Access Summary

| User Group | How They Access | When | Device |
|---|---|---|---|
| **Principal** | Web browser | Anytime | School computer / laptop |
| **Office Staff** | Web browser | School hours | School computer |
| **Teachers** | Mobile app | Before / after school | Personal phone |
| **Parents** | Mobile app + WhatsApp | Evenings | Personal phone |
| **Students** | \u274c Not on platform | \u2014 | \u2014 |

---
"""
parts.append(p9)

# SLIDE 9 - 6-Week Roadmap
p10 = """\
# \U0001f5d3\ufe0f The 6-Week Onboarding Roadmap

## Built Around How Schools Actually Work

| Week | Phase | Key Activities |
|---|---|---|
| **Week 1** | \U0001f3d7\ufe0f FOUNDATION | Admin setup \u00b7 Data import \u00b7 Academic year config \u00b7 Fee structure \u00b7 Classes & sections |
| **Week 2** | \U0001f468\u200d\U0001f3eb STAFF LIVE + CONSENT | Teacher accounts \u00b7 Consent forms signed digitally \u00b7 DPDP Data Processing Agreement signed |
| **Week 3** | \u2705 ATTENDANCE GOES LIVE | Daily attendance on app (parallel with register for 1 week) |
| **Week 4** | \U0001f46a PARENTS GO LIVE | Parents receive first WhatsApp \u00b7 Consent workflow activated |
| **Week 5** | \U0001f4b0 FEE MODULE + DPDP AUDIT READY | Online fee collection \u00b7 Defaulter reports \u00b7 Data rights portal live |
| **Week 6** | \U0001f3c6 FULL OPS + COMPLIANCE CERTIFICATE | All modules running \u00b7 DPDP report generated \u00b7 School receives certificate |

---

## \U0001f4d2 The Parallel Running Note

> *\u201cDuring Week 3, attendance is marked BOTH on the app AND in the physical register.
> After one week of zero discrepancies between the two, the register becomes the backup \u2014
> not the primary record.*
>
> **We never ask you to throw away your register on Day 1.\u201d**

This is the single most important trust-builder in the onboarding process.
No disruption. No risk. Proof before commitment.

---
"""
parts.append(p10)

# SLIDE 10 - Data Migration
p11 = """\
# \U0001f4ca Data Migration \u2014 The Magic Excel Process

## We Handle the Mess. You Keep Running.

---

### Step 1 \u2014 You Give Us Your Excel *(Week 1, Day 1\u20132)*

> **Whatever format. However messy. That is our problem, not yours.**

- We map your columns to our schema
- We flag data errors AND privacy gaps
- Fields with no declared purpose are flagged for review
- You are shown \u2014 perhaps for the first time \u2014 what data your school actually holds

---

### Step 2 \u2014 Privacy Audit of Import Data *(Week 1, Day 2\u20133)*

**DPDP Pre-Import Audit Report \u2014 Sample Output:**

```
IMPORT AUDIT SUMMARY
----------------------------------------------
1,047 student records  --  ready for import
   12 columns contain Caste/Religion data
       No declared educational purpose found
       Recommendation: Do not import
   89 records contain Aadhaar numbers
       Requires masking + higher consent tier
   23 records contain medical/disability data
       Requires elevated consent declaration
----------------------------------------------
Your Excel likely contains data you do not
legally need -- and did not know you had.
```

---

### Step 3 \u2014 Consent Collection at Import *(Week 2)*

Every parent and staff member receives a consent notice via WhatsApp **before** their historical
data is activated in the platform.

> This converts your historical data from a **legally grey area** into a
> **fully DPDP-compliant record** \u2014 retroactively.

---

### Step 4 \u2014 Historical Data *(Optional \u2014 Month 2+)*

| Data Type | Approach |
|---|---|
| Past exam results | Import if you have clean Excel |
| Past fee records | Outstanding dues only (current term) |
| Past attendance | Start fresh from today |
| Documents / TCs | Upload as PDFs when individually needed |

> **\u201cHistorical data is NOT a blocker to going live. You start clean, and we add history at your pace.\u201d**

---
"""
parts.append(p11)

# SLIDE 11 - Teacher Onboarding
p12 = """\
# \U0001f469\u200d\U0001f3eb Teacher Onboarding \u2014 Handling the Resistors

## Every School Has Them. We Know How to Work With Them.

---

## \U0001f5fa\ufe0f Teacher Resistance Map

| What They Say | What They Mean | Our Response |
|---|---|---|
| *\u201cI already have a system\u201d* | Do not disrupt what works for me | Acknowledge their system still works \u2014 we augment, not replace |
| *\u201cI am not good with technology\u201d* | I am afraid of looking foolish | Start with the simplest feature first. One button. That is it. |
| *\u201cWhat if I make a mistake?\u201d* | I fear consequences of errors | Undo is always available. Nothing is permanent without confirmation. |
| *\u201cWill this replace me?\u201d* | Am I being made redundant? | Technology handles paperwork. Teachers handle children. That is irreversible. |
| *\u201cWho will train me?\u201d* | I need real support, not a YouTube link | On-site training included. We come to your school. |

---

## \U0001f91d The Teacher Promise \u2014 5 Non-Negotiables

### 1\ufe0f\u20e3 First Screen = Their Timetable. Nothing Else.

```
+---------------------------------+
|  Good morning, Mrs. Sharma      |
|                                 |
|  Today -- Tuesday, 18 Feb       |
|  ----------------------------   |
|  08:30  Class 9A  Mathematics   |
|  10:00  Class 8B  Mathematics   |
|  12:30  Class 10A Mathematics   |
|                                 |
|  [ Mark Attendance ->  ]        |
+---------------------------------+
```

No dashboards. No configurations. No confusion.

---

### 2\ufe0f\u20e3 Attendance in Under 90 Seconds

1. Tap class name
2. See student list \u2014 **all marked PRESENT by default**
3. Tap only the students who are **ABSENT**
4. Tap **Submit**

> *\u201cMrs. Sharma currently calls roll for 10\u201312 minutes every period.
> On the app: tap 3 names. That is 8 minutes back \u2014 every single day, every class.\u201d*

---

### 3\ufe0f\u20e3 DPDP-Governed Access \u2014 Protection Built In

| Teachers **CAN** See | Teachers **CANNOT** See |
|---|---|
| Attendance for their own assigned classes | Another teacher\u2019s class data |
| Marks for subjects they personally teach | Fee records or payment history |
| Student names and class details | Student medical or home address details |
| Their own timetable | Staff salary information |

> **\u201cEvery access is logged. Privacy is protected. Not because we do not trust our teachers \u2014
> because we want to protect them from liability too.\u201d**

---

### 4\ufe0f\u20e3 On-Site Training Schedule

| Session | Timing | Duration | Content |
|---|---|---|---|
| **Day 1 \u2014 Hands-On** | Week 2 of onboarding | 2 hours | App walkthrough + DPDP explained simply |
| **Day 8 \u2014 Review** | 1 week post-launch | 1 hour | Address early questions, fix habits |
| **Day 30 \u2014 Check-In** | 1 month post-launch | 30 minutes | Confidence confirmation |
| **Ongoing** | Anytime | As needed | WhatsApp support \u2014 2-hour response SLA |

---

### 5\ufe0f\u20e3 The Champion Teacher Strategy

> *Identify the most tech-comfortable teacher in the school. Give them early access.
> Give them a direct line to the product team.
> Give them the title: **\u201cCampusKona School Champion\u201d**.*

When Mrs. Sharma hears from Mr. Mehta:

> *\u201cYaar, attendance has become so easy \u2014 I do not even stay back after class anymore...\u201d*

\u2014 adoption is done. No mandate required.
Peer credibility is the most powerful onboarding tool in an Indian school staffroom.

---
"""
parts.append(p12)

# SLIDE 12 - Parent Communication
p13 = """\
# \U0001f4f1 Parent Communication Strategy

## No App Download Required on Day 1

---

### Day 1 \u2014 The Physical Letter *(In the Child\u2019s School Bag)*

Written on **school letterhead**. From the Principal\u2019s desk.

```
Dear Parent / Guardian,

Your child\u2019s school is upgrading to a digital management system -- CampusKona.

YOUR RIGHTS UNDER THE DPDP ACT 2023:
  - View all data the school holds about your child
  - Request correction of incorrect data
  - Request deletion of your child\u2019s data
  - Your data is used ONLY for school management
  - NEVER shared with third parties or advertisers

You will shortly receive a WhatsApp message from our official school
number. Simply respond to confirm your consent.

Grievance Officer: [Principal Name]
Contact: [school email] | [school phone]
```

---

### Day 14 \u2014 The First WhatsApp Message

**From the official school number. Not a personal phone. Not a group.**

```
Greenfield Academy -- Attendance Update

Hello Mrs. Ramamurthy,

Ananya Ramamurthy (Class 8B) was PRESENT today,
Tuesday 18 Feb 2026.

--------------------------------------
We are collecting consent to manage Ananya\u2019s school
records digitally under DPDP Act 2023. This covers:
  Attendance records
  Academic performance
  Fee transactions
  School communication

Reply: YES to consent | INFO for full privacy notice
       REMOVE to opt out

Full Privacy Notice: campuskona.com/privacy/greenfield
```

---

> **\u201cThe parent\u2019s first interaction delivers value \u2014 their child was present today \u2014
> AND simultaneously collects legally valid DPDP consent.\u201d**
>
> One message. Two outcomes. Zero friction.

---

### Week 4 \u2014 The Fee Payment Moment: The Conversion Event

> *\u201cThe school sends a fee reminder via WhatsApp with a payment link. The parent pays from their
> sofa on a Sunday afternoon. A digital receipt arrives in 10 seconds. The accountant sees the
> payment in real time. The defaulter list automatically updates.\u201d*

| Before | After |
|---|---|
| Parent queues at office | Parent pays from phone |
| Handwritten receipt | Digital receipt (instant) |
| Accountant updates ledger manually | Auto-updated in real time |
| Defaulters chased manually every week | Flagged automatically with escalation |

> **\u201cOnce a parent pays fees online and receives an instant digital receipt \u2014
> they never want to go back to the queue.\u201d**

---
"""
parts.append(p13)
