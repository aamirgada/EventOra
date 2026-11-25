import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import GateScannerModal from '../components/GateScannerModal';
import CreateEventModal from '../components/CreateEventModal';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OrganizerStudioPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const [stats, setStats] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'events' | 'orders'
  const [loading, setLoading] = useState(true);

  // Modals
  const [scannerOpen, setScannerOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(searchParams.get('action') === 'create');

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedEventId]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/dashboard/?event_id=${selectedEventId}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = stats?.metrics || {
    total_gross: 124850.00,
    gross_growth_pct: 18.4,
    tickets_sold: 1420,
    total_capacity: 1800,
    capacity_percentage: 78.8,
    confirmed_orders: 842,
    avg_tickets_per_order: 1.68,
    checked_in_count: 0,
    checked_in_percentage: 0.0,
    active_events_count: 5,
  };

  const chartData = stats?.sales_chart?.length > 0
    ? stats.sales_chart
    : [
        { date: 'Oct 14', revenue: 4200, tickets: 35 },
        { date: 'Oct 15', revenue: 8600, tickets: 72 },
        { date: 'Oct 16', revenue: 14200, tickets: 110 },
        { date: 'Oct 17', revenue: 19500, tickets: 160 },
        { date: 'Oct 18', revenue: 26800, tickets: 215 },
        { date: 'Oct 19', revenue: 38400, tickets: 310 },
        { date: 'Oct 20', revenue: 52100, tickets: 420 },
      ];

  const managedEvents = stats?.managed_events || [];
  const recentBookings = stats?.recent_bookings || [];

  // Redirect unauthenticated users
  if (!authLoading && !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-3xl bg-secondary-container text-primary flex items-center justify-center mx-auto mb-6 shadow-md">
          <span className="material-symbols-outlined text-[32px]">login</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl text-on-surface mb-3">Sign In Required</h1>
        <p className="text-sm text-on-surface-variant mb-8">Please sign in to access the Organizer Studio.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="px-6 py-3 rounded-full bg-primary-container text-white text-xs font-bold hover:bg-primary shadow-md transition-all">
            Sign In
          </Link>
          <Link to="/explore" className="px-6 py-3 rounded-full bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  // Restrict Attendee access: Only Organizers & Admins can enter Organizer Studio
  if (user && user.role === 'attendee') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-3xl bg-secondary-container text-primary flex items-center justify-center mx-auto mb-6 shadow-md">
          <span className="material-symbols-outlined text-[32px]">shield_lock</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-secondary-container">
          Organizer Privilege Required
        </span>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface mt-4 mb-3">
          Organizer Studio is for Event Creators
        </h1>
        <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed mb-8">
          You are currently signed in as an <strong>Attendee ({user.email})</strong>. Attendees explore, purchase passes, and download digital tickets. To publish events and manage turnstile scanners, please sign in with an Organizer account.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary-container text-white text-xs font-bold hover:bg-primary shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create Organizer Account</span>
          </Link>
          <Link
            to="/explore"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all"
          >
            Browse Experiences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg py-space-xl flex flex-col gap-space-xl pb-space-3xl">
      {/* Header Workspace & Command Line */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-container text-primary uppercase tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-surface-tint animate-pulse"></span>
              Verified Production Hub
            </span>
            <span className="text-outline-variant font-bold">/</span>
            <span className="text-on-surface-variant font-medium">Production ID: SW-2026-X</span>
          </div>
          <h1 className="font-display text-headline-md sm:text-headline-lg text-on-surface tracking-tight font-bold">
            Organizer Studio <span className="text-surface-tint font-light">•</span> {user?.full_name || 'SoundWave Productions'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Active Event Selector */}
          <div className="relative inline-flex items-center bg-surface-container-lowest rounded-full shadow-sm px-space-md py-2 gap-space-xs text-on-surface border border-surface-container">
            <span className="material-symbols-outlined text-[18px] text-primary">confirmation_number</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer pr-4 appearance-none"
            >
              <option value="all">All Events (Active)</option>
              {managedEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant pointer-events-none">expand_more</span>
          </div>

          {/* Gate Scanner Action Button */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="inline-flex items-center gap-space-xs px-space-lg py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-sans text-xs font-bold shadow-sm border border-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">qr_code_scanner</span>
            <span>Gate Scanner</span>
          </button>

          {/* Create Event Trigger */}
          <button
            type="button"
            onClick={() => setCreateEventOpen(true)}
            className="inline-flex items-center gap-space-xs px-space-lg py-2 rounded-full bg-primary-container text-white font-sans text-xs font-bold shadow-md hover:bg-primary active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-surface-container">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-space-lg py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-primary-container text-white shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-space-lg py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'events'
              ? 'bg-primary-container text-white shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">event</span>
          <span>Managed Events</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-primary text-[10px] font-bold">
            {managedEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-space-lg py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'orders'
              ? 'bg-primary-container text-white shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Bookings & Orders</span>
        </button>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="px-space-lg py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-600">qr_code_scanner</span>
          <span>Gate Scanner</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`px-space-lg py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'payouts'
              ? 'bg-primary-container text-white shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Payouts & Settlements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-space-lg py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'settings'
              ? 'bg-primary-container text-white shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Settings</span>
        </button>
      </div>

      {/* Row of 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {/* Card 1: Gross Revenue */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Gross</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-headline-sm sm:text-headline-md text-on-surface block">
              ₹{Number(metrics.total_gross).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-emerald-600 text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +{metrics.gross_growth_pct}%
              </span>
              <span className="text-on-surface-variant text-[11px]">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tickets Sold */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Tickets Sold</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">local_activity</span>
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-headline-sm sm:text-headline-md text-on-surface block">
              {metrics.tickets_sold} <span className="text-xs font-normal text-on-surface-variant">/ {metrics.total_capacity}</span>
            </span>
            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.capacity_percentage || 0)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">{metrics.capacity_percentage}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Confirmed Orders */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Confirmed Orders</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-headline-sm sm:text-headline-md text-on-surface block">
              {metrics.confirmed_orders}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant">
              <span className="text-primary font-bold">{metrics.avg_tickets_per_order || 1.6} tickets</span>
              <span>per booking</span>
            </div>
          </div>
        </div>

        {/* Card 4: Gate Check-in */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Gate Check-in</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-headline-sm sm:text-headline-md text-on-surface block">
              {metrics.checked_in_count} <span className="text-xs font-normal text-on-surface-variant">/ {metrics.tickets_sold}</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {metrics.checked_in_percentage}% Admitted
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Active Events */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Active Events</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">campaign</span>
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-headline-sm sm:text-headline-md text-on-surface block">
              {metrics.active_events_count}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant">
              <span>Published & live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trends Chart (Recharts) */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-sm border border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Financial & Ticket Pacing</span>
            <h3 className="font-display font-bold text-headline-sm text-on-surface">Revenue & Sales Trajectory</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <span className="w-3 h-3 rounded-full bg-primary-container"></span> Revenue (₹)
            </span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30217d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#30217d" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efebff" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#787583' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#787583' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #efebff',
                  boxShadow: '0 4px 16px rgba(48,33,125,0.1)',
                  fontSize: '12px',
                }}
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#30217d" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Managed Events Table */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-sm border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
          <div>
            <h3 className="font-display font-bold text-headline-sm text-on-surface">Active Managed Events</h3>
            <p className="text-xs text-on-surface-variant">Live capacities, revenue, and door check-in status</p>
          </div>
          <button
            onClick={() => setCreateEventOpen(true)}
            className="px-4 py-1.5 rounded-full bg-primary-container text-white text-xs font-bold hover:bg-primary transition-colors"
          >
            + New Event
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-container text-on-surface-variant uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Event</th>
                <th className="pb-3 font-bold">Date & Venue</th>
                <th className="pb-3 font-bold">Tickets Sold</th>
                <th className="pb-3 font-bold">Gross Revenue</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {managedEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3.5 pr-3 font-bold text-on-surface">
                    <div className="truncate max-w-xs">{ev.title}</div>
                    <span className="text-[10px] text-on-surface-variant font-normal">{ev.category}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-on-surface-variant">
                    <div>{ev.date}</div>
                    <span className="text-[11px] text-on-surface truncate">{ev.venue}</span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <div className="font-semibold text-on-surface">{ev.tickets_sold} / {ev.total_capacity}</div>
                    <div className="w-24 bg-surface-container rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: `${ev.sold_percentage}%` }}></div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 font-display font-bold text-primary">
                    ₹{Number(ev.gross_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ev.status === 'published'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-1">
                    <button
                      onClick={() => setScannerOpen(true)}
                      title="Gate Scanner"
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-primary-container hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Bookings Feed */}
      {recentBookings.length > 0 && (
        <section className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-sm border border-surface-container">
          <h3 className="font-display font-bold text-headline-sm text-on-surface mb-3">Recent Bookings & Attendee Admissions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-on-surface-variant font-bold">{b.reference}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">{b.status}</span>
                  </div>
                  <div className="font-bold text-on-surface truncate">{b.user_name}</div>
                  <div className="text-[11px] text-on-surface-variant truncate">{b.event_title}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-surface-container flex items-center justify-between">
                  <span className="font-display font-bold text-primary">₹{Number(b.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-on-surface-variant">{b.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Payouts Tab Panel */}
      {activeTab === 'payouts' && (
        <section className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-sm border border-surface-container flex flex-col items-center justify-center py-20 text-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-primary">payments</span>
          <h3 className="font-display font-bold text-headline-sm text-on-surface">Payouts & Settlements</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Your settlement history and payout schedules will appear here. Connect a bank account to enable direct payouts.
          </p>
          <button
            type="button"
            onClick={() => toast('Bank account linking coming soon!', { icon: '🏦' })}
            className="px-6 py-2.5 rounded-full bg-primary-container text-white text-xs font-bold hover:bg-primary transition-colors shadow-sm"
          >
            Connect Bank Account
          </button>
        </section>
      )}

      {/* Settings Tab Panel */}
      {activeTab === 'settings' && (
        <section className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-sm border border-surface-container flex flex-col items-center justify-center py-20 text-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-primary">tune</span>
          <h3 className="font-display font-bold text-headline-sm text-on-surface">Studio Settings</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Manage your organizer profile, notification preferences, and billing settings here.
          </p>
          <button
            type="button"
            onClick={() => toast('Settings panel coming soon!', { icon: '⚙️' })}
            className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
          >
            Edit Profile Settings
          </button>
        </section>
      )}

      {/* Gate Scanner Modal */}
      {scannerOpen && (
        <GateScannerModal
          onClose={() => setScannerOpen(false)}
          onScanComplete={() => fetchDashboardStats()}
        />
      )}

      {/* Create Event Modal */}
      {createEventOpen && (
        <CreateEventModal
          onClose={() => setCreateEventOpen(false)}
          onCreated={() => fetchDashboardStats()}
        />
      )}
    </div>
  );
}
