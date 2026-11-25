import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MyTicketsPage() {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled'
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQrModalTicket, setActiveQrModalTicket] = useState(null);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  useEffect(() => {
    fetchTickets(activeTab);
  }, [activeTab]);

  const fetchTickets = async (tab) => {
    setLoading(true);
    try {
      const res = await api.get(`/tickets/my/?tab=${tab}`);
      setTickets(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket pass and request refund?')) return;

    try {
      await api.post(`/tickets/${ticketId}/cancel/`);
      toast.success('Ticket pass cancelled and queued for full refund.');
      fetchTickets(activeTab);
    } catch (err) {
      toast.error('Unable to cancel ticket.');
    }
  };

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPdf = async (ticket) => {
    if (!ticket || !ticket.id) return;
    setDownloadingId(ticket.id);
    const toastId = toast.loading(`Generating PDF pass for "${ticket.event_title || 'Ticket'}"...`);

    try {
      const response = await api.get(`/tickets/${ticket.id}/pdf/`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Eventora_Pass_${ticket.ticket_number || ticket.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Ticket pass downloaded successfully!`, { id: toastId });
    } catch (err) {
      console.error('Failed to download PDF ticket pass:', err);
      toast.error('Failed to generate PDF pass. Please try again.', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleWalletAdd = () => {
    toast.success('Pass certificate ready for Apple / Google Wallet integration.');
  };

  return (
    <div className="relative w-full overflow-hidden pb-space-3xl">
      {/* Dynamic Atmospheric Glows */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-96 right-10 w-[30rem] h-[30rem] rounded-full bg-surface-container-high/60 blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-[1280px] w-full mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
        {/* Top Title and Metrics Mosaic Bar */}
        <section className="pt-space-xl pb-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-container/60 text-primary font-sans text-xs font-bold uppercase tracking-wider mb-space-xs">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                Verified Attendee Vault
              </div>
              <h1 className="font-display text-headline-lg text-on-surface tracking-tight font-bold">
                My Tickets & Passes
              </h1>
              <p className="font-sans text-body-md text-on-surface-variant mt-space-xs leading-relaxed">
                View your active digital admissions, past experiences, and download passes for instant turnstile check-in.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center flex-wrap gap-space-sm">
              <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-lowest shadow-sm border border-surface-container text-xs font-semibold text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cloud_done
                </span>
                <span>Offline Passes Cached</span>
              </div>
              <button
                type="button"
                onClick={() => setGuidelinesOpen(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-sans text-xs font-bold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">help_center</span>
                <span>Check-in Guidelines</span>
              </button>
            </div>
          </div>

          {/* Segmented Tab Navigation */}
          <div className="mt-space-xl flex items-center justify-between border-b-0 pb-1">
            <div className="inline-flex p-1 rounded-full bg-surface-container-low shadow-sm border border-surface-container">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-space-lg py-space-xs rounded-full font-sans text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'upcoming'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>Upcoming Tickets</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-current text-[11px]">
                  {activeTab === 'upcoming' ? tickets.length : '•'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`px-space-lg py-space-xs rounded-full font-sans text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'past'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>Past Events</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-current text-[11px]">
                  {activeTab === 'past' ? tickets.length : '•'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cancelled')}
                className={`px-space-lg py-space-xs rounded-full font-sans text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'cancelled'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>Cancelled & Refunded</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-space-xs text-on-surface-variant font-sans text-xs">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
              <span>256-bit Encrypted Admission Tokens</span>
            </div>
          </div>
        </section>

        {/* Tickets Feed */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] animate-spin text-primary">progress_activity</span>
            <span className="text-xs font-semibold mt-2">Retrieving ticket pass vault...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-24 p-8 rounded-3xl bg-surface-container-lowest border border-surface-container text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">confirmation_number</span>
            <h3 className="font-display font-bold text-lg text-on-surface">No {activeTab} passes found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-4">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming reservations. Explore our curated events and book your next experience!"
                : 'No past ticket records under this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-space-xl">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="relative bg-surface-container-lowest rounded-3xl shadow-xl overflow-hidden border border-surface-container hover:shadow-2xl transition-all"
              >
                {/* Hairline gradient bar on top */}
                <div className="h-2 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
                  {/* MAIN BOARDING PASS CORE (8 Cols) */}
                  <div className="lg:col-span-8 p-space-lg md:p-space-xl flex flex-col justify-between">
                    <div>
                      {/* Status & Reference Header */}
                      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
                        <div className="flex items-center gap-space-xs">
                          <span className={`inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            ticket.status === 'valid'
                              ? 'bg-secondary-container text-primary'
                              : ticket.status === 'used'
                              ? 'bg-surface-container text-on-surface-variant'
                              : 'bg-red-50 text-error'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              ticket.status === 'valid' ? 'bg-primary-container animate-pulse' : 'bg-outline'
                            }`}></span>
                            {ticket.status === 'valid' ? 'Confirmed & Valid' : ticket.status === 'used' ? 'Redeemed / Used' : 'Cancelled'}
                          </span>
                          <span className="inline-flex items-center px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold">
                            {ticket.access_point || 'Main Turnstile Entry'}
                          </span>
                        </div>

                        <div className="flex items-center gap-space-xs font-mono text-xs text-on-surface-variant bg-surface-container-low px-space-sm py-1 rounded-full">
                          <span className="material-symbols-outlined text-[16px] text-primary">confirmation_number</span>
                          <span>Ref: #{ticket.booking_reference}</span>
                        </div>
                      </div>

                      {/* Event Details & Imagery Row */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center mb-space-lg">
                        <div className="md:col-span-4 rounded-2xl overflow-hidden shadow-sm aspect-video md:aspect-[4/3] relative">
                          <img
                            src={ticket.banner_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'}
                            alt={ticket.event_title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
                          <span className="absolute bottom-2 left-2 px-space-xs py-0.5 rounded-full bg-white/90 backdrop-blur-md text-primary font-sans font-bold text-[10px]">
                            Live Pass
                          </span>
                        </div>

                        <div className="md:col-span-8">
                          <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
                            Live Experience
                          </span>
                          <h2 className="font-display font-bold text-headline-sm sm:text-headline-md text-on-surface tracking-tight mt-0.5 leading-snug">
                            {ticket.event_title}
                          </h2>
                          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-primary-container text-white font-sans text-xs font-semibold shadow-sm">
                            {ticket.tier_name}
                          </div>
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm py-space-md bg-surface-container-low rounded-2xl px-space-md border border-surface-container">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Date</span>
                          <span className="font-display font-bold text-sm text-on-surface block mt-0.5">{ticket.event_date}</span>
                          <span className="text-[11px] text-on-surface-variant">2026 Season</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Time</span>
                          <span className="font-display font-bold text-sm text-on-surface block mt-0.5">{ticket.start_time?.slice(0, 5) || '18:00'}</span>
                          <span className="text-[11px] text-on-surface-variant">{ticket.doors_open || 'Gates Open Early'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Access Point</span>
                          <span className="font-display font-bold text-sm text-primary block mt-0.5 truncate">{ticket.access_point || 'Gate B'}</span>
                          <span className="text-[11px] text-on-surface-variant">Turnstile Lane</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Attendee</span>
                          <span className="font-display font-bold text-sm text-on-surface block mt-0.5 truncate">{ticket.attendee_name}</span>
                          <span className="text-[11px] text-on-surface-variant">Govt ID Required</span>
                        </div>
                      </div>

                      {/* Venue Info Strip */}
                      <div className="flex items-center gap-space-xs mt-space-md text-on-surface-variant text-xs">
                        <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                        <span className="font-semibold text-on-surface">{ticket.venue_name}, {ticket.venue_city}</span>
                        <span>•</span>
                        <span className="truncate">{ticket.venue_address}</span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-space-lg mt-space-md flex flex-wrap items-center gap-space-xs border-t border-surface-container">
                      <button
                        type="button"
                        onClick={handleWalletAdd}
                        className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-full bg-primary-container text-white font-sans text-xs font-semibold hover:bg-primary transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">wallet</span>
                        <span>Add to Wallet</span>
                      </button>

                      <button
                        type="button"
                        disabled={downloadingId === ticket.id}
                        onClick={() => handleDownloadPdf(ticket)}
                        className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-sans text-xs font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {downloadingId === ticket.id ? 'hourglass_top' : 'download'}
                        </span>
                        <span>{downloadingId === ticket.id ? 'Generating...' : 'Download Pass (PDF)'}</span>
                      </button>

                      {activeTab === 'upcoming' && ticket.status === 'valid' && (
                        <button
                          type="button"
                          onClick={() => handleCancelTicket(ticket.id)}
                          className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-full bg-red-50 hover:bg-red-100 text-error font-sans text-xs font-semibold transition-all ml-auto"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          <span>Cancel & Refund</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PERFORATED STUB (4 Cols) */}
                  <div className="lg:col-span-4 bg-surface-container-low p-space-lg flex flex-col items-center justify-between border-t lg:border-t-0 lg:border-l border-dashed border-outline-variant relative">
                    {/* Perforation decorative notch dots (Desktop) */}
                    <div className="hidden lg:block absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border border-surface-container z-10"></div>
                    <div className="hidden lg:block absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-background border border-surface-container z-10"></div>

                    <div className="text-center w-full">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">
                        Gate Turnstile Check-in
                      </span>
                      <div className="font-mono text-xs font-bold text-primary truncate max-w-full px-2 py-0.5 rounded-md bg-surface-container inline-block">
                        {ticket.ticket_number}
                      </div>
                    </div>

                    {/* Live Rendered SVG QR Code */}
                    <div
                      onClick={() => setActiveQrModalTicket(ticket)}
                      className="bg-white p-3.5 rounded-2xl shadow-md border border-surface-container my-3 cursor-pointer hover:scale-105 transition-transform group"
                      title="Click to view full screen pass"
                    >
                      <QRCodeSVG
                        value={ticket.qr_code_token || 'EVENTORA-PASS'}
                        size={140}
                        level="H"
                        includeMargin={false}
                      />
                      <div className="text-center text-[10px] text-on-surface-variant font-semibold mt-1 group-hover:text-primary transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">fullscreen</span>
                        <span>Tap to enlarge</span>
                      </div>
                    </div>

                    <div className="text-center w-full space-y-1">
                      <div className="text-[11px] font-mono text-on-surface-variant truncate">
                        Token: {ticket.qr_code_token?.slice(0, 18)}...
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Turnstile Scanner Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enlarged QR Modal */}
      {activeQrModalTicket && (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setActiveQrModalTicket(null)}
      >
        <div
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
            <button
              onClick={() => setActiveQrModalTicket(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
              Admission Pass
            </span>
            <h3 className="font-display font-bold text-lg text-on-surface leading-snug mb-1">
              {activeQrModalTicket.event_title}
            </h3>
            <span className="text-xs text-on-surface-variant mb-4">
              {activeQrModalTicket.tier_name} • {activeQrModalTicket.attendee_name}
            </span>

            {/* High Res QR */}
            <div className="p-4 rounded-2xl border-2 border-primary-container shadow-inner mb-4">
              <QRCodeSVG
                value={activeQrModalTicket.qr_code_token}
                size={220}
                level="H"
              />
            </div>

            <p className="text-xs text-on-surface-variant mb-4 font-mono">
              {activeQrModalTicket.qr_code_token}
            </p>

            <button
              type="button"
              disabled={downloadingId === activeQrModalTicket.id}
              onClick={() => handleDownloadPdf(activeQrModalTicket)}
              className="w-full mb-3 py-2.5 px-4 rounded-full bg-primary-container text-white font-sans text-xs font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                {downloadingId === activeQrModalTicket.id ? 'hourglass_top' : 'download'}
              </span>
              <span>{downloadingId === activeQrModalTicket.id ? 'Generating PDF...' : 'Download Pass (PDF)'}</span>
            </button>

            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold flex items-center gap-2 w-full text-left">
              <span className="material-symbols-outlined text-[18px]">light_mode</span>
              <span>Turn phone brightness to max for instant scanner detection.</span>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Drawer */}
      {guidelinesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-lg text-on-surface">Check-in Guidelines</h3>
              <button onClick={() => setGuidelinesOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <ul className="text-xs text-on-surface-variant space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                <span><strong>Government ID:</strong> The attendee name on your pass must match your photo identification at the gate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">devices</span>
                <span><strong>No Printouts Needed:</strong> Present this screen or your Apple/Google Wallet pass directly at turnstiles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">lock_reset</span>
                <span><strong>One-Time Entry:</strong> Admission tokens are cryptographically marked used instantly upon scanning.</span>
              </li>
            </ul>
            <button
              onClick={() => setGuidelinesOpen(false)}
              className="w-full py-2.5 rounded-full bg-primary-container text-white text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
