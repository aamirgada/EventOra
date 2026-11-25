from rest_framework import serializers
from .models import Ticket

class TicketDetailSerializer(serializers.ModelSerializer):
    booking_reference = serializers.CharField(source='booking.booking_reference', read_only=True)
    event_id = serializers.IntegerField(source='booking_item.ticket_tier.event.id', read_only=True)
    event_title = serializers.CharField(source='booking_item.ticket_tier.event.title', read_only=True)
    event_slug = serializers.CharField(source='booking_item.ticket_tier.event.slug', read_only=True)
    banner_image = serializers.CharField(source='booking_item.ticket_tier.event.banner_image', read_only=True)
    event_date = serializers.DateField(source='booking_item.ticket_tier.event.event_date', read_only=True)
    start_time = serializers.TimeField(source='booking_item.ticket_tier.event.start_time', read_only=True)
    doors_open = serializers.CharField(source='booking_item.ticket_tier.event.doors_open', read_only=True)
    
    venue_name = serializers.SerializerMethodField()
    venue_city = serializers.SerializerMethodField()
    venue_address = serializers.SerializerMethodField()
    transit_info = serializers.SerializerMethodField()
    
    tier_name = serializers.CharField(source='booking_item.ticket_tier.name', read_only=True)
    tier_price = serializers.DecimalField(source='booking_item.ticket_tier.price', max_digits=10, decimal_places=2, read_only=True)
    access_point = serializers.CharField(source='booking_item.ticket_tier.access_point', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'booking_reference', 'event_id', 'event_title', 'event_slug',
            'banner_image', 'event_date', 'start_time', 'doors_open',
            'venue_name', 'venue_city', 'venue_address', 'transit_info',
            'tier_name', 'tier_price', 'access_point',
            'attendee_name', 'attendee_email', 'qr_code_token',
            'is_checked_in', 'checked_in_at', 'gate_name', 'status', 'created_at'
        ]

    def get_venue_name(self, obj):
        venue = obj.booking_item.ticket_tier.event.venue
        return venue.name if venue else 'Online Stream'

    def get_venue_city(self, obj):
        venue = obj.booking_item.ticket_tier.event.venue
        return venue.city if venue else 'Virtual'

    def get_venue_address(self, obj):
        venue = obj.booking_item.ticket_tier.event.venue
        return venue.address if venue else 'Streaming Link sent via email'

    def get_transit_info(self, obj):
        venue = obj.booking_item.ticket_tier.event.venue
        return venue.transit_info if venue else ''

class QRVerificationRequestSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=255)
    gate_name = serializers.CharField(max_length=100, default='Main Gate Scanner')
