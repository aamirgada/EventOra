from rest_framework import serializers
from .models import Favorite
from events.serializers import EventListSerializer

class FavoriteSerializer(serializers.ModelSerializer):
    event = EventListSerializer(read_only=True)
    event_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'event', 'event_id', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
