import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

export default function EventCard({ event }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(event.id);

  // Format date — parse as local date to avoid UTC off-by-one
  const [yyyy, mm, dd] = (event.event_date || '').split('-').map(Number);
  const eventDateObj = new Date(yyyy, mm - 1, dd);
  const formattedDate = eventDateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // ── Past event detection ──────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = eventDateObj < today || event.status === 'past' || event.status === 'cancelled';

  const venueCity = event.venue?.city || 'Online';
  const venueName = event.venue?.name || 'Virtual Stream';
  const categoryName = event.category?.name || 'Live Event';
  const minPrice = parseFloat(event.lowest_price || event.min_price || 0);

  // ── INR formatter ─────────────────────────────────────────────
  const formatINR = (amount) => {
    if (amount <= 0) return 'Free Entry';
    return `\u20B9${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className={`bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient-sm hover:shadow-ambient-md hover-lift transition-all duration-300 flex flex-col group border border-surface-container hover:border-primary-fixed-dim ${isPast ? 'opacity-80' : ''}`}>
      {/* Image Thumbnail */}
      <Link to={`/events/${event.id}`} className="relative h-56 w-full overflow-hidden bg-surface-container block">
        <img
          src={event.banner_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isPast ? 'grayscale-[40%]' : 'group-hover:scale-105'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

        {/* Category / Status Pill */}
        <div className="absolute top-space-sm left-space-sm flex items-center gap-1.5">
          <span className="px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-sans font-bold text-xs shadow-sm">
            {categoryName}
          </span>
          {isPast ? (
            <span className="px-space-sm py-1 rounded-full bg-black/70 text-white font-sans font-bold text-xs shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-red-300">event_busy</span>
              Event Ended
            </span>
          ) : event.is_featured && (
            <span className="px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-sans font-bold text-xs shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Featured
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(event); }}
          aria-label="Save to favorites"
          className={`absolute top-space-sm right-space-sm w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-90 ${favorited ? 'bg-white text-error shadow-lg' : 'bg-surface-container-lowest/80 text-on-surface hover:text-error hover:bg-white'}`}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>

        {/* Date chip */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-md">
          <span className="material-symbols-outlined text-[16px] text-primary-fixed">calendar_month</span>
          <span>{formattedDate} • {event.start_time?.slice(0, 5) || 'Doors Open'}</span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-space-md sm:p-space-lg flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/events/${event.id}`}>
            <h3 className="font-display font-bold text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mt-1.5">
            <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
            <span className="truncate">{venueName}, {venueCity}</span>
          </div>
          <p className="text-on-surface-variant text-xs mt-2 line-clamp-2 leading-relaxed">
            {event.short_description || event.description}
          </p>
        </div>

        {/* Pricing & Booking Row */}
        <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              {isPast ? 'Was' : 'From'}
            </span>
            <span className={`font-display font-bold text-lg leading-none ${isPast ? 'text-on-surface-variant line-through' : 'text-primary'}`}>
              {formatINR(minPrice)}
            </span>
          </div>

          {isPast ? (
            <span className="px-3 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-sans text-xs font-semibold flex items-center gap-1 border border-surface-container cursor-default select-none">
              <span className="material-symbols-outlined text-[15px]">lock_clock</span>
              Booking Closed
            </span>
          ) : (
            <Link
              to={`/events/${event.id}`}
              className="px-space-md py-2 rounded-full bg-surface-container hover:bg-primary-container hover:text-white text-on-surface font-sans text-xs font-semibold transition-all flex items-center gap-1 group-hover:bg-primary-container group-hover:text-white shadow-sm"
            >
              <span>Book Tickets</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
