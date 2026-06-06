from django.contrib import admin
from apps.reservations.models import Reservation, ReservationExtraService, Payment


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id", "hotel", "room_type", "status", "check_in", "check_out", "total_price", "created_at")
    list_filter = ("status", "hotel")
    search_fields = ("guest_email", "guest_dni", "hotel__name")


@admin.register(ReservationExtraService)
class ReservationExtraServiceAdmin(admin.ModelAdmin):
    list_display = ("reservation", "extra_service", "price_at_booking")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "reservation", "amount", "payment_method", "status", "transaction_id", "created_at")
    list_filter = ("status", "payment_method")
