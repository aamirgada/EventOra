import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Search Bar state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('all');
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchDate, setSearchDate] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, catsRes] = await Promise.all([
          api.get('/events/'),
          api.get('/events/categories/'),
        ]);
        setEvents(eventsRes.data.results || eventsRes.data || []);
        setCategories(catsRes.data.results || catsRes.data || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append('q', searchKeyword.trim());
    if (searchLocation !== 'all') params.append('location', searchLocation);
    if (searchCategory !== 'all') params.append('category', searchCategory);
    if (searchDate !== 'all') params.append('timeframe', searchDate);
    navigate(`/explore?${params.toString()}`);
  };

  const filteredEvents = activeTab === 'all'
    ? events
    : events.filter(e => e.category?.slug === activeTab || e.category?.name?.toLowerCase().includes(activeTab));

  return (
    <div className="flex flex-col w-full pb-space-3xl">
      {/* SECTION 1: Top Hero Container */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#f2edff] via-[#f7f4ff] to-[#fcf8ff] p-6 sm:p-10 md:p-14 lg:p-16 border border-[#e8e1fb] shadow-sm animate-fade-in-down">
          {/* Subtle Ambient Glows with Floating Motion */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-secondary-container/40 blur-3xl animate-float"></div>
          <div className="pointer-events-none absolute -bottom-28 -left-12 w-80 h-80 rounded-full bg-primary-fixed/40 blur-3xl animate-pulse-glow"></div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-primary text-xs font-semibold shadow-sm mb-6 border border-surface-container animate-fade-in-up hover-lift cursor-default">
              <svg className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '12s' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.39 8.26L21 9.27L16.2 13.97L17.34 20.5L12 17.27L6.66 20.5L7.8 13.97L3 9.27L9.61 8.26L12 2Z" />
              </svg>
              <span>Discover · Book · Experience</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 leading-[1.15] animate-fade-in-up animation-delay-100">
              Discover Events That Make <span className="text-primary-container bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Every Moment Count</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-on-surface-variant max-w-xl mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
              Find incredible concerts, tech summits, creative masterclasses, and cultural spectacles curated meticulously for you.
            </p>

            {/* Floating Multi-Segment Command Search Bar */}
            <div className="w-full bg-white rounded-2xl md:rounded-full p-2 shadow-lg hover:shadow-2xl transition-all duration-300 mb-8 border border-surface-container animate-fade-in-up animation-delay-300">
              <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5">
                {/* Search Keywords */}
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <svg className="w-4 h-4 text-outline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search events, artists, venues..."
                    className="w-full bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-outline outline-none"
                  />
                </div>

                {/* Location */}
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <svg className="w-4 h-4 text-outline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-on-surface outline-none cursor-pointer appearance-none font-medium pr-4"
                  >
                    <option value="all">All Locations</option>
                    <option value="San Francisco">San Francisco, CA</option>
                    <option value="New York">New York, NY</option>
                    <option value="San Jose">San Jose / Silicon Valley</option>
                    <option value="Napa">Napa Valley, CA</option>
                  </select>
                </div>

                {/* Category */}
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <svg className="w-4 h-4 text-outline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-on-surface outline-none cursor-pointer appearance-none font-medium pr-4"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <svg className="w-4 h-4 text-outline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <select
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-on-surface outline-none cursor-pointer appearance-none font-medium pr-4"
                  >
                    <option value="all">Anytime</option>
                    <option value="this-weekend">This Weekend</option>
                    <option value="7days">Next 7 Days</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Action CTA */}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary-container text-white font-sans font-semibold text-xs sm:text-sm hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 shrink-0 shadow-sm active:scale-95"
                >
                  <span>Search</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Social Proof Metric Row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center -space-x-2">
                <img
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Attendee"
                />
                <img
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Attendee"
                />
                <img
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                  alt="Attendee"
                />
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[10px] shadow-sm ring-2 ring-white">
                  +120k
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <span><strong>4.9/5</strong> rating · Loved by 120,000+ attendees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Category Discovery Chips */}
      <section className="max-w-[1280px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-lg">
        <div className="flex items-center justify-between mb-space-md">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Browse By Passion</span>
            <h2 className="font-display font-bold text-headline-sm text-on-surface">Curated Categories</h2>
          </div>
          <Link to="/explore" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              className="p-space-md rounded-2xl bg-surface-container-lowest hover:bg-surface-container-high border border-surface-container shadow-sm hover:shadow-lg hover-lift transition-all duration-300 flex flex-col items-center text-center group"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                style={{ backgroundColor: cat.badge_color || '#30217d' }}
              >
                <span className="material-symbols-outlined text-[24px]">{cat.icon || 'event'}</span>
              </div>
              <h4 className="font-sans font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                {cat.name}
              </h4>
              <span className="text-[11px] text-on-surface-variant mt-0.5">
                {cat.events_count ? `${cat.events_count} experiences` : 'Explore events'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: Featured Experiences (Curated Spotlight) */}
      <section className="max-w-[1280px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div>
            <span className="font-sans text-xs uppercase tracking-widest text-primary font-bold px-space-sm py-1 rounded-full bg-secondary-container mb-space-xs inline-block">
              Curated Spotlight
            </span>
            <h2 className="font-display font-bold text-headline-md text-on-surface tracking-tight">
              Events Worth Experiencing
            </h2>
            <p className="font-sans text-body-sm text-on-surface-variant">
              Handpicked experiences trending this week
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-full bg-surface-container-low border border-surface-container self-start md:self-auto overflow-x-auto">
            {['all', 'music', 'tech', 'food', 'arts'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-space-md py-1.5 rounded-full font-sans text-xs font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] animate-spin text-primary">progress_activity</span>
            <span className="text-xs mt-2 font-semibold">Curating experiences...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] text-outline">event_busy</span>
            <p className="text-sm font-semibold mt-2">No events found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: Value Proposition & Trust Perks */}
      <section className="max-w-[1280px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-xl">
        <div className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-2xl border border-surface-container shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl items-center text-center md:text-left">
            <div className="flex items-center md:items-start gap-space-md">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-on-surface">100% Authentic Passes</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Cryptographically verified admission tokens prevent counter-scalping and duplicate entries.
                </p>
              </div>
            </div>

            <div className="flex items-center md:items-start gap-space-md">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">qr_code_2</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-on-surface">Instant Turnstile Check-in</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Offline-cached high-contrast QR codes scan in under 0.4 seconds at festival turnstiles.
                </p>
              </div>
            </div>

            <div className="flex items-center md:items-start gap-space-md">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">published_with_changes</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-on-surface">Effortless Cancellation</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Plans changed? Request instant pass cancellation or transfer your tickets with a single click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Final CTA */}
      <section className="max-w-[1280px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-container via-primary to-primary-container text-white p-space-xl md:p-space-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-xl">
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="font-display text-headline-md md:text-headline-lg font-bold tracking-tight mb-space-xs">
              Ready for Your Next Adventure?
            </h2>
            <p className="font-sans text-body-md text-surface-container-high leading-relaxed">
              Join thousands discovering unforgettable live moments every single day. Or create your own world on our stage.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-sm w-full md:w-auto shrink-0">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-space-xl py-3.5 rounded-full bg-white text-primary-container font-sans font-bold text-xs hover:bg-secondary-container transition-all text-center shadow-lg"
            >
              Explore Events
            </Link>
            <Link
              to="/organizer?action=create"
              className="w-full sm:w-auto px-space-xl py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans font-bold text-xs transition-all text-center"
            >
              Become an Organizer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
