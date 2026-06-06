from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from apps.users.models import User


class AuthService:
    def authenticate(self, email: str, password: str) -> User | None:
        return authenticate(email=email, password=password)

    def generate_tokens(self, user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    def refresh_access_token(self, refresh_token: str) -> dict:
        try:
            refresh = RefreshToken(refresh_token)
            return {
                "access": str(refresh.access_token),
            }
        except TokenError:
            raise ValueError("Invalid or expired refresh token")

    def logout_user(self, refresh_token: str) -> None:
        try:
            refresh = RefreshToken(refresh_token)
            refresh.blacklist()
        except TokenError:
            raise ValueError("Invalid or expired refresh token")

    def get_user_from_token(self, token: str) -> User | None:
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            access = AccessToken(token)
            user_id = access.payload.get("user_id")
            return User.objects.filter(id=user_id).first()
        except Exception:
            return None


class RegistrationService:
    def register(
        self,
        email: str,
        password: str,
        first_name: str = "",
        last_name: str = "",
        phone: str = "",
        role: str = User.Role.CLIENT,
    ) -> User:
        email = email.strip().lower()

        if not email:
            raise ValidationError("Email is required")

        try:
            django_validate_email(email)
        except ValidationError:
            raise ValidationError("Invalid email format")

        if not password or len(password) < 8:
            raise ValidationError("Password must be at least 8 characters")

        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with this email already exists")

        return User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            phone=phone.strip(),
            role=role,
        )
