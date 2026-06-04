# Hotel Booking SaaS

## What This Is

A multi-tenant hotel reservation management platform (SaaS) where small hotels can manage bookings, rooms, availability, and payments. Clients can search hotels, check availability, and reserve rooms — as guests or registered users. Each hotel only accesses its own data. Built as a modular Django monolith with strict OOP separation, served by a decoupled React frontend.

## Core Value

A client can find a hotel, check real-time availability, and complete a reservation with payment in a single flow — without double-bookings or manual intervention.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Multi-hotel catalog with search
- [ ] Real-time room availability check by dates
- [ ] Guest reservation (email + phone + DNI, no account required)
- [ ] Guest-to-account conversion after booking
- [ ] JWT authentication with 3 roles (client, employee, admin)
- [ ] Automatic room assignment on payment confirmation
- [ ] 50% online payment simulation (mock) + 50% at hotel
- [ ] Configurable MercadoPago SDK for production
- [ ] Reservation lifecycle: PENDING_PAYMENT → CONFIRMED → COMPLETED / CANCELLED
- [ ] Automatic expiration of unpaid reservations (background task)
- [ ] Cancellation with mock refund (48h policy, configurable per hotel)
- [ ] Employee panel (manage their hotel's reservations, rooms, prices)
- [ ] Admin panel (create hotels, manage everything)
- [ ] Extra services (breakfast, parking) per room
- [ ] Strict multi-tenant isolation (hotel_id on all queries)
- [ ] Concurrency-safe booking (no overbooking under any circumstance)
- [ ] Docker development environment (Django API, React, PostgreSQL, Nginx)

### Out of Scope

- Invoicing / billing — not needed for MVP
- Multi-currency — single currency for MVP
- Seasonal / dynamic pricing — fixed price per room type
- Microservices architecture — modular monolith only
- Micro-frontends — single React SPA
- Real production deployment with SSL/domain — Docker compose dev only

## Context

The system is a marketplace-style SaaS for small to medium hotels. Each hotel is a tenant with full data isolation. The business model is selling the platform to hotels, not booking commissions.

Clients can book as guests (no account) and optionally create an account linked to their reservation history. Employees are hotel staff who manage operations. Admins are global platform operators.

The backend follows Domain-Driven Design principles with clear separation: Models (domain entities), Services (business logic in OOP classes), Repositories (data access encapsulation), and Views (thin orchestration). DRF views must not contain business logic — all rules live in Service classes.

Availability is checked in real-time using room types with automatic physical room assignment at payment confirmation. Concurrency is handled via database-level locking (`select_for_update`) to prevent double-booking.

Payments use a mock for development with a real MercadoPago SDK adapter configurable for production. Unpaid reservations expire automatically via a scheduled background task.

## Constraints

- **Tech Stack**: Django + DRF + PostgreSQL + React + Docker — fixed
- **OOP Priority**: All business logic in classes, not functions — enforced
- **Multi-tenant Isolation**: hotel_id filter on every query — mandatory
- **No Over-engineering**: MVP features only, no microservices, no complex pricing — hard boundary
- **Backend-centric**: Django is the source of truth; frontend is a pure API consumer
- **Testing**: Unit tests for services + API tests for endpoints — required for MVP

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Modular monolith | Simpler than microservices, scales well for MVP | — Pending |
| Room type + auto-assignment | Avoids managing individual room inventory; system picks available room on payment | — Pending |
| select_for_update locking | Prevents double-booking under concurrent requests | — Pending |
| Mock payments first | Faster iteration; SDK adapter prepared for production switch | — Pending |
| Celery / management command for expiration | Automatic cleanup without user intervention | — Pending |
| Guest-first booking flow | Removes friction; account optional | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-04 after initialization*
