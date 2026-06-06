# Hotel Booking SaaS — Backend

Modular Django monolith for multi-tenant hotel reservation management.

## Apps

- **users**: Custom User model (client/employee/admin) + JWT auth
- **hotels**: Hotel, RoomType, Room, ExtraService CRUD + availability
- **reservations**: Reservation lifecycle, payments (mock gateway), cancellations

## Setup

```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Stack

Django 5 + DRF + PostgreSQL + SimpleJWT
