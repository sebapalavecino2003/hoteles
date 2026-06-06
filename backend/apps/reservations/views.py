from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.reservations.services import ReservationService, PaymentService, CancellationService
from apps.reservations.serializers import (
    ReservationSerializer,
    ReservationCreateSerializer,
    ReservationListSerializer,
    PaymentSerializer,
)
from apps.reservations.permissions import has_hotel_access, check_hotel_access
from apps.users.models import User


@api_view(["POST"])
@permission_classes([AllowAny])
def reservation_create_view(request):
    serializer = ReservationCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    service = ReservationService()
    user = request.user if request.user.is_authenticated else None

    try:
        reservation = service.create_reservation(
            user_or_none=user,
            hotel_id=serializer.validated_data.get("hotel_id"),
            room_type_id=serializer.validated_data["room_type_id"],
            check_in=serializer.validated_data["check_in"],
            check_out=serializer.validated_data["check_out"],
            guest_data=serializer.validated_data,
            extra_service_ids=serializer.validated_data.get("extra_service_ids", []),
        )
        data = ReservationSerializer(reservation).data
        data["hotel_id"] = serializer.validated_data.get("hotel_id")
        return Response(data, status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reservation_detail_view(request, reservation_id):
    service = ReservationService()
    reservation = service.get_by_id(reservation_id)
    if reservation is None:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user.role == User.Role.CLIENT and reservation.user_id != user.id:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    if user.role == User.Role.EMPLOYEE and user.hotel_id != reservation.hotel_id:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    data = ReservationSerializer(reservation).data
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_reservation_list_view(request):
    service = ReservationService()
    reservations = service.get_user_reservations(request.user)
    serializer = ReservationListSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hotel_reservation_list_view(request, hotel_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    service = ReservationService()
    reservations = service.get_hotel_reservations(hotel_id)
    status_filter = request.query_params.get("status")
    if status_filter:
        reservations = reservations.filter(status=status_filter)
    serializer = ReservationListSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reservation_cancel_view(request, reservation_id):
    service = CancellationService()
    try:
        result = service.cancel(reservation_id, user=request.user)
        data = ReservationSerializer(result["reservation"]).data
        data["refund_amount"] = str(result["refund_amount"])
        data["cancelled_at"] = result["cancelled_at"].isoformat()
        return Response(data)
    except PermissionError as e:
        return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reservation_confirm_payment_view(request, reservation_id):
    service = ReservationService()
    try:
        reservation = service.confirm_payment(reservation_id)
        data = ReservationSerializer(reservation).data
        return Response(data)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_payment_view(request, reservation_id):
    service = PaymentService()
    try:
        result = service.process_payment(reservation_id)
        return Response({
            "success": result["success"],
            "payment": PaymentSerializer(result["payment"]).data,
            "remaining": str(result["remaining"]),
            "reservation": ReservationSerializer(result["reservation"]).data,
        })
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_history_view(request, reservation_id):
    service = ReservationService()
    reservation = service.get_by_id(reservation_id)
    if reservation is None:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user.role == User.Role.CLIENT and reservation.user_id != user.id:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    if user.role == User.Role.EMPLOYEE and user.hotel_id != reservation.hotel_id:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    payment_service = PaymentService()
    payments = payment_service.get_payments_for_reservation(reservation_id)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def reservation_status_view(request, reservation_id):
    service = ReservationService()
    new_status = request.data.get("status")
    if not new_status:
        return Response({"detail": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        reservation = service.change_status(reservation_id, new_status, request.user)
        data = ReservationSerializer(reservation).data
        return Response(data)
    except PermissionError as e:
        return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hotel_payments_view(request, hotel_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    payment_service = PaymentService()
    payments = payment_service.get_payments_for_hotel(hotel_id)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)
