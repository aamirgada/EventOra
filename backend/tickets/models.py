import uuid
from django.db import models
from bookings.models import Booking, BookingItem
from events.models import TicketTier

class Ticket(models.Model):
    class Status(models.TextChoices):
        VALID = 'valid', 'Valid'
        USED = 'used', 'Used'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    booking_item = models.ForeignKey(BookingItem, on_delete=models.CASCADE, related_name='issued_tickets')
    ticket_tier = models.ForeignKey(TicketTier, on_delete=models.SET_NULL, null=True, related_name='tickets')  # direct shortcut for fast lookups
    ticket_number = models.CharField(max_length=60, unique=True, db_index=True)
    attendee_name = models.CharField(max_length=200)
    attendee_email = models.EmailField(blank=True, null=True)
    qr_code_token = models.CharField(max_length=120, unique=True, db_index=True)
    
    is_checked_in = models.BooleanField(default=False, db_index=True)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    gate_name = models.CharField(max_length=100, default='Main Turnstile Gate')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VALID, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"TKT-{uuid.uuid4().hex[:10].upper()}"
        if not self.qr_code_token:
            self.qr_code_token = f"EVT-PASS-{uuid.uuid4().hex}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number} - {self.attendee_name} ({self.status})"
