from django.urls import path
from .views import PaymentDetailView, MockPaymentProcessView

urlpatterns = [
    path('process/', MockPaymentProcessView.as_view(), name='payment_process'),
    path('<str:payment_id>/', PaymentDetailView.as_view(), name='payment_detail'),
]
