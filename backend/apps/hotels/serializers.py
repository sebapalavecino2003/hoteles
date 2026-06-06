from rest_framework import serializers
from apps.hotels.models import Hotel, RoomType, Room, ExtraService


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class HotelListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ("id", "name", "city", "country", "description", "is_active")


class HotelCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ("name", "description", "address", "city", "country", "phone", "email", "cancellation_hours", "is_active")
        extra_kwargs = {
            "address": {"required": False, "allow_blank": True},
            "phone": {"required": False, "allow_blank": True},
            "email": {"required": False, "allow_blank": True},
            "cancellation_hours": {"required": False},
            "description": {"required": False, "allow_blank": True},
            "city": {"required": True},
            "country": {"required": True},
        }


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = "__all__"
        read_only_fields = ("id", "hotel", "created_at", "updated_at")


class RoomTypeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ("id", "name", "description", "max_guests", "price_per_night", "is_active")



class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"
        read_only_fields = ("id", "room_type")


class ExtraServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraService
        fields = "__all__"
        read_only_fields = ("id", "hotel", "created_at", "updated_at")
