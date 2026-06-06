from datetime import timedelta, date, datetime, timezone
from decimal import Decimal
from uuid import uuid4
import random

from django.db import transaction
from django.utils import timezone as tz

from apps.reservations.models import Reservation, ReservationExtraService, Payment
from apps.reservations.permissions import require_hotel_access
from apps.hotels.models import Hotel, RoomType, Room, ExtraService
from apps.users.models import User


class MockPaymentGateway:
    def charge(self, amount: Decimal, currency: str = "USD") -> dict:
        success = random.random() < 0.9
        return {
            "success": success,
            "transaction_id": str(uuid4()),
            "gateway": "mock",
            "amount": amount,
            "currency": currency,
        }

    def refund(self, transaction_id: str, amount: Decimal) -> dict:
        return {
            "success": True,
            "transaction_id": str(uuid4()),
            "gateway": "mock",
            "refunded_amount": amount,
        }



class ReservationService:
    def _validate_dates(self, check_in: date, check_out: date):
        if check_in >= check_out:
            raise ValueError("Check-in must be before check-out")
        if check_in < date.today():
            raise ValueError("Check-in cannot be in the past")

    def _calculate_total_price(self, room_type, check_in: date, check_out: date, extra_service_ids: list[int] | None = None) -> dict:
        nights = (check_out - check_in).days
        total_room = room_type.price_per_night * Decimal(str(nights))
        extra_price = Decimal("0")
        if extra_service_ids:
            services = ExtraService.objects.filter(id__in=extra_service_ids, hotel_id=room_type.hotel_id, is_active=True)
            for service in services:
                extra_price += service.price
        total = total_room + extra_price
        return {
            "total_room_price": total_room,
            "extra_services_price": extra_price,
            "total_price": total,
            "nights": nights,
        }

    def get_by_id(self, reservation_id: int) -> Reservation | None:
        try:
            return Reservation.objects.select_related(
                "hotel", "room_type", "room", "user"
            ).get(id=reservation_id)
        except Reservation.DoesNotExist:
            return None

    def get_conflict_reservations(self, room_type_id: int, check_in, check_out):
        return Reservation.objects.filter(
            room_type_id=room_type_id,
            status__in=[Reservation.Status.PENDING_PAYMENT, Reservation.Status.CONFIRMED],
            check_in__lt=check_out,
            check_out__gt=check_in,
        )

    def get_conflict_room_ids(self, room_type_id: int, check_in, check_out):
        return self.get_conflict_reservations(room_type_id, check_in, check_out).exclude(
            room__isnull=True
        ).values_list("room_id", flat=True)

    def get_all_reservations(self):
        return Reservation.objects.all().select_related("room_type", "room", "user")

    def get_hotel_reservations(self, hotel_id: int):
        return Reservation.objects.filter(hotel_id=hotel_id).select_related(
            "room_type", "room", "user"
        )

    def get_user_reservations(self, user):
        return Reservation.objects.filter(user_id=user.id).select_related(
            "hotel", "room_type", "room"
        )

    def get_pending_payment_expired(self, minutes: int = 30):
        cutoff = tz.now() - timedelta(minutes=minutes)
        return Reservation.objects.filter(
            status=Reservation.Status.PENDING_PAYMENT,
            created_at__lt=cutoff,
        )

    def create_reservation(self, user_or_none, hotel_id: int, room_type_id: int, check_in: date, check_out: date, guest_data: dict, extra_service_ids: list[int] | None = None) -> Reservation:
        self._validate_dates(check_in, check_out)

        hotel = Hotel.objects.filter(id=hotel_id, is_active=True).first()
        if hotel is None:
            raise ValueError("Hotel not found or inactive")

        room_type = RoomType.objects.filter(id=room_type_id, hotel_id=hotel_id, is_active=True).first()
        if room_type is None:
            raise ValueError("Room type not found or inactive")

        with transaction.atomic():
            locked = RoomType.objects.select_for_update().get(id=room_type_id)
            total = Room.objects.filter(room_type_id=room_type_id, is_active=True).count()
            conflict_ids = self.get_conflict_room_ids(room_type_id, check_in, check_out)
            booked = len(conflict_ids)
            available = max(0, total - booked)
            if available == 0:
                raise ValueError("No rooms available for the selected dates")

            price_info = self._calculate_total_price(locked, check_in, check_out, extra_service_ids)

            data = {
                "hotel_id": hotel_id,
                "room_type_id": room_type_id,
                "check_in": check_in,
                "check_out": check_out,
                "guest_email": guest_data.get("email", ""),
                "guest_phone": guest_data.get("phone", ""),
                "guest_dni": guest_data.get("dni", ""),
                "guest_first_name": guest_data.get("first_name", ""),
                "guest_last_name": guest_data.get("last_name", ""),
                "total_room_price": price_info["total_room_price"],
                "extra_services_price": price_info["extra_services_price"],
                "total_price": price_info["total_price"],
                "status": Reservation.Status.PENDING_PAYMENT,
            }
            if user_or_none and user_or_none.is_authenticated:
                data["user"] = user_or_none

            reservation = Reservation.objects.create(**data)

            if extra_service_ids:
                services = ExtraService.objects.filter(id__in=extra_service_ids, hotel_id=hotel_id, is_active=True)
                for service in services:
                    ReservationExtraService.objects.create(
                        reservation=reservation,
                        extra_service=service,
                        price_at_booking=service.price,
                    )

        return reservation

    def confirm_payment(self, reservation_id: int) -> Reservation:
        reservation = self.get_by_id(reservation_id)
        if reservation is None:
            raise ValueError("Reservation not found")
        if reservation.status != Reservation.Status.PENDING_PAYMENT:
            raise ValueError(f"Cannot confirm payment: reservation is {reservation.status}")

        with transaction.atomic():
            locked_type = RoomType.objects.select_for_update().get(id=reservation.room_type_id)
            locked = Reservation.objects.select_for_update().get(id=reservation_id)

            conflict_ids = Reservation.objects.filter(
                room_type_id=locked.room_type_id,
                status__in=[Reservation.Status.PENDING_PAYMENT, Reservation.Status.CONFIRMED],
                check_in__lt=locked.check_out,
                check_out__gt=locked.check_in,
            ).exclude(room__isnull=True).values_list("room_id", flat=True)

            room = Room.objects.filter(
                room_type_id=locked.room_type_id,
                is_active=True,
            ).exclude(id__in=conflict_ids).first()

            if room is None:
                raise ValueError("No rooms available to assign")

            locked.room = room
            locked.status = Reservation.Status.CONFIRMED
            locked.save()

        return locked

    def cancel_reservation(self, reservation_id: int) -> Reservation:
        reservation = self.get_by_id(reservation_id)
        if reservation is None:
            raise ValueError("Reservation not found")
        if reservation.status in (Reservation.Status.CANCELLED, Reservation.Status.COMPLETED):
            raise ValueError(f"Cannot cancel: reservation is {reservation.status}")
        reservation.status = Reservation.Status.CANCELLED
        reservation.save()
        return reservation

    def expire_reservation(self, reservation_id: int) -> Reservation:
        reservation = self.get_by_id(reservation_id)
        if reservation is None:
            raise ValueError("Reservation not found")
        if reservation.status != Reservation.Status.PENDING_PAYMENT:
            raise ValueError(f"Cannot expire: reservation is {reservation.status}")
        reservation.status = Reservation.Status.CANCELLED
        reservation.save()
        return reservation

    def change_status(self, reservation_id: int, new_status: str, user: User) -> Reservation:
        reservation = self.get_by_id(reservation_id)
        if reservation is None:
            raise ValueError("Reservation not found")

        require_hotel_access(user, reservation.hotel_id)

        valid_statuses = [s.value for s in Reservation.Status]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status: {new_status}")

        current = reservation.status
        allowed = {
            Reservation.Status.CONFIRMED: [
                Reservation.Status.PENDING_PAYMENT, Reservation.Status.CANCELLED,
            ],
            Reservation.Status.COMPLETED: [Reservation.Status.CONFIRMED],
            Reservation.Status.CANCELLED: [
                Reservation.Status.PENDING_PAYMENT, Reservation.Status.CONFIRMED,
            ],
        }

        if new_status not in allowed or current not in allowed[new_status]:
            raise ValueError(f"Cannot change status from {current} to {new_status}")

        reservation.status = new_status
        reservation.save()
        return reservation


