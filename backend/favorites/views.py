from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Favorite
from .serializers import FavoriteSerializer
from events.models import Event

class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related(
            'event__category', 'event__venue'
        )

class ToggleFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        event = generics.get_object_or_404(Event, pk=event_id)
        favorite = Favorite.objects.filter(user=request.user, event=event).first()

        if favorite:
            favorite.delete()
            return Response({'favorited': False, 'message': 'Removed from saved events.'}, status=status.HTTP_200_OK)
        else:
            Favorite.objects.create(user=request.user, event=event)
            return Response({'favorited': True, 'message': 'Saved to favorites!'}, status=status.HTTP_201_CREATED)
