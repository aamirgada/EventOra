from django.urls import path
from .views import FavoriteListView, ToggleFavoriteView

urlpatterns = [
    path('', FavoriteListView.as_view(), name='favorite_list'),
    path('toggle/<int:event_id>/', ToggleFavoriteView.as_view(), name='toggle_favorite'),
]
