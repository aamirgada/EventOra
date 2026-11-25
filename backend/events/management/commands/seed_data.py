from datetime import date, timedelta, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Category, Venue, Event, TicketTier, Performer, EventReview
from bookings.models import Booking, BookingItem
from tickets.models import Ticket
from payments.models import Payment
from favorites.models import Favorite

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic events, venues, categories, users, tickets, and bookings matching the UI designs'

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Users
        admin, _ = User.objects.get_or_create(
            email='admin@eventora.com',
            defaults={
                'full_name': 'Eventora Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin.set_password('Admin@123')
        admin.save()

        organizer, _ = User.objects.get_or_create(
            email='organizer@eventora.com',
            defaults={
                'full_name': 'SoundWave Productions',
                'role': User.Role.ORGANIZER,
                'is_staff': True,
            }
        )
        organizer.set_password('Organizer@123')
        organizer.save()

        attendee, _ = User.objects.get_or_create(
            email='attendee@eventora.com',
            defaults={
                'full_name': 'Sarah Lin',
                'role': User.Role.ATTENDEE,
            }
        )
        attendee.set_password('Attendee@123')
        attendee.save()

        # 2. Categories
        cats_data = [
            {'name': 'Music & Concerts', 'slug': 'music', 'icon': 'music_note', 'badge_color': '#605a7f', 'description': 'Live concerts, orchestral symphonies, and electronic festivals.'},
            {'name': 'Technology & AI', 'slug': 'tech', 'icon': 'terminal', 'badge_color': '#30217d', 'description': 'Deep tech summits, developer conferences, and AI symposia.'},
            {'name': 'Culinary & Wine', 'slug': 'food', 'icon': 'wine_bar', 'badge_color': '#8b1e42', 'description': 'Michelin chef showcases, wine tastings, and culinary festivals.'},
            {'name': 'Arts & Culture', 'slug': 'arts', 'icon': 'palette', 'badge_color': '#5a3d82', 'description': 'Modern art exhibits, theater performances, and live poetry.'},
            {'name': 'Workshops & Labs', 'slug': 'workshop', 'icon': 'school', 'badge_color': '#2a5a40', 'description': 'Hands-on masterclasses, creator sprints, and craft workshops.'},
            {'name': 'Wellness & Sports', 'slug': 'wellness', 'icon': 'fitness_center', 'badge_color': '#1a6470', 'description': 'Marathons, sound healing sessions, and outdoor adventure.'},
        ]
        categories = {}
        for c in cats_data:
            cat_obj, _ = Category.objects.update_or_create(
                slug=c['slug'],
                defaults={'name': c['name'], 'icon': c['icon'], 'badge_color': c['badge_color'], 'description': c['description']}
            )
            categories[c['slug']] = cat_obj

        # 3. Venues
        v_sf, _ = Venue.objects.update_or_create(
            name='Golden Gate Park Polo Field',
            defaults={
                'address': '1232 John F Kennedy Dr',
                'city': 'San Francisco',
                'state': 'CA',
                'country': 'USA',
                'postal_code': '94121',
                'transit_info': 'Muni N-Judah line or direct express shuttle from Civic Center Station.',
                'capacity': 1800,
                'latitude': Decimal('37.769400'),
                'longitude': Decimal('-122.486200')
            }
        )

        v_ny, _ = Venue.objects.update_or_create(
            name='Pier 36 Skyline Atrium',
            defaults={
                'address': '299 South Street',
                'city': 'New York',
                'state': 'NY',
                'country': 'USA',
                'postal_code': '10002',
                'transit_info': 'F train to East Broadway Station, 8 min walk east.',
                'capacity': 1500,
                'latitude': Decimal('40.710300'),
                'longitude': Decimal('-73.984500')
            }
        )

        v_napa, _ = Venue.objects.update_or_create(
            name='Meadowood Reserve Vineyard Pavilion',
            defaults={
                'address': '900 Meadowood Lane',
                'city': 'St. Helena',
                'state': 'CA',
                'country': 'USA',
                'postal_code': '94574',
                'transit_info': 'Complimentary valley valet and private shuttle from downtown Napa hotels.',
                'capacity': 650,
                'latitude': Decimal('38.514700'),
                'longitude': Decimal('-122.463200')
            }
        )

        v_sj, _ = Venue.objects.update_or_create(
            name='Silicon Valley Tech Convention Hall',
            defaults={
                'address': '150 W San Carlos St',
                'city': 'San Jose',
                'state': 'CA',
                'country': 'USA',
                'postal_code': '95113',
                'transit_info': 'VTA Light Rail to Convention Center Station or Caltrain to Diridon.',
                'capacity': 2500,
                'latitude': Decimal('37.330800'),
                'longitude': Decimal('-121.889300')
            }
        )

        # 4. Events
        today = date.today()
        
        # Event 1: Neon Horizon Electronic Music Festival
        e1, _ = Event.objects.update_or_create(
            slug='neon-horizon-electronic-music-festival-2025',
            defaults={
                'title': 'Neon Horizon Electronic Music Festival 2025',
                'organizer': organizer,
                'organizer_name': 'SoundWave Productions',
                'category': categories['music'],
                'venue': v_sf,
                'description': (
                    'Prepare for Northern California\'s most spellbinding twilight gathering. '
                    'Neon Horizon returns to the iconic Golden Gate Park Meadow, transmuting historic natural '
                    'grounds into a luminous multi-dimensional playground of sound, light, and shared euphoria. '
                    'Featuring an unparalleled audio-visual installation programmed across three handcrafted stages, '
                    'the festival unites international electronic pioneers, underground synthwave virtuosos, and '
                    'boundary-pushing visual artists for an unbroken 8-hour journey.'
                ),
                'short_description': 'A spellbinding 8-hour twilight electronic music gathering in Golden Gate Park with world-class synthwave acts.',
                'banner_image': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80',
                'event_date': today + timedelta(days=12),
                'start_time': time(16, 0),
                'end_time': time(23, 30),
                'doors_open': 'Gates Open 3:30 PM',
                'format': Event.Format.IN_PERSON,
                'status': Event.Status.PUBLISHED,
                'is_featured': True,
                'age_policy': 'Age 18+ Valid ID Req.',
                'min_price': Decimal('75.00')
            }
        )

        # Event 2: Silicon Valley Generative AI & Robotics Summit
        e2, _ = Event.objects.update_or_create(
            slug='silicon-valley-ai-robotics-summit-2025',
            defaults={
                'title': 'Silicon Valley AI & Robotics Summit 2025',
                'organizer': organizer,
                'organizer_name': 'FutureTech Consortium',
                'category': categories['tech'],
                'venue': v_sj,
                'description': (
                    'Join 2,000+ AI researchers, founders, and venture partners for keynote presentations, '
                    'interactive humanoid robot demonstrations, and technical breakouts on frontiers in autonomous '
                    'reasoning and agentic workflows.'
                ),
                'short_description': 'The premier annual gathering of generative AI researchers, venture founders, and robotics architects.',
                'banner_image': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=80',
                'event_date': today + timedelta(days=20),
                'start_time': time(9, 0),
                'end_time': time(18, 0),
                'doors_open': 'Check-in opens 8:00 AM',
                'format': Event.Format.HYBRID,
                'status': Event.Status.PUBLISHED,
                'is_featured': True,
                'age_policy': 'All Ages (Student Passes Available)',
                'min_price': Decimal('120.00')
            }
        )

        # Event 3: Napa Valley Artisan Wine & Jazz Gala
        e3, _ = Event.objects.update_or_create(
            slug='napa-valley-artisan-wine-jazz-gala',
            defaults={
                'title': 'Napa Valley Artisan Wine & Jazz Gala',
                'organizer': organizer,
                'organizer_name': 'Reserve Napa Curations',
                'category': categories['food'],
                'venue': v_napa,
                'description': (
                    'An intimate twilight celebration amidst the vines featuring cellar reserve pairings '
                    'from 14 private family estates, a 5-course farm-to-table banquet, and live jazz quartets under starlight.'
                ),
                'short_description': 'Cellar reserve pairings from 14 private estates, 5-course farm banquet, and live jazz quartets.',
                'banner_image': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1400&q=80',
                'event_date': today + timedelta(days=5),
                'start_time': time(17, 30),
                'end_time': time(22, 0),
                'doors_open': 'Reception at 5:00 PM',
                'format': Event.Format.IN_PERSON,
                'status': Event.Status.PUBLISHED,
                'is_featured': True,
                'age_policy': 'Age 21+ Government ID required',
                'min_price': Decimal('165.00')
            }
        )

        # Event 4: Prismatic Sonics & Immersive Arts Expo
        e4, _ = Event.objects.update_or_create(
            slug='prismatic-sonics-immersive-arts-expo',
            defaults={
                'title': 'Prismatic Sonics & Immersive Arts Expo',
                'organizer': organizer,
                'organizer_name': 'Chromaflow Collective',
                'category': categories['arts'],
                'venue': v_ny,
                'description': (
                    'A multi-floor sensory journey featuring generative holographic tunnels, spatial audio domes, '
                    'and boundary-pushing kinetic light installations created by top digital artists from Berlin and Tokyo.'
                ),
                'short_description': 'Spatial audio domes, kinetic projection tunnels, and 360-degree digital visual installations in Manhattan.',
                'banner_image': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1400&q=80',
                'event_date': today + timedelta(days=18),
                'start_time': time(12, 0),
                'end_time': time(22, 0),
                'doors_open': 'Timed entry every hour',
                'format': Event.Format.IN_PERSON,
                'status': Event.Status.PUBLISHED,
                'is_featured': False,
                'age_policy': 'All Ages Welcome',
                'min_price': Decimal('45.00')
            }
        )

        # Event 5: Velvet Underground Acoustic Sessions (Past event for ticket history)
        e5, _ = Event.objects.update_or_create(
            slug='velvet-underground-acoustic-sessions',
            defaults={
                'title': 'Velvet Underground Acoustic Sessions',
                'organizer': organizer,
                'organizer_name': 'SoundWave Productions',
                'category': categories['music'],
                'venue': v_sf,
                'description': 'Intimate candlelit unplugged performances by indie singer-songwriters in an acoustic pavilion.',
                'short_description': 'Candlelit acoustic performances and string quartet accompaniments.',
                'banner_image': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1400&q=80',
                'event_date': today - timedelta(days=25),
                'start_time': time(20, 0),
                'end_time': time(23, 0),
                'doors_open': '7:30 PM',
                'format': Event.Format.IN_PERSON,
                'status': Event.Status.PAST,
                'is_featured': False,
                'age_policy': 'All Ages',
                'min_price': Decimal('55.00')
            }
        )

        # 5. Ticket Tiers for Event 1 (Neon Horizon)
        tier_e1_vip, _ = TicketTier.objects.update_or_create(
            event=e1,
            name='VIP Express Pass — Tier 1',
            defaults={
                'price': Decimal('185.00'),
                'total_capacity': 300,
                'available_capacity': 238,
                'description': 'Priority turnstile express lane, elevated viewing lounge with private bar, and festival merch kit.',
                'perks': ['Gate B Express Turnstile', 'Elevated VIP Viewing Deck', '2 Complimentary Craft Cocktails', 'Limited Edition Merch Lanyard'],
                'access_point': 'Gate B - VIP Fast-lane',
                'max_per_order': 6
            }
        )

        tier_e1_ga, _ = TicketTier.objects.update_or_create(
            event=e1,
            name='General Admission',
            defaults={
                'price': Decimal('85.00'),
                'total_capacity': 1200,
                'available_capacity': 890,
                'description': 'Full all-day access to all 3 main stages, meadow art park, and gourmet food truck village.',
                'perks': ['Access to Main Stage & Prism Dome', 'Access to Food Truck Pavilion', 'Free Hydration Stations'],
                'access_point': 'Gate A - Main Entry',
                'max_per_order': 10
            }
        )

        tier_e1_early, _ = TicketTier.objects.update_or_create(
            event=e1,
            name='Early Bird Pass',
            defaults={
                'price': Decimal('65.00'),
                'total_capacity': 300,
                'available_capacity': 0,
                'description': 'Discounted admission for our early community supporters. Sold out!',
                'perks': ['Full General Admission Access'],
                'access_point': 'Gate A - Main Entry',
                'max_per_order': 4
            }
        )

        # Ticket tiers for Event 2 (Tech Summit)
        tier_e2_all, _ = TicketTier.objects.update_or_create(
            event=e2,
            name='All-Access Executive Pass',
            defaults={
                'price': Decimal('350.00'),
                'total_capacity': 400,
                'available_capacity': 310,
                'description': 'Access to keynotes, private founder roundtables, VIP networking dinner, and slide decks.',
                'perks': ['Keynote & Breakout Sessions', 'Private Founder Lounge', 'Gourmet Catered Lunch & Dinner', 'Full Session Recordings'],
                'access_point': 'Hall A - Executive Reception',
                'max_per_order': 8
            }
        )

        tier_e2_dev, _ = TicketTier.objects.update_or_create(
            event=e2,
            name='Builder & Developer Pass',
            defaults={
                'price': Decimal('120.00'),
                'total_capacity': 1500,
                'available_capacity': 1140,
                'description': 'Access to all technical tracks, live robotics demo floor, and hackathon showcases.',
                'perks': ['Access to Technical Tracks', 'Demo Pavilion Access', 'Complimentary Breakfast & Coffee Bar'],
                'access_point': 'Hall B - Builder Gate',
                'max_per_order': 10
            }
        )

        # Ticket tiers for Event 3 (Wine Gala)
        tier_e3, _ = TicketTier.objects.update_or_create(
            event=e3,
            name='Gourmet Pairing & Banquet Pass',
            defaults={
                'price': Decimal('165.00'),
                'total_capacity': 250,
                'available_capacity': 180,
                'description': 'Full evening tasting ticket with 5-course seated dinner and souvenir crystal tasting glass.',
                'perks': ['5-Course Wine Pairing Dinner', 'Private Cellar Access', 'Engraved Souvenir Crystal Glass'],
                'access_point': 'Vineyard Main Terrace Gate',
                'max_per_order': 4
            }
        )

        # Performers for Neon Horizon
        Performer.objects.get_or_create(
            event=e1, name='Kavinsky Synth Orchestra',
            defaults={'role': 'Headline Live Act', 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'time_slot': '9:30 PM - 11:30 PM'}
        )
        Performer.objects.get_or_create(
            event=e1, name='Astral Echoes',
            defaults={'role': 'Sunset Ambient Opening', 'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'time_slot': '5:00 PM - 7:00 PM'}
        )
        Performer.objects.get_or_create(
            event=e1, name='Lumina Void',
            defaults={'role': 'Visual & Laser Architect', 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'time_slot': 'All Night'}
        )

        # Reviews for Neon Horizon
        EventReview.objects.get_or_create(
            event=e1, user=attendee,
            defaults={'rating': 5, 'comment': 'Best festival production in California! The stage design and laser sound syncing was sublime.'}
        )

        # 6. Sample Bookings & Tickets for Attendee (Sarah Lin)
        # Booking 1: Upcoming Neon Horizon VIP Pass
        b1, _ = Booking.objects.get_or_create(
            booking_reference='EVT-2025-883491',
            defaults={
                'user': attendee,
                'status': Booking.Status.CONFIRMED,
                'total_amount': Decimal('185.00'),
                'discount_amount': Decimal('0.00'),
                'payment_method': 'Apple Pay',
            }
        )
        b1_item, _ = BookingItem.objects.get_or_create(
            booking=b1,
            ticket_tier=tier_e1_vip,
            defaults={'quantity': 1, 'unit_price': Decimal('185.00'), 'subtotal': Decimal('185.00')}
        )
        t1, _ = Ticket.objects.get_or_create(
            booking=b1,
            ticket_number='TKT-NEON-883491-01',
            defaults={
                'booking_item': b1_item,
                'attendee_name': 'Sarah Lin',
                'attendee_email': 'sarah@eventora.com',
                'qr_code_token': 'EVT-PASS-NEON-HORIZON-2025-VIP-883491',
                'gate_name': 'Gate B - VIP Fast-lane',
                'is_checked_in': False,
                'status': Ticket.Status.VALID
            }
        )

        # Booking 2: Upcoming Silicon Valley AI Summit
        b2, _ = Booking.objects.get_or_create(
            booking_reference='EVT-2025-992144',
            defaults={
                'user': attendee,
                'status': Booking.Status.CONFIRMED,
                'total_amount': Decimal('120.00'),
                'discount_amount': Decimal('0.00'),
                'payment_method': 'Visa •••• 4242',
            }
        )
        b2_item, _ = BookingItem.objects.get_or_create(
            booking=b2,
            ticket_tier=tier_e2_dev,
            defaults={'quantity': 1, 'unit_price': Decimal('120.00'), 'subtotal': Decimal('120.00')}
        )
        t2, _ = Ticket.objects.get_or_create(
            booking=b2,
            ticket_number='TKT-AISUMMIT-992144-01',
            defaults={
                'booking_item': b2_item,
                'attendee_name': 'Sarah Lin',
                'attendee_email': 'sarah@eventora.com',
                'qr_code_token': 'EVT-PASS-AI-SUMMIT-2025-DEV-992144',
                'gate_name': 'Hall B - Builder Gate',
                'is_checked_in': False,
                'status': Ticket.Status.VALID
            }
        )

        # Booking 3: Past Velvet Underground Event
        b3, _ = Booking.objects.get_or_create(
            booking_reference='EVT-2025-442109',
            defaults={
                'user': attendee,
                'status': Booking.Status.CONFIRMED,
                'total_amount': Decimal('55.00'),
                'payment_method': 'MasterCard •••• 8812',
            }
        )
        tier_e5, _ = TicketTier.objects.get_or_create(
            event=e5, name='Standard Entry',
            defaults={'price': Decimal('55.00'), 'total_capacity': 200, 'available_capacity': 0}
        )
        b3_item, _ = BookingItem.objects.get_or_create(
            booking=b3, ticket_tier=tier_e5,
            defaults={'quantity': 1, 'unit_price': Decimal('55.00'), 'subtotal': Decimal('55.00')}
        )
        t3, _ = Ticket.objects.get_or_create(
            booking=b3, ticket_number='TKT-VELVET-442109-01',
            defaults={
                'booking_item': b3_item,
                'attendee_name': 'Sarah Lin',
                'attendee_email': 'sarah@eventora.com',
                'qr_code_token': 'EVT-PASS-VELVET-442109',
                'gate_name': 'Main Door',
                'is_checked_in': True,
                'status': Ticket.Status.USED
            }
        )

        # Favorite
        Favorite.objects.get_or_create(user=attendee, event=e1)
        Favorite.objects.get_or_create(user=attendee, event=e3)

        self.stdout.write(self.style.SUCCESS("Database seeded successfully with authentic test users, events, and tickets!"))
