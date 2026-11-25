from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentSerializer

class PaymentDetailView(generics.RetrieveAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'payment_id'

class MockPaymentProcessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        amount = request.data.get('amount')
        return Response({
            'success': True,
            'transaction_id': f"TXN-MOCK-{booking_id}",
            'status': 'captured',
            'message': 'Payment authorized and settled successfully.'
        }, status=status.HTTP_200_OK)
