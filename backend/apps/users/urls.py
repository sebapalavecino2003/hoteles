from django.urls import path
from apps.users.views import (
    register_view,
    login_view,
    logout_view,
    token_refresh_view,
    me_view,
)

urlpatterns = [
    path("register/", register_view, name="auth-register"),
    path("login/", login_view, name="auth-login"),
    path("logout/", logout_view, name="auth-logout"),
    path("refresh/", token_refresh_view, name="auth-refresh"),
    path("me/", me_view, name="auth-me"),
]
