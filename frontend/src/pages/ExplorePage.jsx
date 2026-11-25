import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { useFavorites } from '../context/FavoritesContext';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { favoritesList } = useFavorites();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state initialized from URL query params
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [selectedTimeframe, setSelectedTimeframe] = useState(searchParams.get('timeframe') || 'all');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || 'all');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('price_max') || 10000);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date_asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(searchParams.get('filter') === 'favorites');

  // Sync filter state when URL searchParams change
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedLocation(searchParams.get('location') || 'all');
    setSelectedTimeframe(searchParams.get('timeframe') || 'all');
    setSelectedFormat(searchParams.get('format') || 'all');
    if (searchParams.get('price_max')) {
      setMaxPrice(Number(searchParams.get('price_max')));
    }
    if (searchParams.get('sort')) {
      setSortBy(searchParams.get('sort'));
    }
    setShowFavoritesOnly(searchParams.get('filter') === 'favorites');
  }, [searchParams]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedLocation, selectedTimeframe, selectedFormat, maxPrice, sortBy, showFavoritesOnly, query]);

  const fetchInitialData = async () => {
    try {
      const [catsRes, venRes] = await Promise.all([
        api.get('/events/categories/'),
        api.get('/events/venues/'),
      ]);
      setCategories(catsRes.data.results || catsRes.data || []);
      setVenues(venRes.data.results || venRes.data || []);
    } catch {}
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (selectedTimeframe !== 'all') params.append('timeframe', selectedTimeframe);
      if (selectedFormat !== 'all') params.append('format', selectedFormat);
    if (maxPrice < 10000) params.append('price_max', maxPrice);
      if (sortBy) params.append('sort', sortBy);

      const res = await api.get(`/events/?${params.toString()}`);
      let list = res.data.results || res.data || [];

      if (showFavoritesOnly) {
        const favEventIds = new Set(favoritesList.map(f => f.event?.id || f.event_id));
        list = list.filter(e => favEventIds.has(e.id));
      }

      setEvents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommandSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const resetAllFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedTimeframe('all');
    setSelectedFormat('all');
    setMaxPrice(10000);
    setSortBy('date_asc');
    setShowFavoritesOnly(false);
    setSearchParams({});
  };

  return (
    <div className="relative w-full max-w-[1280px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg pt-space-xl pb-space-3xl">
      {/* Editorial Page Header */}
      <section className="relative mb-space-2xl">
        <div className="inline-flex items-center gap-space-xs bg-secondary-container/60 px-space-md py-1 rounded-full text-primary mb-space-sm shadow-sm backdrop-blur-sm text-xs font-bold tracking-wider uppercase">
          <span className="material-symbols-outlined text-[16px]">travel_explore</span>
          <span>Curated Event Directory • 2026 Season</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="max-w-3xl">
            <h1 className="font-display text-headline-lg lg:text-display-hero text-primary font-bold tracking-tight mb-space-xs leading-tight">
              Explore Amazing Events
            </h1>
            <p className="font-sans text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
              Find and filter experiences that match your passions, location, and schedule across live music, elevated arts, and innovative tech summits.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-space-md bg-surface-container-lowest p-space-sm rounded-2xl shadow-sm border border-surface-container">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-sans text-xs text-primary font-bold shadow-sm">SF</span>
              <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-sans text-xs text-primary font-bold shadow-sm">NY</span>
              <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-sans text-xs text-on-surface font-bold shadow-sm">LON</span>
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-sans font-bold text-primary">{events.length} Experiences live</span>
              <span className="text-on-surface-variant">Real-time capacity tracking</span>
            </div>
          </div>
        </div>

        {/* Elevated Horizontal Command Bar */}
        <div className="mt-space-xl bg-surface-container-lowest p-space-xs sm:p-space-sm rounded-3xl shadow-md border border-surface-container">
          <form onSubmit={handleCommandSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-xs items-center">
            {/* Keyword Search */}
            <div className="lg:col-span-4 flex items-center gap-space-sm bg-surface-container-low px-space-md py-2.5 rounded-full focus-within:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              <div className="flex flex-col w-full min-w-0">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant leading-none mb-1">Search Keywords</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Artists, festivals, tech symposia..."
                  className="w-full bg-transparent text-xs text-on-surface placeholder:text-outline outline-none"
                />
              </div>
            </div>

            {/* City / Location */}
            <div className="lg:col-span-3 flex items-center gap-space-sm bg-surface-container-low px-space-md py-2.5 rounded-full focus-within:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-outline text-[20px]">location_on</span>
              <div className="flex flex-col w-full min-w-0">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant leading-none mb-1">Location</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent text-xs text-on-surface font-semibold outline-none cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  <option value="San Francisco">San Francisco, CA</option>
                  <option value="New York">New York, NY</option>
                  <option value="San Jose">San Jose / Silicon Valley</option>
                  <option value="St. Helena">Napa Valley, CA</option>
                </select>
              </div>
            </div>

            {/* Timeframe */}
            <div className="lg:col-span-3 flex items-center gap-space-sm bg-surface-container-low px-space-md py-2.5 rounded-full focus-within:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-outline text-[20px]">calendar_today</span>
              <div className="flex flex-col w-full min-w-0">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant leading-none mb-1">Timeframe</span>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full bg-transparent text-xs text-on-surface font-semibold outline-none cursor-pointer"
                >
                  <option value="all">Any Date</option>
                  <option value="this-weekend">This Weekend</option>
                  <option value="next-week">Next 7 Days</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <div className="lg:col-span-2 flex items-center">
              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-space-xs bg-primary-container text-white font-sans text-xs font-bold rounded-full shadow-sm hover:bg-primary transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Find Events</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Sticky Sidebar Filters */}
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-space-lg sticky top-24">
          <div className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-surface-container flex flex-col gap-space-lg">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-2xs text-primary">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <h2 className="font-display text-headline-sm font-bold">Filters</h2>
              </div>
              <button
                type="button"
                onClick={resetAllFilters}
                className="font-sans text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                Reset
              </button>
            </div>

            {/* Filter 1: Saved Favorites Toggle */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors border border-surface-container">
                <span className="flex items-center gap-2 text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                  Saved Events Only
                </span>
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container accent-primary-container cursor-pointer"
                />
              </label>
            </div>

            {/* Filter 2: Categories */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-primary">Category</span>
              <div className="flex flex-col gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors text-left ${
                    selectedCategory === 'all' ? 'bg-primary-container text-white font-bold' : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{events.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      selectedCategory === cat.slug ? 'bg-primary-container text-white font-bold' : 'hover:bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="opacity-75">{cat.events_count || ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Event Format */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-primary">Experience Format</span>
              <div className="flex flex-col gap-1.5 mt-1">
                {[
                  { id: 'all', label: 'All Formats' },
                  { id: 'in_person', label: 'In-Person Gathering' },
                  { id: 'online', label: 'Online Live Stream' },
                  { id: 'hybrid', label: 'Hybrid Dual Access' },
                ].map((fmt) => (
                  <label key={fmt.id} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={selectedFormat === fmt.id}
                      onChange={() => setSelectedFormat(fmt.id)}
                      className="accent-primary-container"
                    />
                    <span>{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 4: Max Price Slider */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-bold uppercase tracking-wider text-primary">Price Range</span>
                <span className="font-bold text-primary font-display">₹{Number(maxPrice).toLocaleString('en-IN')} max</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary-container cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
                <span>Free (₹0)</span>
                <span>₹5,000</span>
                <span>₹10,000+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Main Column */}
        <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-space-lg">
          {/* Results Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-sm bg-surface-container-lowest rounded-2xl border border-surface-container">
            <span className="text-xs font-semibold text-on-surface-variant">
              Showing <strong className="text-on-surface">{events.length}</strong> experiences found
            </span>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-low px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface outline-none cursor-pointer"
              >
                <option value="date_asc">Date: Soonest First</option>
                <option value="popular">Popularity / Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] animate-spin text-primary">progress_activity</span>
              <span className="text-xs mt-2 font-semibold">Curating experiences...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 p-8 rounded-3xl bg-surface-container-lowest border border-surface-container flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">event_busy</span>
              <h3 className="font-display font-bold text-lg text-on-surface">No Events Match Your Filters</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-4">
                Try widening your price range, searching for another location, or resetting the filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-full bg-primary-container text-white text-xs font-bold hover:bg-primary transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
