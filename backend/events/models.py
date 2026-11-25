from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon = models.CharField(max_length=50, default='event')
    image_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    badge_color = models.CharField(max_length=30, default='#30217d')

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            # Avoid slug collision (same deduplication logic as Event.save)
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Venue(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='USA')
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    transit_info = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    capacity = models.PositiveIntegerField(default=1000)

    class Meta:
        db_table = 'venues'
        ordering = ['city', 'name']

    def __str__(self):
        return f"{self.name} - {self.city}"

class Event(models.Model):
    class Format(models.TextChoices):
        IN_PERSON = 'in_person', 'In-Person'
        ONLINE = 'online', 'Online Stream'
        HYBRID = 'hybrid', 'Hybrid'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        PAST = 'past', 'Past'
        CANCELLED = 'cancelled', 'Cancelled'

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_events')
    organizer_name = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='events')
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True, null=True)
    banner_image = models.TextField(blank=True, null=True)
    
    event_date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField(blank=True, null=True)
    doors_open = models.CharField(max_length=50, blank=True, null=True, default='Gates Open 1 hour before start')
    
    format = models.CharField(max_length=20, choices=Format.choices, default=Format.IN_PERSON)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    age_policy = models.CharField(max_length=100, default='All Ages Welcome')
    min_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        ordering = ['event_date', 'start_time']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.event_date})"

class TicketTier(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_tiers')
    name = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_capacity = models.PositiveIntegerField()
    available_capacity = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    perks = models.JSONField(default=list, blank=True)
    access_point = models.CharField(max_length=100, default='Main Gate Entry')
    max_per_order = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ticket_tiers'
        ordering = ['price']

    def clean(self):
        super().clean()
        if self.available_capacity is not None and self.total_capacity is not None:
            if self.available_capacity > self.total_capacity:
                raise ValidationError(
                    {'available_capacity': 'available_capacity cannot exceed total_capacity.'}
                )

    def save(self, *args, **kwargs):
        self.full_clean()  # enforce clean() validation on every save
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.event.title} - {self.name} (${self.price})"

class Performer(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='performers')
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=150, default='Performer')
    avatar = models.TextField(blank=True, null=True)
    time_slot = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'performers'

    def __str__(self):
        return f"{self.name} - {self.role}"

class EventReview(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.event.title} ({self.rating}/5)"
