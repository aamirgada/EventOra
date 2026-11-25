from decimal import Decimal
from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking, BookingItem
from .serializers import BookingDetailSerializer, CreateBookingSerializer
from events.models import TicketTier
from tickets.models import Ticket
from payments.models import Payment

class BookingListView(generics.ListAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).prefetch_related(
            'items__ticket_tier__event', 'tickets'
        )

class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'is_organizer', False):
            return Booking.objects.all().prefetch_related('items__ticket_tier__event', 'tickets')
        return Booking.objects.filter(user=user).prefetch_related('items__ticket_tier__event', 'tickets')

class CreateBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = serializer.validated_data['items']
        payment_method = serializer.validated_data.get('payment_method', 'Credit Card')
        discount_amount = serializer.validated_data.get('discount_amount', Decimal('0.00'))

        total_amount = Decimal('0.00')
        booking_items_to_create = []

        # Validate tiers and compute totals
        for item in items_data:
            tier_id = item['ticket_tier_id']
            qty = item['quantity']

            try:
                tier = TicketTier.objects.select_for_update().get(id=tier_id)
            except TicketTier.DoesNotExist:
                return Response({'error': f'Ticket tier with id {tier_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

            if tier.available_capacity < qty:
                return Response({
                    'error': f'Insufficient tickets for {tier.name}. Only {tier.available_capacity} remaining.'
                }, status=status.HTTP_400_BAD_REQUEST)

            subtotal = tier.price * qty
            total_amount += subtotal
            booking_items_to_create.append({
                'tier': tier,
                'quantity': qty,
                'unit_price': tier.price,
                'subtotal': subtotal,
                'attendee_name': item.get('attendee_name') or request.user.full_name,
                'attendee_email': item.get('attendee_email') or request.user.email,
            })

        final_total = max(Decimal('0.00'), total_amount - discount_amount)

        # Create Booking
        booking = Booking.objects.create(
            user=request.user,
            total_amount=final_total,
            discount_amount=discount_amount,
            payment_method=payment_method,
            status=Booking.Status.CONFIRMED
        )

        # Create BookingItems, deduct capacity, and generate individual tickets
        for item in booking_items_to_create:
            tier = item['tier']
            qty = item['quantity']
            
            # Deduct inventory
            tier.available_capacity -= qty
            tier.save()

            booking_item = BookingItem.objects.create(
                booking=booking,
                ticket_tier=tier,
                quantity=qty,
                unit_price=item['unit_price'],
                subtotal=item['subtotal']
            )

            # Issue individual ticket instances for each seat/pass
            for _ in range(qty):
                Ticket.objects.create(
                    booking=booking,
                    booking_item=booking_item,
                    attendee_name=item['attendee_name'],
                    attendee_email=item['attendee_email'],
                    gate_name=tier.access_point or 'Main Turnstile Gate',
                    status=Ticket.Status.VALID
                )

        # Auto create successful mock payment record
        Payment.objects.create(
            booking=booking,
            payment_id=f"PAY-{booking.booking_reference}",
            provider='mock',
            amount=final_total,
            currency='USD',
            status=Payment.Status.COMPLETED,
            payload={'method': payment_method, 'auto_cleared': True}
        )

        response_data = BookingDetailSerializer(booking).data
        return Response(response_data, status=status.HTTP_201_CREATED)
