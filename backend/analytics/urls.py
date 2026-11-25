from django.urls import path
from .views import OrganizerDashboardStatsView

urlpatterns = [
    path('dashboard/', OrganizerDashboardStatsView.as_view(), name='organizer_dashboard_stats'),
]