class PaymentService:
    def __init__(self, gateway=None):
        self.gateway = gateway or MockPaymentGateway()
        self.gateway = gateway or MockPaymentGateway()

    def process_payment(self, reservation_id: int) -> dict:
        try:
            reservation = Reservation.objects.select_related(
                "hotel", "room_type", "room", "user"
            ).get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValueError("Reservation not found")

        if reservation.status != Reservation.Status.PENDING_PAYMENT:
            raise ValueError(f"Cannot process payment: reservation is {reservation.status}")

        online_amount = reservation.total_price * Decimal("0.50")
        remaining = reservation.total_price - online_amount

        gateway_result = self.gateway.charge(online_amount)

        serialized_gateway = {}
        for k, v in gateway_result.items():
            serialized_gateway[k] = str(v) if isinstance(v, Decimal) else v

        if gateway_result["success"]:
            payment = Payment.objects.create(
                reservation=reservation,
                amount=online_amount,
                payment_method=Payment.PaymentMethod.MOCK,
                status=Payment.PaymentStatus.SUCCESS,
                transaction_id=gateway_result["transaction_id"],
                gateway_response=serialized_gateway,
            )
            confirmed = ReservationService().confirm_payment(reservation_id)
            return {
                "success": True,
                "payment": payment,
                "remaining": remaining,
                "reservation": confirmed,
            }
        else:
            payment = Payment.objects.create(
                reservation=reservation,
                amount=online_amount,
                payment_method=Payment.PaymentMethod.MOCK,
                status=Payment.PaymentStatus.FAILED,
                transaction_id=gateway_result["transaction_id"],
                gateway_response=serialized_gateway,
            )
            return {
                "success": False,
                "payment": payment,
                "remaining": remaining,
                "reservation": reservation,
            }

    def process_refund(self, reservation_id: int) -> dict:
        try:
            reservation = Reservation.objects.get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValueError("Reservation not found")

        payments = Payment.objects.filter(
            reservation=reservation,
            status=Payment.PaymentStatus.SUCCESS,
        )
        total_refund = Decimal("0")
        refunded = []
        for payment in payments:
            gateway_result = self.gateway.refund(payment.transaction_id, payment.amount)
            payment.status = Payment.PaymentStatus.REFUNDED
            payment.save()
            total_refund += payment.amount
            refunded.append(payment)

        return {
            "success": True,
            "refunded_amount": total_refund,
            "refunded_payments": refunded,
        }

    def get_payments_for_reservation(self, reservation_id: int):
        return Payment.objects.filter(reservation_id=reservation_id)

    def get_payments_for_hotel(self, hotel_id: int):
        return Payment.objects.filter(reservation__hotel_id=hotel_id).select_related("reservation")


