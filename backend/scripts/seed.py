from apps.hotels.models import Hotel, RoomType, Room, ExtraService
from apps.reservations.models import Reservation
from django.contrib.auth import get_user_model
import re

User = get_user_model()
hotel = Hotel.objects.get(id=1)

# ========== LIMPIEZA ==========
print("🧹 Limpiando...")
Reservation.objects.filter(room__isnull=True).delete()
for rt in RoomType.objects.filter(hotel=hotel):
    if Room.objects.filter(room_type=rt).count() == 0:
        rt.delete()
seen = {}
for es in ExtraService.objects.filter(hotel=hotel):
    key = (es.name, es.price)
    if key in seen:
        es.delete()
    else:
        seen[key] = es.id

# ========== ROOM TYPES ==========
types_data = {
    "Standard": {"description": "Habitación estándar con cama queen", "price": 90, "max_guests": 2, "rooms": 10, "prefix": "STD"},
    "Deluxe":   {"description": "Habitación deluxe con cama king",   "price": 150, "max_guests": 3, "rooms": 5,  "prefix": "DLX"},
    "Suite":    {"description": "Suite presidencial con jacuzzi",    "price": 250, "max_guests": 4, "rooms": 3,  "prefix": "SUT"},
}

for name, data in types_data.items():
    rt, created = RoomType.objects.update_or_create(
        hotel=hotel, name=name,
        defaults={
            "description": data["description"],
            "price_per_night": data["price"],
            "max_guests": data["max_guests"],
            "is_active": True,
        }
    )
    flag = "Creado" if created else "Actualizado"
    print(f"  {flag}: {name} (${data['price']}/noche)")

    for r in Room.objects.filter(room_type=rt, is_active=True):
        if not re.match(rf'^{data["prefix"]}-\d{{3}}$', r.room_number):
            r.delete()

    existing = set(Room.objects.filter(room_type=rt).values_list("room_number", flat=True))
    for i in range(1, data["rooms"] + 1):
        rn = f"{data['prefix']}-{i:03d}"
        if rn not in existing:
            Room.objects.create(room_type=rt, room_number=rn, is_active=True)
            existing.add(rn)

# ========== EXTRA SERVICES ==========
services = [
    ("Desayuno VIP", "Buffet desayuno completo", 25),
    ("Parking", "Estacionamiento cubierto", 10),
    ("Spa", "Acceso al spa todo el día", 50),
    ("Piscina", "Acceso a piscina climatizada", 15),
]
for name, desc, price in services:
    ExtraService.objects.update_or_create(
        hotel=hotel, name=name,
        defaults={"description": desc, "price": price},
    )

print("\n✅ Seed completado!")
print("\nUsuarios (pass=test1234):")
for u in User.objects.all():
    print(f"  {u.email} (role={u.role})")
print(f"\nFrontend: http://localhost:5173/login")
