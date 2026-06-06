import traceback
from datetime import date

from django.db import IntegrityError

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response

from apps.hotels.services import HotelService, RoomService
from apps.hotels.serializers import (
    HotelSerializer,
    HotelCreateSerializer,
    HotelListSerializer,
    RoomTypeSerializer,
    RoomSerializer,
    ExtraServiceSerializer,
    RoomTypeListSerializer,
)
from apps.users.models import User
from apps.users.services import RegistrationService
from apps.users.serializers import UserSerializer
from apps.reservations.serializers import ReservationListSerializer
from apps.reservations.services import ReservationService
from apps.hotels.permissions import has_hotel_access, check_hotel_access


# --- Hotel CRUD (admin) ---

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def hotel_list_create_view(request):
    service = HotelService()
    if request.method == "GET":
        hotels = service.get_active_hotels()
        serializer = HotelSerializer(hotels, many=True)
        return Response(serializer.data)

    serializer = HotelCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        hotel = service.create_hotel(request.user, serializer.validated_data)
        out = HotelSerializer(hotel)
        return Response(out.data, status=status.HTTP_201_CREATED)
    except PermissionError as e:
        return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def hotel_detail_view(request, hotel_id):
    service = HotelService()
    if request.method == "GET":
        hotel = service.get_hotel_by_id(hotel_id)
        if hotel is None:
            return Response({"detail": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = HotelSerializer(hotel)
        return Response(serializer.data)

    if request.method in ("PUT", "PATCH"):
        try:
            hotel = service.update_hotel(request.user, hotel_id, request.data)
            serializer = HotelSerializer(hotel)
            return Response(serializer.data)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        try:
            service.deactivate_hotel(request.user, hotel_id)
            return Response({"detail": "Hotel deactivated"}, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)


# --- Admin dashboard & employees ---

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_view(request):
    service = HotelService()
    counts = service.get_dashboard_counts(request.user)
    return Response(counts)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_employee_list_create_view(request):
    if request.method == "GET":
        employees = User.objects.filter(role=User.Role.EMPLOYEE).order_by("-created_at")
        serializer = UserSerializer(employees, many=True)
        return Response(serializer.data)

    email = request.data.get("email")
    password = request.data.get("password")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")
    hotel_id = request.data.get("hotel_id")

    if not hotel_id:
        return Response({"hotel_id": "Hotel ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    from apps.hotels.models import Hotel as HotelModel
    if not HotelModel.objects.filter(id=hotel_id).exists():
        return Response({"hotel_id": "Hotel not found"}, status=status.HTTP_400_BAD_REQUEST)

    reg_service = RegistrationService()
    try:
        user = reg_service.register(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.EMPLOYEE,
        )
        user.hotel_id = hotel_id
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_reservation_list_view(request):
    service = ReservationService()
    reservations = service.get_all_reservations()
    status_filter = request.query_params.get("status")
    if status_filter:
        reservations = reservations.filter(status=status_filter)
    serializer = ReservationListSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employee_dashboard_view(request):
    user = request.user
    if user.role != User.Role.EMPLOYEE:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    hotel_id = user.hotel_id
    if not hotel_id:
        return Response({"detail": "No hotel assigned"}, status=status.HTTP_400_BAD_REQUEST)

    from apps.hotels.models import Hotel, RoomType, Room
    from apps.reservations.models import Reservation

    try:
        hotel = Hotel.objects.get(id=hotel_id)
    except Hotel.DoesNotExist:
        return Response({"detail": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

    room_types_count = RoomType.objects.filter(hotel_id=hotel_id).count()
    rooms_count = Room.objects.filter(room_type__hotel_id=hotel_id).count()
    total_reservations = Reservation.objects.filter(hotel_id=hotel_id).count()
    pending = Reservation.objects.filter(hotel_id=hotel_id, status=Reservation.Status.PENDING_PAYMENT).count()
    confirmed = Reservation.objects.filter(hotel_id=hotel_id, status=Reservation.Status.CONFIRMED).count()

    return Response({
        "hotel_name": hotel.name,
        "total_room_types": room_types_count,
        "total_rooms": rooms_count,
        "total_reservations": total_reservations,
        "pending_reservations": pending,
        "confirmed_reservations": confirmed,
    })


# --- Public endpoints ---

@api_view(["GET"])
@permission_classes([AllowAny])
def public_hotel_list_view(request):
    service = HotelService()
    query = request.query_params.get("search", "")
    if query:
        hotels = service.search_hotels(query)
    else:
        hotels = service.get_active_hotels()
    serializer = HotelListSerializer(hotels, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def public_hotel_detail_view(request, hotel_id):
    service = HotelService()
    hotel = service.get_hotel_by_id(hotel_id)
    if hotel is None or not hotel.is_active:
        return Response({"detail": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

    hotel_serializer = HotelSerializer(hotel)

    room_service = RoomService()
    room_types = room_service.public_room_types(hotel_id)
    rt_serializer = RoomTypeListSerializer(room_types, many=True)

    extra_services = room_service.get_extra_services_by_hotel(hotel_id).filter(is_active=True)
    es_serializer = ExtraServiceSerializer(extra_services, many=True)

    return Response({
        "hotel": hotel_serializer.data,
        "room_types": rt_serializer.data,
        "extra_services": es_serializer.data,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def public_room_availability_view(request, hotel_id):
    check_in = request.query_params.get("check_in")
    check_out = request.query_params.get("check_out")
    if not check_in or not check_out:
        return Response(
            {"detail": "check_in and check_out query parameters are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        ci = date.fromisoformat(check_in)
        co = date.fromisoformat(check_out)
    except (ValueError, TypeError):
        return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    if ci >= co:
        return Response(
            {"detail": "check_in must be before check_out"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    service = HotelService()
    hotel = service.get_hotel_by_id(hotel_id)
    if hotel is None or not hotel.is_active:
        return Response({"detail": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

    room_service = RoomService()
    available = room_service.get_available_room_types(hotel_id, check_in, check_out)

    data = []
    for item in available:
        rt = item["room_type"]
        data.append({
            "id": rt.id,
            "name": rt.name,
            "description": rt.description,
            "max_guests": rt.max_guests,
            "price_per_night": str(rt.price_per_night),
            "available_rooms_count": item["available_rooms_count"],
        })

    return Response(data)


# --- RoomType / Room / ExtraService CRUD (employee) ---

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def room_type_list_create_view(request, hotel_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    service = RoomService()
    if request.method == "GET":
        room_types = service.get_room_types_by_hotel(hotel_id)
        serializer = RoomTypeSerializer(room_types, many=True)
        return Response(serializer.data)

    serializer = RoomTypeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        rt = service.create_room_type(request.user, hotel_id, serializer.validated_data)
        out = RoomTypeSerializer(rt)
        return Response(out.data, status=status.HTTP_201_CREATED)
    except PermissionError as e:
        return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
    except IntegrityError:
        return Response({"detail": "A room type with this name already exists in this hotel"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def room_type_detail_view(request, hotel_id, room_type_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    service = RoomService()
    if request.method == "GET":
        rt = service.get_room_type_by_id(room_type_id)
        if rt is None or rt.hotel_id != hotel_id:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoomTypeSerializer(rt)
        return Response(serializer.data)

    if request.method in ("PUT", "PATCH"):
        try:
            rt = service.update_room_type(request.user, hotel_id, room_type_id, request.data)
            serializer = RoomTypeSerializer(rt)
            return Response(serializer.data)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        try:
            service.delete_room_type(request.user, hotel_id, room_type_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def room_list_create_view(request, hotel_id, room_type_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    service = RoomService()
    room_type = service.get_room_type_by_id(room_type_id)
    if room_type is None or room_type.hotel_id != hotel_id:
        return Response({"detail": "Room type not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        rooms = service.get_rooms_by_room_type(room_type_id).filter(
            room_type__hotel_id=hotel_id
        )
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    serializer = RoomSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        room = service.create_room(request.user, hotel_id, room_type_id, serializer.validated_data)
        out = RoomSerializer(room)
        return Response(out.data, status=status.HTTP_201_CREATED)
    except PermissionError:
        return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    except IntegrityError:
        return Response({"detail": "A room with this number already exists"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def room_detail_view(request, hotel_id, room_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    service = RoomService()
    if request.method == "GET":
        room = service.get_room_by_id(room_id)
        if room is None or room.room_type.hotel_id != hotel_id:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoomSerializer(room)
        return Response(serializer.data)

    if request.method in ("PUT", "PATCH"):
        try:
            room = service.update_room(request.user, hotel_id, room_id, request.data)
            serializer = RoomSerializer(room)
            return Response(serializer.data)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        try:
            service.delete_room(request.user, hotel_id, room_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def extra_service_list_create_view(request, hotel_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    service = RoomService()
    if request.method == "GET":
        services = service.get_extra_services_by_hotel(hotel_id)
        serializer = ExtraServiceSerializer(services, many=True)
        return Response(serializer.data)

    serializer = ExtraServiceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        svc = service.create_extra_service(request.user, hotel_id, serializer.validated_data)
        out = ExtraServiceSerializer(svc)
        return Response(out.data, status=status.HTTP_201_CREATED)
    except PermissionError as e:
        return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def extra_service_detail_view(request, hotel_id, service_id):
    access_error = check_hotel_access(request.user, hotel_id)
    if access_error:
        return access_error

    service = RoomService()
    if request.method == "GET":
        svc = service.get_extra_services_by_hotel(hotel_id).filter(id=service_id).first()
        if svc is None:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExtraServiceSerializer(svc)
        return Response(serializer.data)

    if request.method in ("PUT", "PATCH"):
        try:
            svc = service.update_extra_service(request.user, hotel_id, service_id, request.data)
            serializer = ExtraServiceSerializer(svc)
            return Response(serializer.data)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        try:
            service.delete_extra_service(request.user, hotel_id, service_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
