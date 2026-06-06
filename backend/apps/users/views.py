from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError

from apps.users.services import AuthService, RegistrationService
from apps.users.serializers import (
    RegisterSerializer,
    LoginSerializer,
    TokenResponseSerializer,
    UserSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    service = RegistrationService()
    try:
        user = service.register(**serializer.validated_data)
    except ValidationError as e:
        return Response({"detail": str(e.message) if hasattr(e, "message") else str(e)}, status=status.HTTP_400_BAD_REQUEST)

    auth_service = AuthService()
    tokens = auth_service.generate_tokens(user)
    response_data = {"access": tokens["access"], "refresh": tokens["refresh"], "user": user}
    serializer_out = TokenResponseSerializer(response_data)
    return Response(serializer_out.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    auth_service = AuthService()
    user = auth_service.authenticate(
        email=serializer.validated_data["email"],
        password=serializer.validated_data["password"],
    )

    if user is None:
        return Response({"detail": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = auth_service.generate_tokens(user)
    response_data = {"access": tokens["access"], "refresh": tokens["refresh"], "user": user}
    serializer_out = TokenResponseSerializer(response_data)
    return Response(serializer_out.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

    auth_service = AuthService()
    try:
        auth_service.logout_user(refresh_token)
        return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh_view(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

    auth_service = AuthService()
    try:
        tokens = auth_service.refresh_access_token(refresh_token)
        return Response(tokens, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
