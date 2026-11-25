from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        'status': 'online',
        'message': 'Eventora API backend service is operational.',
        'frontend_url': 'http://localhost:5173',
        'endpoints': {
            'auth': '/api/auth/',
            'events': '/api/events/',
            'categories': '/api/events/categories/',
            'venues': '/api/events/venues/',
            'bookings': '/api/bookings/',
            'tickets': '/api/tickets/my/',
            'gate_scanner': '/api/tickets/verify-qr/',
            'analytics': '/api/analytics/dashboard/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('', api_root_view, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/events/', include('events.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/favorites/', include('favorites.urls')),
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
