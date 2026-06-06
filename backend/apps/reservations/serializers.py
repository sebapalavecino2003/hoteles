from rest_framework import serializers

from apps.reservations.models import Reservation, Payment


class ReservationSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source="hotel.name", read_only=True)
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)
    room_number = serializers.CharField(source="room.room_number", read_only=True, allow_null=True)
    user_email = serializers.EmailField(source="user.email", read_only=True, allow_null=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "hotel", "hotel_name", "room_type", "room_type_name",
            "room", "room_number", "user", "user_email",
            "guest_email", "guest_phone", "guest_dni",
            "guest_first_name", "guest_last_name",
            "check_in", "check_out", "status",
            "total_room_price", "extra_services_price", "total_price",
            "notes", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "hotel", "room", "user", "status",
            "total_room_price", "extra_services_price", "total_price",
            "created_at", "updated_at",
        ]


class ReservationCreateSerializer(serializers.Serializer):
    guest_email = serializers.EmailField()
    guest_phone = serializers.CharField(max_length=20)
    guest_dni = serializers.CharField(max_length=20)
    guest_first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    guest_last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    hotel_id = serializers.IntegerField()
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    room_type_id = serializers.IntegerField()
    extra_service_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class ReservationListSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source="hotel.name", read_only=True)
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "hotel_name", "room_type_name",
            "guest_email", "guest_phone", "guest_dni",
            "guest_first_name", "guest_last_name",
            "check_in", "check_out", "status",
            "total_room_price", "extra_services_price", "total_price",
            "created_at", "updated_at",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
