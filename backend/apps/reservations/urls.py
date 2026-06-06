from django.urls import path
from apps.reservations.views import (
    reservation_create_view,
    reservation_detail_view,
    my_reservation_list_view,
    hotel_reservation_list_view,
    reservation_cancel_view,
    reservation_confirm_payment_view,
    process_payment_view,
    payment_history_view,
    hotel_payments_view,
    reservation_status_view,
)

urlpatterns = [
    path("reservations/", reservation_create_view, name="reservation-create"),
    path("reservations/mine/", my_reservation_list_view, name="my-reservations"),
    path("reservations/<int:reservation_id>/", reservation_detail_view, name="reservation-detail"),
    path("reservations/<int:reservation_id>/cancel/", reservation_cancel_view, name="reservation-cancel"),
    path("reservations/<int:reservation_id>/confirm-payment/", reservation_confirm_payment_view, name="reservation-confirm-payment"),
    path("reservations/<int:reservation_id>/pay/", process_payment_view, name="reservation-pay"),
    path("reservations/<int:reservation_id>/payments/", payment_history_view, name="payment-history"),
    path("hotels/<int:hotel_id>/reservations/", hotel_reservation_list_view, name="hotel-reservations"),
    path("hotels/<int:hotel_id>/payments/", hotel_payments_view, name="hotel-payments"),
    path("employee/reservations/<int:reservation_id>/status/", reservation_status_view, name="reservation-status"),
]
