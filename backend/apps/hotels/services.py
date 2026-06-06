
from apps.hotels.models import Hotel, RoomType, Room, ExtraService
from apps.hotels.permissions import require_hotel_access
from apps.users.models import User
from apps.reservations.models import Reservation


class HotelService:
    def get_hotel_by_id(self, hotel_id: int) -> Hotel | None:
        try:
            return Hotel.objects.get(id=hotel_id)
        except Hotel.DoesNotExist:
            return None

    def get_active_hotels(self):
        return Hotel.objects.filter(is_active=True)

    def search_hotels(self, query: str):
        return Hotel.objects.filter(
            is_active=True,
            name__icontains=query,
        ) | Hotel.objects.filter(
            is_active=True,
            city__icontains=query,
        ) | Hotel.objects.filter(
            is_active=True,
            country__icontains=query,
        )

    def _require_admin(self, user: User):
        if user.role not in (User.Role.ADMIN,):
            raise PermissionError("Only admins can manage hotels")

    def create_hotel(self, user: User, data: dict) -> Hotel:
        self._require_admin(user)
        return Hotel.objects.create(**data)

    def update_hotel(self, user: User, hotel_id: int, data: dict) -> Hotel:
        self._require_admin(user)
        hotel = self.get_hotel_by_id(hotel_id)
        if hotel is None:
            raise ValueError("Hotel not found")
        for field, value in data.items():
            setattr(hotel, field, value)
        hotel.save()
        return hotel

    def deactivate_hotel(self, user: User, hotel_id: int) -> Hotel:
        self._require_admin(user)
        hotel = self.get_hotel_by_id(hotel_id)
        if hotel is None:
            raise ValueError("Hotel not found")
        hotel.is_active = False
        hotel.save()
        return hotel

    def get_dashboard_counts(self, user: User) -> dict:
        self._require_admin(user)
        from apps.users.models import User as UserModel

        total_hotels = Hotel.objects.all().count()
        total_employees = UserModel.objects.filter(role=UserModel.Role.EMPLOYEE).count()
        total_reservations = Reservation.objects.count()
        total_pending = Reservation.objects.filter(status=Reservation.Status.PENDING_PAYMENT).count()

        return {
            "total_hotels": total_hotels,
            "total_employees": total_employees,
            "total_reservations": total_reservations,
            "total_pending_payments": total_pending,
        }


class RoomService:
    def _require_hotel_access(self, user: User, hotel_id: int):
        require_hotel_access(user, hotel_id)

    def get_room_type_by_id(self, room_type_id: int) -> RoomType | None:
        try:
            return RoomType.objects.get(id=room_type_id)
        except RoomType.DoesNotExist:
            return None

    def get_room_types_by_hotel(self, hotel_id: int):
        return RoomType.objects.filter(hotel_id=hotel_id)

    def get_room_by_id(self, room_id: int) -> Room | None:
        try:
            return Room.objects.select_related("room_type__hotel").get(id=room_id)
        except Room.DoesNotExist:
            return None

    def get_rooms_by_room_type(self, room_type_id: int):
        return Room.objects.filter(room_type_id=room_type_id)

    def get_extra_services_by_hotel(self, hotel_id: int):
        return ExtraService.objects.filter(hotel_id=hotel_id)

    def get_available_rooms_count(self, room_type_id: int, check_in, check_out) -> int:
        total = Room.objects.filter(room_type_id=room_type_id, is_active=True).count()
        conflict_ids = Reservation.objects.filter(
            room_type_id=room_type_id,
            status__in=[Reservation.Status.PENDING_PAYMENT, Reservation.Status.CONFIRMED],
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exclude(room__isnull=True).values_list("room_id", flat=True)
        booked = len(conflict_ids)
        return max(0, total - booked)

    def create_room_type(self, user: User, hotel_id: int, data: dict) -> RoomType:
        self._require_hotel_access(user, hotel_id)
        return RoomType.objects.create(hotel_id=hotel_id, **data)

    def update_room_type(self, user: User, hotel_id: int, room_type_id: int, data: dict) -> RoomType:
        self._require_hotel_access(user, hotel_id)
        room_type = self.get_room_type_by_id(room_type_id)
        if room_type is None or room_type.hotel_id != hotel_id:
            raise ValueError("Room type not found")
        for field, value in data.items():
            setattr(room_type, field, value)
        room_type.save()
        return room_type

    def delete_room_type(self, user: User, hotel_id: int, room_type_id: int) -> None:
        self._require_hotel_access(user, hotel_id)
        room_type = self.get_room_type_by_id(room_type_id)
        if room_type is None or room_type.hotel_id != hotel_id:
            raise ValueError("Room type not found")
        room_type.delete()

    def create_room(self, user: User, hotel_id: int, room_type_id: int, data: dict) -> Room:
        self._require_hotel_access(user, hotel_id)
        room_type = self.get_room_type_by_id(room_type_id)
        if room_type is None or room_type.hotel_id != hotel_id:
            raise ValueError("Room type not found")
        return Room.objects.create(room_type_id=room_type_id, **data)

    def update_room(self, user: User, hotel_id: int, room_id: int, data: dict) -> Room:
        self._require_hotel_access(user, hotel_id)
        room = self.get_room_by_id(room_id)
        if room is None or room.room_type.hotel_id != hotel_id:
            raise ValueError("Room not found")
        for field, value in data.items():
            setattr(room, field, value)
        room.save()
        return room

    def delete_room(self, user: User, hotel_id: int, room_id: int) -> None:
        self._require_hotel_access(user, hotel_id)
        room = Room.objects.filter(id=room_id, room_type__hotel_id=hotel_id).first()
        if room is None:
            raise ValueError("Room not found")
        room.delete()

    def create_extra_service(self, user: User, hotel_id: int, data: dict) -> ExtraService:
        self._require_hotel_access(user, hotel_id)
        return ExtraService.objects.create(hotel_id=hotel_id, **data)

    def update_extra_service(self, user: User, hotel_id: int, service_id: int, data: dict) -> ExtraService:
        self._require_hotel_access(user, hotel_id)
        service = ExtraService.objects.filter(id=service_id, hotel_id=hotel_id).first()
        if service is None:
            raise ValueError("Extra service not found")
        for field, value in data.items():
            setattr(service, field, value)
        service.save()
        return service

    def delete_extra_service(self, user: User, hotel_id: int, service_id: int) -> None:
        self._require_hotel_access(user, hotel_id)
        service = ExtraService.objects.filter(id=service_id, hotel_id=hotel_id).first()
        if service is None:
            raise ValueError("Extra service not found")
        service.delete()

    def get_available_room_types(self, hotel_id: int, check_in: str, check_out: str) -> list:
        room_types = self.get_room_types_by_hotel(hotel_id).filter(is_active=True)
        result = []
        for rt in room_types:
            available = self.get_available_rooms_count(rt.id, check_in, check_out)
            result.append({
                "room_type": rt,
                "available_rooms_count": available,
            })
        return result

    def public_room_types(self, hotel_id: int):
        return self.get_room_types_by_hotel(hotel_id).filter(is_active=True)
