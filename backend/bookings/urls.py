from django.urls import path
from .views import BookingListView, BookingDetailView, CreateBookingView

urlpatterns = [
    path('', BookingListView.as_view(), name='booking_list'),
    path('create/', CreateBookingView.as_view(), name='booking_create'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
]
