from django.contrib import admin
from .models import Hotel, RoomType, Room, ExtraService


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "country", "is_active", "created_at")
    list_filter = ("is_active", "city", "country")
    search_fields = ("name", "city", "country")


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "hotel", "price_per_night", "max_guests", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "hotel__name")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("room_number", "room_type", "floor", "is_active")
    list_filter = ("is_active", "floor")
    search_fields = ("room_number", "room_type__name")


@admin.register(ExtraService)
class ExtraServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "hotel", "price", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "hotel__name")
