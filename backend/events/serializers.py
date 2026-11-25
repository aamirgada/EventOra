from rest_framework import serializers
from .models import Category, Venue, Event, TicketTier, Performer, EventReview

class CategorySerializer(serializers.ModelSerializer):
    events_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'image_url', 'description', 'badge_color', 'events_count']

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'

class TicketTierSerializer(serializers.ModelSerializer):
    is_sold_out = serializers.SerializerMethodField()

    class Meta:
        model = TicketTier
        fields = [
            'id', 'event', 'name', 'price', 'total_capacity', 
            'available_capacity', 'description', 'perks', 
            'access_point', 'max_per_order', 'is_active', 'is_sold_out'
        ]

    def get_is_sold_out(self, obj):
        return obj.available_capacity <= 0

class PerformerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Performer
        fields = ['id', 'name', 'role', 'avatar', 'time_slot']

class EventReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = EventReview
        fields = ['id', 'user', 'user_name', 'user_avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def get_user_avatar(self, obj):
        try:
            if obj.user and obj.user.avatar and hasattr(obj.user.avatar, 'url'):
                return obj.user.avatar.url
        except Exception:
            pass
        return None

class EventListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    lowest_price = serializers.DecimalField(max_digits=10, decimal_places=2, source='min_price', read_only=True)
    organizer_display = serializers.SerializerMethodField()
    is_favorited = serializers.BooleanField(read_only=True, default=False)
    total_tickets_sold = serializers.IntegerField(read_only=True, default=0)
    total_capacity = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'organizer', 'organizer_display',
            'category', 'venue', 'short_description', 'banner_image',
            'event_date', 'start_time', 'end_time', 'format', 'status',
            'is_featured', 'age_policy', 'lowest_price', 'is_favorited',
            'total_tickets_sold', 'total_capacity'
        ]

    def get_organizer_display(self, obj):
        return obj.organizer_name or (obj.organizer.full_name if obj.organizer else 'Eventora Verified')

class EventDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    venue = VenueSerializer(read_only=True)
    venue_id = serializers.PrimaryKeyRelatedField(
        queryset=Venue.objects.all(), source='venue', write_only=True, required=False, allow_null=True
    )
    ticket_tiers = TicketTierSerializer(many=True, read_only=True)
    performers = PerformerSerializer(many=True, read_only=True)
    reviews = EventReviewSerializer(many=True, read_only=True)
    organizer_display = serializers.SerializerMethodField()
    organizer_email = serializers.EmailField(source='organizer.email', read_only=True)
    is_favorited = serializers.BooleanField(read_only=True, default=False)
    average_rating = serializers.FloatField(read_only=True, default=4.9)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'organizer', 'organizer_email', 'organizer_display',
            'category', 'category_id', 'venue', 'venue_id', 'description', 'short_description',
            'banner_image', 'event_date', 'start_time', 'end_time', 'doors_open',
            'format', 'status', 'is_featured', 'age_policy', 'min_price',
            'ticket_tiers', 'performers', 'reviews', 'is_favorited', 'average_rating',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'organizer', 'created_at', 'updated_at']

    def get_organizer_display(self, obj):
        return obj.organizer_name or (obj.organizer.full_name if obj.organizer else 'SoundWave Productions')