class CancellationService:
    def __init__(self, payment_service: PaymentService = None, reservation_service: ReservationService = None):
        self.payment_service = payment_service or PaymentService()
        self.reservation_service = reservation_service or ReservationService()

    def _get_hotel_cancellation_policy(self, hotel_id: int) -> dict:
        hotel = Hotel.objects.filter(id=hotel_id).first()
        if hotel is None:
            raise ValueError("Hotel not found")
        return {
            "cancellation_hours": hotel.cancellation_hours,
            "free_cancellation": True,
        }

    def _can_bypass_policy(self, user: User | None, hotel_id: int) -> bool:
        if user is None:
            return False
        if user.role == User.Role.ADMIN:
            return True
        if user.role == User.Role.EMPLOYEE and user.hotel_id == hotel_id:
            return True
        return False

    def cancel(self, reservation_id: int, user: User | None = None) -> dict:
        reservation = self.reservation_service.get_by_id(reservation_id)
        if reservation is None:
            raise ValueError("Reservation not found")
        if reservation.status in (Reservation.Status.CANCELLED, Reservation.Status.COMPLETED):
            raise ValueError(f"Cannot cancel: reservation is {reservation.status}")

        if user and user.role == User.Role.CLIENT and reservation.user_id != user.id:
            raise PermissionError("You do not have permission to cancel this reservation")

        can_bypass = self._can_bypass_policy(user, reservation.hotel_id)
        refund_amount = 0
        should_refund = False

        if not can_bypass:
            now = tz.now()
            check_in = reservation.check_in
            check_in_datetime = datetime.combine(check_in, datetime.min.time(), tzinfo=timezone.utc)
            hours_until_checkin = (check_in_datetime - now).total_seconds() / 3600
            policy = self._get_hotel_cancellation_policy(reservation.hotel_id)
            if hours_until_checkin < policy["cancellation_hours"]:
                pass
            else:
                should_refund = True
                refund_amount = reservation.total_price
        else:
            should_refund = True
            refund_amount = reservation.total_price

        cancelled = self.reservation_service.cancel_reservation(reservation_id)

        refund_result = None
        if should_refund and refund_amount > 0:
            try:
                refund_result = self.payment_service.process_refund(reservation_id)
            except Exception:
                pass

        return {
            "reservation": cancelled,
            "refund_amount": refund_result["refunded_amount"] if refund_result else 0,
            "cancelled_at": tz.now(),
        }
