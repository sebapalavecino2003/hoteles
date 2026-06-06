from django.urls import path
from apps.hotels.views import (
    hotel_list_create_view, hotel_detail_view,
    admin_dashboard_view, admin_employee_list_create_view,
    admin_reservation_list_view, employee_dashboard_view,
    room_type_list_create_view, room_type_detail_view,
    room_list_create_view, room_detail_view,
    extra_service_list_create_view, extra_service_detail_view,
    public_hotel_list_view, public_hotel_detail_view,
    public_room_availability_view,
)

urlpatterns = [
    path("hotels/", hotel_list_create_view, name="hotel-list-create"),
    path("hotels/<int:hotel_id>/", hotel_detail_view, name="hotel-detail"),
    path("hotels/<int:hotel_id>/room-types/", room_type_list_create_view, name="room-type-list-create"),
    path("hotels/<int:hotel_id>/room-types/<int:room_type_id>/", room_type_detail_view, name="room-type-detail"),
    path("hotels/<int:hotel_id>/room-types/<int:room_type_id>/rooms/", room_list_create_view, name="room-list-create"),
    path("hotels/<int:hotel_id>/rooms/<int:room_id>/", room_detail_view, name="room-detail"),
    path("hotels/<int:hotel_id>/extra-services/", extra_service_list_create_view, name="extra-service-list-create"),
    path("hotels/<int:hotel_id>/extra-services/<int:service_id>/", extra_service_detail_view, name="extra-service-detail"),
    path("public/hotels/", public_hotel_list_view, name="public-hotel-list"),
    path("public/hotels/<int:hotel_id>/", public_hotel_detail_view, name="public-hotel-detail"),
    path("public/hotels/<int:hotel_id>/availability/", public_room_availability_view, name="public-room-availability"),
    path("admin/dashboard/", admin_dashboard_view, name="admin-dashboard"),
    path("admin/employees/", admin_employee_list_create_view, name="admin-employees"),
    path("admin/reservations/", admin_reservation_list_view, name="admin-reservations"),
    path("employee/dashboard/", employee_dashboard_view, name="employee-dashboard"),
]
