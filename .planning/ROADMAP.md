# Roadmap: Hotel Booking SaaS

**Generated:** 2026-06-04
**Granularity:** Standard (5 phases, 3-5 plans each)
**Mode:** Vertical MVP

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation & Auth | Django project + Docker + JWT auth | AUTH-03, AUTH-04, AUTH-05, AUTH-06, INF-01, INF-02, TST-02 | 3 |
| 2 | Hotels & Rooms API | Hotel catalog + room management + multi-tenant isolation | HTL-01, HTL-02, HTL-03, ROM-01, ROM-02, ROM-03, ROM-04, ROM-05, ROM-06, MTN-01, MTN-02, MTN-03, MTN-04 | 4 |
| 3 | Reservations & Payments API | Full booking lifecycle + concurrency + mock payments + expiration | RES-01, RES-02, RES-03, RES-04, RES-05, RES-06, RES-07, RES-08, RES-09, RES-10, RES-11, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, CAN-01, CAN-02, CAN-03, CAN-04, TST-01, TST-02 | 5 |
| 4 | Frontend: Public Booking | Hotel search + availability + booking flow + guest checkout + Nginx full stack | AUTH-01, AUTH-02, RES-01, RES-02, RES-03, RES-04, INF-03 | 4 |
| 5 | Admin & Employee Panels | Admin dashboard + employee dashboards + React management UIs | ADM-01, ADM-02, ADM-03, EMP-01, EMP-02, EMP-03, EMP-04 | 4 |

**53 v1 requirements** | **53 mapped** | Coverage: 100% ✓

---

## Phase Details

### Phase 1: Foundation & Auth
**Goal:** Django project scaffolded with modular apps, PostgreSQL connected, Docker Compose running (Django API + PostgreSQL), and JWT authentication working.
**Mode:** mvp
**Success Criteria:**
1. Django project starts with `python manage.py runserver` inside Docker
2. PostgreSQL is connected and migrations run
3. User can register and receive JWT tokens (access + refresh)
4. User can log in and access a protected endpoint with valid token
5. User gets 401 with expired/invalid token

**Requirements:** AUTH-03, AUTH-04, AUTH-05, AUTH-06, INF-01, INF-02, TST-02

---

### Phase 2: Hotels & Rooms API
**Goal:** Full backend API for hotels and rooms management with strict multi-tenant isolation. Admin can create hotels and manage rooms. Public catalog endpoint works.
**Mode:** mvp
**Success Criteria:**
1. Admin can create, update, and deactivate hotels via API
2. Employee can create room types and physical rooms for their hotel
3. Employee cannot access another hotel's data
4. Public catalog lists all active hotels
5. Room availability query returns correct results for a date range
6. Extra services can be added per room

**Requirements:** HTL-01, HTL-02, HTL-03, ROM-01, ROM-02, ROM-03, ROM-04, ROM-05, ROM-06, MTN-01, MTN-02, MTN-03, MTN-04

---

### Phase 3: Reservations & Payments API
**Goal:** Complete backend booking lifecycle with concurrency-safe availability, mock payment processing, automatic expiration, and cancellation with refund.
**Mode:** mvp
**Success Criteria:**
1. Guest/user can create reservation (PENDING_PAYMENT)
2. System prevents double-booking under concurrent requests
3. Mock payment processes 50% and transitions to CONFIRMED
4. Physical room auto-assigned on payment confirmation
5. Unpaid reservations expire automatically after timeout
6. Valid cancellation (48h+) processes refund
7. Full reservation state machine works correctly
8. All Service classes have unit tests; all endpoints have API tests

**Requirements:** RES-01, RES-02, RES-03, RES-04, RES-05, RES-06, RES-07, RES-08, RES-09, RES-10, RES-11, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, CAN-01, CAN-02, CAN-03, CAN-04, TST-01, TST-02

---

### Phase 4: Frontend — Public Booking
**Goal:** React application with hotel search, room selection, booking form, and guest checkout flow. Nginx serves both React and Django in Docker.
**Mode:** mvp
**Success Criteria:**
1. Visitor can search and browse hotel catalog
2. User selects dates and sees available room types with prices
3. Guest can complete booking with email/phone/DNI (no account)
4. Guest can optionally create account linked to their reservation
5. Registered user can log in and book
6. Full booking flow works end-to-end in Docker (React → Nginx → Django → PostgreSQL)

**Requirements:** AUTH-01, AUTH-02, RES-01, RES-02, RES-03, RES-04, INF-03

---

### Phase 5: Admin & Employee Panels
**Goal:** Admin dashboard for platform management and employee dashboard for hotel operations, all consuming the backend API.
**Mode:** mvp
**Success Criteria:**
1. Admin can view/manage all hotels from dashboard
2. Admin can create employee accounts per hotel
3. Employee can view/manage their hotel's reservations
4. Employee can manage rooms and prices
5. Employee cannot access other hotels' data

**Requirements:** ADM-01, ADM-02, ADM-03, EMP-01, EMP-02, EMP-03, EMP-04

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 4 | Pending |
| AUTH-02 | Phase 4 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 5 | Pending |
| HTL-01 | Phase 2 | Pending |
| HTL-02 | Phase 2 | Pending |
| HTL-03 | Phase 2 | Pending |
| ROM-01 | Phase 2 | Pending |
| ROM-02 | Phase 2 | Pending |
| ROM-03 | Phase 2 | Pending |
| ROM-04 | Phase 2 | Pending |
| ROM-05 | Phase 2 | Pending |
| ROM-06 | Phase 2 | Pending |
| RES-01 | Phase 4 | Pending |
| RES-02 | Phase 4 | Pending |
| RES-03 | Phase 4 | Pending |
| RES-04 | Phase 4 | Pending |
| RES-05 | Phase 3 | Pending |
| RES-06 | Phase 3 | Pending |
| RES-07 | Phase 3 | Pending |
| RES-08 | Phase 3 | Pending |
| RES-09 | Phase 3 | Pending |
| RES-10 | Phase 3 | Pending |
| RES-11 | Phase 3 | Pending |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| PAY-04 | Phase 3 | Pending |
| PAY-05 | Phase 3 | Pending |
| PAY-06 | Phase 3 | Pending |
| CAN-01 | Phase 3 | Pending |
| CAN-02 | Phase 3 | Pending |
| CAN-03 | Phase 3 | Pending |
| CAN-04 | Phase 3 | Pending |
| ADM-01 | Phase 5 | Pending |
| ADM-02 | Phase 5 | Pending |
| ADM-03 | Phase 5 | Pending |
| EMP-01 | Phase 5 | Pending |
| EMP-02 | Phase 5 | Pending |
| EMP-03 | Phase 5 | Pending |
| EMP-04 | Phase 5 | Pending |
| MTN-01 | Phase 2 | Pending |
| MTN-02 | Phase 2 | Pending |
| MTN-03 | Phase 2 | Pending |
| MTN-04 | Phase 2 | Pending |
| INF-01 | Phase 1 | Pending |
| INF-02 | Phase 1 | Pending |
| INF-03 | Phase 4 | Pending |
| TST-01 | Phase 3 | Pending |
| TST-02 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0 ✓

---
*Last updated: 2026-06-04 after initialization*
