import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [followingOrganizer, setFollowingOrganizer] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${id}/`);
      setEvent(res.data);
      if (res.data.ticket_tiers?.length > 0) {
        setSelectedTier(res.data.ticket_tiers[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load event details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[40px] animate-spin text-primary">progress_activity</span>
        <span className="text-xs font-semibold mt-2">Loading experience showcase...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center text-center">
        <h2 className="font-display font-bold text-2xl text-on-surface">Event Not Found</h2>
        <Link to="/explore" className="mt-4 px-6 py-2.5 rounded-full bg-primary-container text-white text-xs font-bold">
          Back to Explore
        </Link>
      </div>
    );
  }

  const favorited = isFavorited(event.id);

  // ── Past event detection ──────────────────────────────────────
  const [yyyy, mm, dd] = (event.event_date || '').split('-').map(Number);
  const eventDateObj = new Date(yyyy, mm - 1, dd);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const isPast = eventDateObj < todayDate || event.status === 'past' || event.status === 'cancelled';

  // ── INR formatter ─────────────────────────────────────────────
  const formatINR = (amount) => `\u20B9${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const unitPrice = parseFloat(selectedTier?.price || 0);
  const subtotal = unitPrice * quantity;
  const serviceFee = subtotal * 0.05;
  const grandTotal = subtotal + serviceFee;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="relative w-full max-w-[1280px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-lg pb-space-3xl">
      {/* Top Breadcrumb & Share / Favorite Actions */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
        <ol className="flex items-center flex-wrap gap-space-xs text-xs font-medium text-on-surface-variant">
          <li className="flex items-center gap-space-xs">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          </li>
          <li className="flex items-center gap-space-xs">
            <Link to="/explore" className="hover:text-primary transition-colors">Explore Events</Link>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          </li>
          <li className="flex items-center gap-space-xs">
            <span className="text-on-surface-variant">{event.category?.name || 'Category'}</span>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          </li>
          <li aria-current="page" className="text-primary font-bold truncate max-w-[240px] sm:max-w-none">
            {event.title}
          </li>
        </ol>

        <div className="flex items-center gap-space-xs">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-space-2xs px-space-md py-space-xs bg-surface-container-low hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-all text-xs font-bold shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(event)}
            className={`inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-full transition-all text-xs font-bold shadow-sm ${
              favorited
                ? 'bg-red-50 text-error ring-1 ring-error/30'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-error'
            }`}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            <span>{favorited ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </nav>

      {/* Hero Showcase Section */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-surface-container shadow-xl mb-space-2xl border border-surface-container">
        <div className="relative w-full h-[320px] sm:h-[440px] lg:h-[500px] overflow-hidden">
          <img
            alt={event.title}
            src={event.banner_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80'}
            className="w-full h-full object-cover object-center transform scale-100 hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Layered Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/70 via-transparent to-transparent"></div>

          {/* Top Overlays */}
          <div className="absolute top-space-md left-space-md sm:top-space-lg sm:left-space-lg flex items-center gap-space-xs z-10">
            {event.is_featured && (
              <div className="flex items-center gap-space-2xs bg-surface-container-lowest/95 backdrop-blur-md px-space-md py-1.5 rounded-full shadow-md text-primary font-sans font-bold text-xs">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span>Featured Experience</span>
              </div>
            )}
            <div className="bg-primary-container/85 backdrop-blur-md px-space-md py-1.5 rounded-full text-white font-sans font-bold text-xs shadow-md">
              {event.age_policy}
            </div>
          </div>

          {/* Hero Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-space-md sm:p-space-xl lg:p-space-2xl flex flex-col justify-end text-white z-10">
            <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
              <span className="px-space-sm py-1 bg-secondary-container/90 text-primary font-bold rounded-full text-xs uppercase tracking-wider">
                {event.category?.name || 'Special Experience'}
              </span>
              <span className="px-space-sm py-1 bg-surface-container-lowest/20 backdrop-blur-sm text-white rounded-full text-xs flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Instant Digital Check-in
              </span>
            </div>
            <h1 className="font-display text-headline-md sm:text-[2.75rem] lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] text-white max-w-4xl drop-shadow-md">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Quick Metadata Strip */}
        <div className="w-full bg-surface-container-lowest px-space-md sm:px-space-xl py-space-md sm:py-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          {/* Organizer */}
          <div className="flex items-center justify-between sm:justify-start gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary font-headline-sm font-bold shadow-sm">
                <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-sans font-bold text-xs sm:text-sm text-on-surface">
                    {event.organizer_display || 'SoundWave Productions'}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-surface-tint" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface-variant text-xs">
                  <span className="inline-flex items-center text-amber-500 font-bold gap-0.5">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {event.average_rating || 4.9}
                  </span>
                  <span>•</span>
                  <span>Verified Producer</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFollowingOrganizer(!followingOrganizer);
                toast.success(followingOrganizer ? 'Unfollowed organizer' : 'Following organizer updates!');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                followingOrganizer
                  ? 'bg-secondary-container text-primary'
                  : 'bg-surface-container-high hover:bg-secondary-container text-on-surface-variant hover:text-primary'
              }`}
            >
              {followingOrganizer ? '✓ Following' : '+ Follow'}
            </button>
          </div>

          {/* Quick Facts Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            <div className="flex items-center gap-space-xs p-2 rounded-2xl bg-surface-container-low px-space-md">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Date & Time</span>
                <span className="text-xs font-bold text-on-surface truncate">{event.event_date} • {event.start_time?.slice(0, 5)}</span>
              </div>
            </div>

            <div className="flex items-center gap-space-xs p-2 rounded-2xl bg-surface-container-low px-space-md">
              <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Location</span>
                <span className="text-xs font-bold text-on-surface truncate">{event.venue?.city || 'Virtual'}, {event.venue?.name || 'Online'}</span>
              </div>
            </div>

            <div className="flex items-center gap-space-xs p-2 rounded-2xl bg-surface-container-low px-space-md">
              <span className="material-symbols-outlined text-primary text-[20px]">shield_person</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Access Policy</span>
                <span className="text-xs font-bold text-on-surface truncate">{event.age_policy}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Past Event Banner ─────────────────────────────────── */}
      {isPast && (
        <div className="mb-space-xl rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-500 text-[28px]">event_busy</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-red-700">This Event Has Already Taken Place</h3>
            <p className="text-xs text-red-600 mt-0.5">The booking window for this event is now closed. Ticket purchases are no longer available.</p>
          </div>
        </div>
      )}

      {/* Main Two-Column Architectural Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* LEFT COLUMN: Narrative, Lineup, Highlights, Venue & FAQs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-2xl">
          {/* About This Experience */}
          <section className="bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-3xl shadow-sm border border-surface-container">
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <h2 className="font-display font-bold text-headline-md text-on-surface tracking-tight">
                About This Experience
              </h2>
              <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                Curated Production
              </span>
            </div>
            <div className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-3 whitespace-pre-line">
              <p>{event.description}</p>
            </div>

            {/* Artist Lineup / Performer Showcase */}
            {event.performers?.length > 0 && (
              <div className="mt-space-lg pt-space-lg border-t border-surface-container">
                <h3 className="font-display font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">mic_external_on</span>
                  Featured Lineup & Presenters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {event.performers.map((p) => (
                    <div key={p.id} className="p-3 rounded-2xl bg-surface-container-low flex items-center gap-2.5">
                      <img
                        src={p.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-on-surface truncate">{p.name}</div>
                        <div className="text-[11px] text-on-surface-variant truncate">{p.role}</div>
                        {p.time_slot && (
                          <div className="text-[10px] text-primary font-mono">{p.time_slot}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Venue & Directions */}
          <section className="bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-3xl shadow-sm border border-surface-container">
            <h2 className="font-display font-bold text-headline-sm text-on-surface mb-space-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">map</span>
              Venue & Transit Instructions
            </h2>
            <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="font-bold text-sm text-on-surface">{event.venue?.name || 'Virtual Auditorium'}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">{event.venue?.address || 'Stream credentials sent prior to opening'}</p>
                <p className="text-xs text-on-surface-variant">{event.venue?.city}, {event.venue?.state} {event.venue?.postal_code}</p>
              </div>
              <div className="text-xs text-primary font-bold bg-surface-container px-3 py-1.5 rounded-full shrink-0">
                Capacity: {event.venue?.capacity?.toLocaleString() || '1,800'}
              </div>
            </div>
            {event.venue?.transit_info && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-fixed/30 text-xs text-on-primary-fixed-variant">
                <span className="material-symbols-outlined text-[18px] shrink-0">directions_bus</span>
                <span>{event.venue.transit_info}</span>
              </div>
            )}
          </section>

          {/* Reviews & Community Comments */}
          <section className="bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-3xl shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                Verified Attendee Reviews
              </h2>
              <span className="text-xs font-bold text-primary">4.9 / 5 Rating</span>
            </div>

            <div className="space-y-3">
              {event.reviews?.length > 0 ? (
                event.reviews.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-on-surface">{r.user_name || 'Verified Attendee'}</span>
                      <div className="flex text-amber-500">
                        {[...Array(r.rating || 5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant italic">"{r.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant text-center">
                  Be among the first to experience and review this production!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Ticket Selection Widget (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg sm:p-space-xl shadow-xl border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Direct Turnstile Access</span>
                <h3 className="font-display font-bold text-headline-sm text-on-surface">Select Admission Tier</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-primary font-mono text-xs font-bold">
                INR (₹)
              </span>
            </div>

            {/* Ticket Tier Cards */}
            <div className="space-y-2.5">
              {event.ticket_tiers?.map((tier) => {
                const isSelected = selectedTier?.id === tier.id;
                const isSoldOut = tier.is_sold_out || tier.available_capacity <= 0;

                return (
                  <div
                    key={tier.id}
                    onClick={() => !isSoldOut && setSelectedTier(tier)}
                    className={`p-space-md rounded-2xl border transition-all cursor-pointer ${
                      isSoldOut
                        ? 'opacity-50 bg-surface-container-low border-surface-container cursor-not-allowed'
                        : isSelected
                        ? 'border-primary-container bg-primary-container/5 shadow-md ring-2 ring-primary-container/20'
                        : 'border-surface-container bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ticket-tier"
                          checked={isSelected}
                          onChange={() => setSelectedTier(tier)}
                          disabled={isSoldOut}
                          className="accent-primary-container"
                        />
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-on-surface leading-snug">{tier.name}</h4>
                          <span className="text-[11px] text-on-surface-variant font-medium">
                            {isSoldOut ? 'Sold Out' : `${tier.available_capacity} passes remaining`}
                          </span>
                        </div>
                      </div>
                      <div className="font-display font-bold text-base text-primary">
                        ₹{Number(parseFloat(tier.price)).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {tier.description && (
                      <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed pl-6">
                        {tier.description}
                      </p>
                    )}

                    {tier.perks && Array.isArray(tier.perks) && tier.perks.length > 0 && (
                      <div className="mt-2 pl-6 flex flex-wrap gap-1">
                        {tier.perks.map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-surface-container text-[10px] font-semibold text-primary">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quantity Stepper */}
            <div className="p-space-sm bg-surface-container-low rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-on-surface block">Quantity</span>
                <span className="text-[11px] text-on-surface-variant">Max {selectedTier?.max_per_order || 6} per order</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-white hover:bg-surface-container text-on-surface font-bold text-sm shadow-sm flex items-center justify-center"
                >
                  -
                </button>
                <span className="font-display font-bold text-sm w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(
                    selectedTier?.max_per_order || 6,
                    selectedTier?.available_capacity || 999,
                    quantity + 1
                  ))}
                  className="w-8 h-8 rounded-full bg-white hover:bg-surface-container text-on-surface font-bold text-sm shadow-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-on-surface-variant pt-2 border-t border-surface-container">
              <div className="flex justify-between">
                <span>Pass Subtotal</span>
                <span className="font-bold text-on-surface">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Facility & Security Fee (5%)</span>
                <span className="font-bold text-on-surface">{formatINR(serviceFee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-surface-container text-sm font-bold text-primary">
                <span>Total Amount</span>
                <span className="font-display text-lg">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            {isPast ? (
              /* Past event — block checkout entirely */
              <div className="w-full py-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center gap-1 text-center">
                <span className="material-symbols-outlined text-red-500 text-[28px]">event_busy</span>
                <span className="font-bold text-sm text-red-700">Booking Closed</span>
                <span className="text-xs text-red-500">This event has already taken place.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please sign in to book tickets.');
                    navigate('/login');
                    return;
                  }
                  setBookingModalOpen(true);
                }}
                disabled={!selectedTier || selectedTier.available_capacity <= 0}
                className="w-full py-3.5 rounded-full bg-primary-container text-white font-sans font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                <span>Proceed to Checkout</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
              <span>256-bit Encrypted Admission Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {bookingModalOpen && (
        <BookingModal
          event={event}
          tier={selectedTier}
          quantity={quantity}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  );
}
