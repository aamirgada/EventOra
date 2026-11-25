import os
import sys
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from events.models import Event, Category, Venue, TicketTier, Performer
from accounts.models import User

organizer = User.objects.filter(role='organizer').first()
venue = Venue.objects.get(name='Nesco Exhibition Centre')
cat = Category.objects.get(slug='arts')

desc = """India's Got Latent is back — LIVE and louder than ever!

Join Samay Raina and a star-studded panel of comedians, creators, and surprise celebrity guests for a night of raw, unfiltered humour and jaw-dropping talent acts right in the heart of Mumbai.

This is the show that broke the internet — now breaking the stage. Expect roast sets, wild contestant auditions, brutal panel reactions, and of course, Samay's legendary deadpan commentary on everything that goes wrong (and right).

Featuring special appearances from India's top stand-up comedians and YouTube personalities. No scripts. No filters. Just pure, unhinged entertainment.

Gates open 1 hour before showtime. Latecomers will be judged — by Samay personally."""

event, created = Event.objects.get_or_create(
    title="India's Got Latent — Live with Samay Raina",
    defaults={
        'organizer': organizer,
        'organizer_name': 'Samay Raina Entertainment',
        'category': cat,
        'venue': venue,
        'description': desc,
        'short_description': "The internet-breaking show goes LIVE! Join Samay Raina and India's funniest panel for a night of raw comedy, wild talent acts, and unscripted chaos in Mumbai.",
        'banner_image': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
        'event_date': datetime.date(2026, 12, 20),
        'start_time': datetime.time(19, 30),
        'end_time': datetime.time(23, 0),
        'doors_open': 'Gates Open at 6:30 PM',
        'format': 'in_person',
        'status': 'published',
        'is_featured': True,
        'age_policy': '18+ Only',
        'min_price': 999.00,
    }
)
print(f'Event created={created}: {event.title} (id={event.id})')

tiers_data = [
    {
        'name': 'General Admission',
        'price': 999,
        'total_capacity': 2500,
        'available_capacity': 2500,
        'description': 'Standing zone — be part of the crowd energy!',
        'perks': ['Entry Pass', 'Event Merchandise Discount'],
        'access_point': 'Gate A - General',
        'max_per_order': 8,
    },
    {
        'name': 'Premium Seated',
        'price': 2499,
        'total_capacity': 1500,
        'available_capacity': 1500,
        'description': 'Reserved seating with great sightlines to the stage.',
        'perks': ['Reserved Seat', 'Welcome Drink', 'Event Program'],
        'access_point': 'Gate B - Premium',
        'max_per_order': 6,
    },
    {
        'name': 'VIP Platinum',
        'price': 5999,
        'total_capacity': 200,
        'available_capacity': 200,
        'description': 'Front-row priority access + exclusive meet and greet with Samay Raina and the full panel.',
        'perks': ['Front Row Seat', 'Meet and Greet Pass', 'Signed Merchandise', 'Backstage Access', 'Premium Welcome Kit'],
        'access_point': 'Gate C - VIP',
        'max_per_order': 2,
    },
]

for t in tiers_data:
    tier, tc = TicketTier.objects.get_or_create(event=event, name=t['name'], defaults=t)
    print(f'  Tier [{tc}]: {tier.name} @ Rs.{tier.price}')

performers_data = [
    {
        'name': 'Samay Raina',
        'role': 'Host & Creator',
        'time_slot': '7:30 PM - 11:00 PM',
        'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
        'name': 'Tanmay Bhat',
        'role': 'Special Guest Panelist',
        'time_slot': '8:30 PM',
        'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    {
        'name': 'Rahul Subramanian',
        'role': 'Stand-up Comedy Set',
        'time_slot': '9:15 PM',
        'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
]
for p in performers_data:
    perf, pc = Performer.objects.get_or_create(event=event, name=p['name'], defaults=p)
    print(f'  Performer [{pc}]: {perf.name} — {perf.role}')

print('\nSeed complete!')

