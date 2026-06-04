# Walking Skeleton — Hotel Booking SaaS

**Phase:** 1
**Generated:** 2026-06-04

## Capability Proven End-to-End

A user can register with email/password and log in to receive JWT tokens via the Django REST API, running inside Docker with PostgreSQL — proving the full stack works from HTTP request to database write.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Django 5 + DRF 3.15 | Mature REST framework, ORM, admin, ecosystem. Matches project requirements. |
| Auth | JWT (django-rest-framework-simplejwt) | Stateless auth, required by spec, simplejwt is the DRF-standard library. |
| User model | Custom AbstractBaseUser with email as identifier | Email-based auth (no username), role field for multi-tenant permissions, hotel_id FK for employee scoping. |
| Database | PostgreSQL 16 via Docker | Required by spec, jsonb for future flexibility, well-supported in Django. |
| ORM | Django ORM + Repository pattern | Repository classes encapsulate queries, keeping services testable and ORM-swappable. |
| Containerization | Docker Compose with bind mounts | Hot reload in development, 4-service architecture (api, db, frontend, nginx) for later phases. |
| Settings | Split settings (base.py + local.py) | Environment-aware config, local.py for dev overrides, production-ready later. |
| Service layer | OOP classes (not functions) | RegistrationService, AuthService as classes with clear methods. Mandated by project OOP priority. |

## Stack Touched in Phase 1

- [x] Project scaffold (Django, DRF, settings split, requirements)
- [x] Routing — `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/refresh/`, `/api/auth/me/`
- [x] Database — PostgreSQL with CustomUser model (one real write: register; one real read: login/me)
- [x] UI — API-only (no browser UI yet; verified via curl/HTTPie)
- [x] Deployment — Docker Compose with `docker compose up`, documented run command

## Out of Scope (Deferred to Later Phases)

- React frontend (Nginx + SPA in Phase 4)
- Nginx reverse proxy (Phase 4)
- Hotel model and multi-tenant filtering (Phase 2)
- Room types and physical rooms (Phase 2)
- Email verification and password reset
- OAuth / social login
- MercadoPago SDK integration (Phase 3)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Hotels & Rooms API — hotel catalog, room management, multi-tenant isolation
- Phase 3: Reservations & Payments API — booking lifecycle, concurrency safety, mock payments
- Phase 4: Frontend: Public Booking — React SPA, hotel search, guest checkout, Nginx full stack
- Phase 5: Admin & Employee Panels — dashboards for platform and hotel management
