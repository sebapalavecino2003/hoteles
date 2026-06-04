# Requirements: Hotel Booking SaaS

**Defined:** 2026-06-04
**Core Value:** A client can find a hotel, check real-time availability, and complete a reservation with payment in a single flow — without double-bookings or manual intervention.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Users

- [ ] **AUTH-01**: Guest can create a reservation with only email, phone, and DNI (no account required)
- [ ] **AUTH-02**: Guest can convert to registered account after booking (link reservation to new account)
- [ ] **AUTH-03**: User can register with email and password
- [ ] **AUTH-04**: User can log in with JWT (access + refresh tokens)
- [ ] **AUTH-05**: User can log out
- [ ] **AUTH-06**: User session respects role-based access (client, employee, admin)
- [ ] **AUTH-07**: Employee can only access their own hotel's data

### Hotels

- [ ] **HTL-01**: Admin can create hotels (name, description, address, contact info)
- [ ] **HTL-02**: Admin can update / deactivate hotels
- [ ] **HTL-03**: Any visitor can browse/search the hotel catalog

### Rooms

- [ ] **ROM-01**: Admin/employee can create room types (simple, doble, suite) per hotel
- [ ] **ROM-02**: Admin/employee can set price per night per room type
- [ ] **ROM-03**: Admin/employee can add physical room instances under each room type
- [ ] **ROM-04**: Admin/employee can add extra services (breakfast, parking) with prices
- [ ] **ROM-05**: Any visitor can view available room types for a hotel + date range
- [ ] **ROM-06**: System assigns specific physical room only at payment confirmation

### Reservations

- [ ] **RES-01**: Guest/user can search hotels by name, city, or destination
- [ ] **RES-02**: Guest/user can select dates (check-in / check-out) and room type
- [ ] **RES-03**: System shows real-time availability and total price
- [ ] **RES-04**: Guest/user can create a reservation (enters guest info if guest)
- [ ] **RES-05**: Reservation starts in PENDING_PAYMENT state
- [ ] **RES-06**: System prevents overbooking via `select_for_update` locking
- [ ] **RES-07**: Unpaid reservations expire after 15-30 min (background auto-cleanup)
- [ ] **RES-08**: On payment confirmation, system auto-assigns a physical room
- [ ] **RES-09**: Reservation transitions: PENDING_PAYMENT → CONFIRMED → COMPLETED / CANCELLED
- [ ] **RES-10**: Employee can view/manage reservations for their hotel
- [ ] **RES-11**: Admin can view/manage all reservations across hotels

### Payments

- [ ] **PAY-01**: System calculates total: room price × nights + extra services
- [ ] **PAY-02**: User pays 50% online via mock payment gateway
- [ ] **PAY-03**: Remaining 50% marked as "pay at hotel"
- [ ] **PAY-04**: If payment fails, reservation remains PENDING_PAYMENT (will expire)
- [ ] **PAY-05**: Payment history visible to employee and admin
- [ ] **PAY-06**: MercadoPago SDK adapter available (configurable, not required for dev)

### Cancellations

- [ ] **CAN-01**: User can cancel reservation up to 48h before check-in
- [ ] **CAN-02**: Cancellation policy configurable per hotel
- [ ] **CAN-03**: On valid cancellation, system processes mock refund of 50% paid
- [ ] **CAN-04**: Cancelled reservation moves to CANCELLED state

### Admin Panel

- [ ] **ADM-01**: Admin dashboard to manage all hotels
- [ ] **ADM-02**: Admin can create/edit employee accounts per hotel
- [ ] **ADM-03**: Admin can view platform-wide stats

### Employee Panel

- [ ] **EMP-01**: Employee dashboard scoped to their hotel
- [ ] **EMP-02**: Employee can manage room types, rooms, prices
- [ ] **EMP-03**: Employee can manage reservations for their hotel
- [ ] **EMP-04**: Employee can view check-ins and check-outs

### Multi-Tenant Security

- [ ] **MTN-01**: Every table includes `hotel_id` for data isolation
- [ ] **MTN-02**: All queries filter by `hotel_id` based on authenticated user's hotel
- [ ] **MTN-03**: Employees cannot access or modify data from other hotels
- [ ] **MTN-04**: Guests only see public data (hotel catalog, availability)

### Infrastructure

- [ ] **INF-01**: Docker Compose with 4 services: Django API, React frontend, PostgreSQL, Nginx
- [ ] **INF-02**: Hot reload in development for Django and React
- [ ] **INF-03**: Nginx routes `/api/` to Django and `/` to React

### Testing

- [ ] **TST-01**: Unit tests for all Service classes
- [ ] **TST-02**: API tests for all endpoints

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Features

- **FTR-01**: Real MercadoPago SDK integration in production
- **FTR-02**: OAuth login (Google, GitHub)
- **FTR-03**: Email notifications (confirmation, reminders, cancellation)
- **FTR-04**: Multi-currency support
- **FTR-05**: Seasonal / dynamic pricing
- **FTR-06**: Invoicing and receipt generation
- **FTR-07**: Reviews and ratings per hotel

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Invoicing / billing | Not needed for MVP |
| Multi-currency | Single currency for MVP |
| Seasonal / dynamic pricing | Fixed price per room type for MVP |
| Microservices | Modular monolith only |
| Micro-frontends | Single React SPA |
| Production deployment with SSL/domain | Docker compose dev only |
| Real MercadoPago in MVP | Mock first, SDK adapter ready for later |
| Email service | Manual confirmation for MVP |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

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
*Requirements defined: 2026-06-04*
*Last updated: 2026-06-04 after initial definition*
