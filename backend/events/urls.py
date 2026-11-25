from django.urls import path
from .views import (
    CategoryListView, VenueListView, EventListView, 
    EventDetailView, EventCreateView, OrganizerEventsListView,
    EventReviewCreateView
)

urlpatterns = [
    path('', EventListView.as_view(), name='event_list'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('venues/', VenueListView.as_view(), name='venue_list'),
    path('create/', EventCreateView.as_view(), name='event_create'),
    path('managed/', OrganizerEventsListView.as_view(), name='organizer_events'),
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail_by_id'),
    path('<slug:pk>/', EventDetailView.as_view(), name='event_detail_by_slug'),
    path('<int:event_id>/reviews/', EventReviewCreateView.as_view(), name='event_review_create'),
]
