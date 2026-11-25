from rest_framework import serializers
from .models import Booking, BookingItem
from events.models import TicketTier
from tickets.serializers import TicketDetailSerializer

class BookingItemSerializer(serializers.ModelSerializer):
    tier_name = serializers.CharField(source='ticket_tier.name', read_only=True)
    event_title = serializers.CharField(source='ticket_tier.event.title', read_only=True)

    class Meta:
        model = BookingItem
        fields = ['id', 'ticket_tier', 'tier_name', 'event_title', 'quantity', 'unit_price', 'subtotal']

class BookingDetailSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    tickets = TicketDetailSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'user', 'user_name', 'user_email',
            'status', 'total_amount', 'discount_amount', 'payment_method',
            'items', 'tickets', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_reference', 'user', 'created_at', 'updated_at']

class CreateBookingItemInputSerializer(serializers.Serializer):
    ticket_tier_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=20)
    attendee_name = serializers.CharField(max_length=200, required=False)
    attendee_email = serializers.EmailField(required=False)

class CreateBookingSerializer(serializers.Serializer):
    items = CreateBookingItemInputSerializer(many=True)
    payment_method = serializers.CharField(default='Credit Card')
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0.00)
