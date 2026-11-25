from datetime import date
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketDetailSerializer, QRVerificationRequestSerializer

class MyTicketsListView(generics.ListAPIView):
    serializer_class = TicketDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Ticket.objects.filter(booking__user=user).select_related(
            'booking', 'booking_item__ticket_tier__event__venue',
            'booking_item__ticket_tier__event__category'
        )
        
        tab = self.request.query_params.get('tab', 'upcoming')
        today = date.today()
        
        if tab == 'upcoming':
            qs = qs.filter(
                booking_item__ticket_tier__event__event_date__gte=today,
                status=Ticket.Status.VALID
            )
        elif tab == 'past':
            qs = qs.filter(
                status=Ticket.Status.USED
            ) | qs.filter(
                booking_item__ticket_tier__event__event_date__lt=today,
                status=Ticket.Status.VALID
            )
        elif tab == 'cancelled':
            qs = qs.filter(status__in=[Ticket.Status.CANCELLED, Ticket.Status.REFUNDED])
            
        return qs.order_by('booking_item__ticket_tier__event__event_date', 'booking_item__ticket_tier__event__start_time')

class TicketDetailView(generics.RetrieveAPIView):
    queryset = Ticket.objects.select_related(
        'booking', 'booking_item__ticket_tier__event__venue'
    )
    serializer_class = TicketDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

class VerifyQRCheckInView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = QRVerificationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        token = serializer.validated_data['token'].strip()
        gate_name = serializer.validated_data.get('gate_name', 'Gate B - Main Scanner')

        ticket = Ticket.objects.select_related(
            'booking', 'booking_item__ticket_tier__event__venue'
        ).filter(qr_code_token=token).first() or Ticket.objects.filter(ticket_number__iexact=token).first()

        if not ticket:
            return Response({
                'valid': False,
                'status': 'invalid',
                'message': 'No valid ticket matching this QR code or token.'
            }, status=status.HTTP_404_NOT_FOUND)

        if ticket.status in [Ticket.Status.CANCELLED, Ticket.Status.REFUNDED]:
            return Response({
                'valid': False,
                'status': 'cancelled',
                'message': 'This admission ticket was cancelled or refunded.',
                'ticket': TicketDetailSerializer(ticket).data
            }, status=status.HTTP_400_BAD_REQUEST)

        if ticket.is_checked_in or ticket.status == Ticket.Status.USED:
            return Response({
                'valid': False,
                'status': 'already_used',
                'message': f"Ticket already redeemed at {ticket.checked_in_at.strftime('%I:%M %p') if ticket.checked_in_at else 'earlier'}.",
                'ticket': TicketDetailSerializer(ticket).data
            }, status=status.HTTP_409_CONFLICT)

        # Mark checked in
        ticket.is_checked_in = True
        ticket.checked_in_at = timezone.now()
        ticket.status = Ticket.Status.USED
        ticket.gate_name = gate_name
        ticket.save()

        return Response({
            'valid': True,
            'status': 'success',
            'message': f"Welcome, {ticket.attendee_name}! Admission approved for {ticket.booking_item.ticket_tier.event.title}.",
            'ticket': TicketDetailSerializer(ticket).data
        }, status=status.HTTP_200_OK)

class CancelTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ticket = generics.get_object_or_404(Ticket, pk=pk, booking__user=request.user)
        if ticket.is_checked_in or ticket.status == Ticket.Status.USED:
            return Response({'error': 'Cannot cancel an already checked-in ticket.'}, status=status.HTTP_400_BAD_REQUEST)
        
        ticket.status = Ticket.Status.CANCELLED
        ticket.save()
        
        # Restore available capacity
        tier = ticket.booking_item.ticket_tier
        tier.available_capacity += 1
        tier.save()

        return Response({
            'message': 'Ticket successfully cancelled and marked for refund.',
            'ticket': TicketDetailSerializer(ticket).data
        }, status=status.HTTP_200_OK)

from django.http import HttpResponse
from .pdf_generator import generate_ticket_pdf

class DownloadTicketPdfView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        if user.is_staff or getattr(user, 'is_organizer', False):
            ticket = generics.get_object_or_404(Ticket, pk=pk)
        else:
            ticket = generics.get_object_or_404(Ticket, pk=pk, booking__user=user)

        pdf_bytes = generate_ticket_pdf(ticket)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        filename = f"Eventora_Pass_{ticket.ticket_number}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
