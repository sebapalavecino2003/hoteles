from rest_framework import status
from rest_framework.response import Response

from apps.users.models import User


def has_hotel_access(user: User, hotel_id: int) -> bool:
    if user.role == User.Role.ADMIN:
        return True
    if user.role == User.Role.EMPLOYEE and user.hotel_id == hotel_id:
        return True
    return False


def check_hotel_access(user, hotel_id):
    if not has_hotel_access(user, hotel_id):
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    return None


def require_hotel_access(user: User, hotel_id: int):
    if not has_hotel_access(user, hotel_id):
        raise PermissionError("You do not have access to this hotel")
