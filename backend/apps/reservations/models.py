from django.db import models
from apps.hotels.models import Hotel, RoomType, Room, ExtraService
from apps.users.models import User


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pending Payment"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="reservations")
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name="reservations")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name="reservations")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reservations")
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=20)
    guest_dni = models.CharField(max_length=20)
    guest_first_name = models.CharField(max_length=150, blank=True)
    guest_last_name = models.CharField(max_length=150, blank=True)
    check_in = models.DateField()
    check_out = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_PAYMENT)
    total_room_price = models.DecimalField(max_digits=10, decimal_places=2)
    extra_services_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reservation #{self.id} - {self.hotel.name} ({self.check_in} to {self.check_out})"


class ReservationExtraService(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name="selected_services")
    extra_service = models.ForeignKey(ExtraService, on_delete=models.CASCADE)
    price_at_booking = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ("reservation", "extra_service")

    def __str__(self):
        return f"{self.extra_service.name} for Reservation #{self.reservation_id}"


class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        MOCK = "mock", "Mock"
        MERCADO_PAGO = "mercadopago", "MercadoPago"
        CASH = "cash", "Cash"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.MOCK)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    transaction_id = models.CharField(max_length=100, blank=True)
    gateway_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment #{self.id} - {self.amount} - {self.status} for Reservation #{self.reservation_id}"
