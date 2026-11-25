import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CreateEventModal({ onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    venue_id: '',
    event_date: '',
    start_time: '18:00',
    end_time: '23:00',
    format: 'in_person',
    short_description: '',
    description: '',
    banner_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    age_policy: 'All Ages Welcome',
    tier_name: 'General Admission',
    tier_price: '999',
    tier_capacity: '250',
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, venRes] = await Promise.all([
          api.get('/events/categories/'),
          api.get('/events/venues/'),
        ]);
        const cats = catRes.data.results || catRes.data || [];
        const vens = venRes.data.results || venRes.data || [];
        setCategories(cats);
        setVenues(vens);
        if (cats.length > 0) setFormData((prev) => ({ ...prev, category_id: cats[0].id }));
        if (vens.length > 0) setFormData((prev) => ({ ...prev, venue_id: vens[0].id }));
      } catch {}
    };
    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Event title is required.';
    if (!formData.event_date) errs.event_date = 'Event date is required.';
    if (!formData.short_description.trim()) errs.short_description = 'Short tagline is required.';
    if (!formData.description.trim()) errs.description = 'Full description is required.';
    if (!formData.tier_price || isNaN(parseFloat(formData.tier_price))) errs.tier_price = 'Valid price required.';
    if (!formData.tier_capacity || isNaN(parseInt(formData.tier_capacity))) errs.tier_capacity = 'Valid seat count required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation first — scroll to top of form to show errors
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      toast.error('Please fill all required fields highlighted below.', { duration: 4000 });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category_id: formData.category_id,
        venue_id: formData.venue_id || null,
        event_date: formData.event_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        format: formData.format,
        short_description: formData.short_description.trim(),
        description: formData.description.trim(),
        banner_image: formData.banner_image.trim(),
        age_policy: formData.age_policy,
        min_price: parseFloat(formData.tier_price),
        ticket_tiers: [
          {
            name: formData.tier_name || 'General Admission',
            price: parseFloat(formData.tier_price),
            total_capacity: parseInt(formData.tier_capacity, 10),
            available_capacity: parseInt(formData.tier_capacity, 10),
            description: 'Standard admission pass.',
            access_point: 'Main Entrance',
          },
        ],
      };

      const res = await api.post('/events/create/', payload);
      toast.success(`\u2728 Event "${res.data.title}" published successfully!`, { duration: 5000 });
      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      // Show actual backend validation errors
      if (err.response?.data && typeof err.response.data === 'object') {
        const backendErrors = err.response.data;
        const messages = Object.entries(backendErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        toast.error(messages || 'Failed to publish event.', { duration: 8000 });
      } else {
        toast.error('Failed to publish event. Check your connection and try again.', { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-error bg-red-50 focus:ring-error/30'
        : 'border-surface-container bg-surface-container-low focus:ring-primary-container'
    }`;

  const smallInputClass = (field) =>
    `w-full px-3 py-1.5 rounded-lg border text-xs transition-colors ${
      errors[field]
        ? 'border-error bg-red-50'
        : 'bg-surface-container-lowest border-surface-container'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-space-lg bg-gradient-to-r from-primary-container via-primary to-primary-container text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">Create New Experience</h3>
              <p className="text-xs text-secondary-container">Publish a live event to the Eventora discovery directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Error Summary Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="shrink-0 mx-4 mt-3 p-3 rounded-2xl bg-red-50 border border-error/30 flex items-start gap-2 text-xs text-error">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <div>
              <span className="font-bold block mb-1">Please fix the highlighted fields:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-space-lg flex-1 overflow-y-auto flex flex-col gap-space-md text-xs">

          {/* Title */}
          <div>
            <label className="block font-bold text-on-surface mb-1">
              Event Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. India's Got Latent Night Out"
              className={inputClass('title')}
            />
            {errors.title && <p className="text-error text-[11px] mt-1">{errors.title}</p>}
          </div>

          {/* Category + Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-bold text-on-surface mb-1">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="">— Select Category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Venue</label>
              <select
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="">— Select Venue —</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-bold text-on-surface mb-1">
                Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className={inputClass('event_date')}
              />
              {errors.event_date && <p className="text-error text-[11px] mt-1">{errors.event_date}</p>}
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Start Time</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">End Time</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none"
              />
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block font-bold text-on-surface mb-1">Event Format</label>
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none"
            >
              <option value="in_person">In-Person</option>
              <option value="online">Online / Live Stream</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Short Description */}
          <div>
            <label className="block font-bold text-on-surface mb-1">
              Short Tagline <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="One-sentence description shown on event cards"
              className={inputClass('short_description')}
            />
            {errors.short_description && <p className="text-error text-[11px] mt-1">{errors.short_description}</p>}
          </div>

          {/* Full Description */}
          <div>
            <label className="block font-bold text-on-surface mb-1">
              Full Experience Story &amp; Details <span className="text-error">*</span>
            </label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the artists, agenda, atmosphere, inclusions..."
              className={inputClass('description')}
            />
            {errors.description && <p className="text-error text-[11px] mt-1">{errors.description}</p>}
          </div>

          {/* Initial Ticket Tier */}
          <div className="p-space-sm bg-surface-container-low rounded-2xl border border-surface-container">
            <span className="font-bold text-on-surface uppercase tracking-wider block mb-2 text-[11px]">
              Initial Admission Tier
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-on-surface-variant mb-1 font-semibold">Tier Name</label>
                <input
                  type="text"
                  name="tier_name"
                  value={formData.tier_name}
                  onChange={handleChange}
                  className={smallInputClass('tier_name')}
                />
              </div>
              <div>
                <label className="block text-[11px] text-on-surface-variant mb-1 font-semibold">
                  Price (₹ INR) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="tier_price"
                  value={formData.tier_price}
                  onChange={handleChange}
                  className={smallInputClass('tier_price')}
                />
                {errors.tier_price && <p className="text-error text-[11px] mt-1">{errors.tier_price}</p>}
              </div>
              <div>
                <label className="block text-[11px] text-on-surface-variant mb-1 font-semibold">
                  Total Seats / Passes <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  name="tier_capacity"
                  value={formData.tier_capacity}
                  onChange={handleChange}
                  className={smallInputClass('tier_capacity')}
                />
                {errors.tier_capacity && <p className="text-error text-[11px] mt-1">{errors.tier_capacity}</p>}
              </div>
            </div>
          </div>

          {/* Banner Image URL */}
          <div>
            <label className="block font-bold text-on-surface mb-1">Banner Image URL</label>
            <input
              type="text"
              name="banner_image"
              value={formData.banner_image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          {/* Age Policy */}
          <div>
            <label className="block font-bold text-on-surface mb-1">Age Policy</label>
            <select
              name="age_policy"
              value={formData.age_policy}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none"
            >
              <option>All Ages Welcome</option>
              <option>18+ Only</option>
              <option>21+ Only</option>
              <option>Family Friendly (All Ages)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-primary-container text-white font-sans font-bold text-sm shadow-md hover:bg-primary transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Publishing Event...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                <span>Publish Event to Eventora</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
