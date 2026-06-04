<!-- GSD:project-start source:PROJECT.md -->
## Project

**Hotel Booking SaaS**

A multi-tenant hotel reservation management platform (SaaS) where small hotels can manage bookings, rooms, availability, and payments. Clients can search hotels, check availability, and reserve rooms — as guests or registered users. Each hotel only accesses its own data. Built as a modular Django monolith with strict OOP separation, served by a decoupled React frontend.

**Core Value:** A client can find a hotel, check real-time availability, and complete a reservation with payment in a single flow — without double-bookings or manual intervention.

### Constraints

- **Tech Stack**: Django + DRF + PostgreSQL + React + Docker — fixed
- **OOP Priority**: All business logic in classes, not functions — enforced
- **Multi-tenant Isolation**: hotel_id filter on every query — mandatory
- **No Over-engineering**: MVP features only, no microservices, no complex pricing — hard boundary
- **Backend-centric**: Django is the source of truth; frontend is a pure API consumer
- **Testing**: Unit tests for services + API tests for endpoints — required for MVP
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
