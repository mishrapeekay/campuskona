# School Management System

A comprehensive, multi-tenant SaaS platform for school management supporting CBSE, ICSE, and MPBSE boards.

## 🚀 Features

### Core Modules (Implemented)
1.  **Student Management** - Admission, profiles, documents, guardians
2.  **Teacher/Staff Management** - Employee lifecycle, departments, attendance
3.  **Class/Section Management** - Academic structure, board configuration
4.  **Attendance** - Student & staff tracking
5.  **Examination & Grading** - Exam scheduling, mark entry, report cards, result analysis
6.  **Multi-Tenancy** - Complete data isolation per school
7.  **RBAC** - Role-Based Access Control

### Upcoming Modules (Phase 5+)
1.  **Finance Management** - Fees, invoices, expenses (Next)
2.  **Timetable** - Automated scheduling
3.  **Library Management** - Books, issue/return
4.  **Transport Management** - Routes, vehicles
5.  **Communication** - Messaging, announcements

### Technical Highlights
-   ✅ **Multi-Tenancy**: Schema-per-tenant for complete data isolation
-   ✅ **Board Support**: CBSE, ICSE, MPBSE with board-specific grading
-   ✅ **Scalable**: Supports 100+ schools
-   ✅ **Secure**: JWT auth, RBAC, data encryption, audit logs
-   ✅ **Modern Stack**: Django 5 + React 18 + Redux Toolkit

## 📋 Tech Stack

### Backend
-   **Framework**: Python 3.11 + Django 5.1 + Django REST Framework
-   **Databases**: PostgreSQL (schema-per-tenant), Redis (cache)
-   **Authentication**: JWT (SimpleJWT)
-   **API Docs**: drf-spectacular (Swagger/OpenAPI)

### Frontend
-   **Framework**: React 18 (Vite)
-   **State Management**: Redux Toolkit
-   **Routing**: React Router v6
-   **UI**: Tailwind CSS + Headless UI / Heroicons
-   **HTTP Client**: Axios

## 🏗️ Architecture

### Multi-Tenancy Model
```
PostgreSQL Database
├── public schema (shared)
│   ├── schools (tenant registry)
│   ├── subscriptions
│   ├── domains
│   └── super_admin_users
├── school_xyz schema (tenant 1)
│   ├── All school-specific tables (Students, Staff, Exams, etc.)
│   └── Complete data isolation
└── school_abc schema (tenant 2)
    └── Independent data
```

## 🚦 Getting Started

### Prerequisites
-   Python 3.11+
-   PostgreSQL 14+
-   Node.js 18+ (for frontend)
-   Redis (optional for dev)

### Installation (Development)

#### 1. Clone Repository
```bash
git clone <repository-url>
cd "School Mgmt System"
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements/base.txt

# Setup .env (copy from .env.example)
cp .env.example .env

# Run migrations (Public + Tenants)
python manage.py migrate_schemas --shared
python manage.py migrate_schemas --tenant

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

Backend URL: http://localhost:8000

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## 📊 Current Status

### **Overall Completion: ~85% (Phase 4 Complete)**

| Phase | Module | Status | Completion |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Foundation & Auth | ✅ Complete | 100% |
| **Phase 2** | Core Academics | ✅ Complete | 100% |
| **Phase 3** | Students & Staff | ✅ Complete | 100% |
| **Phase 4** | Examinations | ✅ Complete | 100% |
| **Phase 5** | **Finance** | ✅ Complete | 100% |
| **Phase 6** | **Communication** | ✅ Complete | 100% |

## 🗺️ Roadmap

### Phase 1-4: Core Foundation (Completed) ✅
-   Multi-tenancy infrastructure
-   Authentication & RBAC
-   Student & Staff lifecycle
-   Academic structure (Classes, Subjects)
-   Examination system (Marks, Results, Grading)

### Phase 5: Finance Module (Completed) ✅
-   Fee Structure Configuration
-   Student Fee Collection
-   Invoice Generation (PDF)
-   Expense Management
-   Financial Reporting

### Phase 6: Communication Module (Completed) ✅
-   Digital Notice Board
-   Event Calendar
-   SMS/Email Integration
-   In-app Notifications

### Phase 6+: Auxiliary Modules (Future)
-   Library Management
-   Transport Management
-   Communication Portal

## 📖 Documentation

-   **Backend API**: http://localhost:8000/api/docs/
-   **Phase Reports**:
    -   [PHASE4_COMPLETE.md](./PHASE4_COMPLETE.md)
    -   [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) (Detailed metrics)

## 📝 License
Proprietary software. All rights reserved.

---

**Version**: 0.4.0 (Phase 4 Complete)
**Last Updated**: January 2026
