from datetime import date, timedelta
from django.db.models import Q, Min, Count, Sum
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, Venue, Event, TicketTier, Performer, EventReview
from .serializers import (
    CategorySerializer, VenueSerializer, EventListSerializer, 
    EventDetailSerializer, TicketTierSerializer, EventReviewSerializer
)

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.annotate(events_count=Count('events')).order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class VenueListView(generics.ListAPIView):
    queryset = Venue.objects.all().order_by('city', 'name')
    serializer_class = VenueSerializer
    permission_classes = [permissions.AllowAny]

class EventListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Event.objects.select_related('category', 'venue', 'organizer').prefetch_related('ticket_tiers').filter(
            status=Event.Status.PUBLISHED
        )

        # Keyword search
        search_query = self.request.query_params.get('q', '').strip()
        if search_query:
            qs = qs.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__name__icontains=search_query) |
                Q(venue__name__icontains=search_query) |
                Q(venue__city__icontains=search_query)
            )

        # Category filter
        category = self.request.query_params.get('category')
        if category and category != 'all':
            if category.isdigit():
                qs = qs.filter(category_id=category)
            else:
                qs = qs.filter(Q(category__slug=category) | Q(category__name__iexact=category))

        # Location / City filter
        location = self.request.query_params.get('location')
        if location and location != 'all':
            qs = qs.filter(
                Q(venue__city__icontains=location) | 
                Q(venue__state__icontains=location) |
                Q(venue__name__icontains=location)
            )

        # Format filter
        event_format = self.request.query_params.get('format')
        if event_format and event_format != 'all':
            qs = qs.filter(format=event_format)

        # Date timeframe filter
        date_filter = self.request.query_params.get('timeframe') or self.request.query_params.get('date')
        today = date.today()
        if date_filter == 'today':
            qs = qs.filter(event_date=today)
        elif date_filter in ['this-weekend', 'weekend']:
            # Days until Friday/Saturday/Sunday
            friday = today + timedelta((4 - today.weekday()) % 7)
            sunday = friday + timedelta(days=2)
            qs = qs.filter(event_date__range=[today, sunday])
        elif date_filter in ['next-week', '7days']:
            qs = qs.filter(event_date__range=[today, today + timedelta(days=7)])
        elif date_filter in ['this-month', 'month']:
            qs = qs.filter(event_date__range=[today, today + timedelta(days=30)])

        # Price range filter
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        if price_min is not None and price_min != '':
            qs = qs.filter(min_price__gte=price_min)
        if price_max is not None and price_max != '':
            qs = qs.filter(min_price__lte=price_max)

        # Featured only filter
        is_featured = self.request.query_params.get('featured')
        if is_featured in ['true', '1']:
            qs = qs.filter(is_featured=True)

        # Sorting
        sort_by = self.request.query_params.get('sort', 'date_asc')
        if sort_by == 'price_asc':
            qs = qs.order_by('min_price', 'event_date')
        elif sort_by == 'price_desc':
            qs = qs.order_by('-min_price', 'event_date')
        elif sort_by == 'popular':
            qs = qs.order_by('-is_featured', 'event_date')
        else: # date_asc
            qs = qs.order_by('event_date', 'start_time')

        return qs

class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.select_related('category', 'venue', 'organizer').prefetch_related(
        'ticket_tiers', 'performers', 'reviews__user'
    )
    serializer_class = EventDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'

    def get_object(self):
        lookup = self.kwargs.get(self.lookup_field)
        if str(lookup).isdigit():
            return generics.get_object_or_404(self.get_queryset(), pk=lookup)
        return generics.get_object_or_404(self.get_queryset(), slug=lookup)

class IsOrganizerOrAdmin(permissions.BasePermission):
    message = "Only verified Event Organizers and Administrators are authorized to create or manage events."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in ['organizer', 'admin'] or request.user.is_staff)
        )

class EventCreateView(generics.CreateAPIView):
    serializer_class = EventDetailSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def perform_create(self, serializer):
        user = self.request.user
        organizer_name = self.request.data.get('organizer_name') or user.full_name
        event = serializer.save(organizer=user, organizer_name=organizer_name)

        # Automatically create default ticket tiers if provided in request
        tiers_data = self.request.data.get('ticket_tiers', [])
        for tier in tiers_data:
            TicketTier.objects.create(
                event=event,
                name=tier.get('name', 'General Admission'),
                price=tier.get('price', 50.00),
                total_capacity=tier.get('total_capacity', 100),
                available_capacity=tier.get('available_capacity', tier.get('total_capacity', 100)),
                description=tier.get('description', ''),
                perks=tier.get('perks', []),
                access_point=tier.get('access_point', 'Main Gate')
            )

class OrganizerEventsListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        return Event.objects.filter(organizer=user).order_by('-created_at')

class EventReviewCreateView(generics.CreateAPIView):
    serializer_class = EventReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.kwargs.get('event_id')
        event = generics.get_object_or_404(Event, pk=event_id)
        serializer.save(user=self.request.user, event=event)
