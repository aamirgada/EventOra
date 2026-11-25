from django.urls import path
from .views import MyTicketsListView, TicketDetailView, VerifyQRCheckInView, CancelTicketView, DownloadTicketPdfView

urlpatterns = [
    path('my/', MyTicketsListView.as_view(), name='my_tickets_list'),
    path('verify-qr/', VerifyQRCheckInView.as_view(), name='verify_qr_checkin'),
    path('<int:pk>/', TicketDetailView.as_view(), name='ticket_detail'),
    path('<int:pk>/pdf/', DownloadTicketPdfView.as_view(), name='ticket_pdf_download'),
    path('<int:pk>/cancel/', CancelTicketView.as_view(), name='ticket_cancel'),
]
