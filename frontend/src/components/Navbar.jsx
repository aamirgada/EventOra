import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import api from '../services/api';

export default function Navbar() {
  const { user, isOrganizer, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const notifsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setNotifsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([]);

  // Fetch or generate user-specific notifications based on actual account state
  const loadUserNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const res = await api.get('/tickets/my/?tab=upcoming');
      const tickets = res.data.results || res.data || [];

      const dynamicNotifs = [];

      // 1. If user has tickets, show real ticket notifications
      tickets.forEach((ticket, idx) => {
        dynamicNotifs.push({
          id: `tkt-${ticket.id || idx}`,
          title: 'Admission Pass Ready',
          message: `Your pass for "${ticket.event_title || 'Upcoming Event'}" (${ticket.tier_name || 'General'}) is active and ready for check-in.`,
          time: 'Active Pass',
          unread: true,
          icon: 'confirmation_number',
          type: 'success',
          link: '/my-tickets',
        });
      });

      // 2. If user has no tickets booked yet, provide a welcome notification
      if (dynamicNotifs.length === 0) {
        dynamicNotifs.push({
          id: 'welcome-1',
          title: `Welcome to Eventora, ${user.full_name?.split(' ')[0] || 'Explorer'}!`,
          message: 'Explore trending live concerts, tech summits, and cultural spectacles to secure your first digital pass.',
          time: 'Just now',
          unread: true,
          icon: 'auto_awesome',
          type: 'info',
          link: '/explore',
        });
      }

      setNotifications(dynamicNotifs);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadUserNotifications();

    const handleTicketBooked = () => {
      loadUserNotifications();
    };

    window.addEventListener('eventora_ticket_booked', handleTicketBooked);
    return () => {
      window.removeEventListener('eventora_ticket_booked', handleTicketBooked);
    };
  }, [user, location.pathname]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchOpen(false);
      setSearchKeyword('');
    }
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'px-4 py-2 transition-all bg-primary-container text-white font-semibold rounded-full text-xs sm:text-sm shadow-sm'
      : 'px-4 py-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-xs sm:text-sm font-medium';

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-[0_1px_4px_rgba(26,0,105,0.06)] border-b border-surface-container">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-white">
              <span className="material-symbols-outlined text-[20px]">local_activity</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-primary leading-tight">
                Eventora
              </span>
              <span className="text-[11px] text-on-surface-variant hidden md:block leading-none">
                Discover · Book · Experience
              </span>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low px-2 py-1.5 rounded-full border border-surface-container">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore Events
            </NavLink>
            <NavLink to="/explore?tab=categories" className={navLinkClass}>
              Categories
            </NavLink>
            <NavLink to="/my-tickets" className={navLinkClass}>
              My Tickets
            </NavLink>
            {isOrganizer && (
              <NavLink to="/organizer" className={navLinkClass}>
                Organizer Studio
              </NavLink>
            )}
          </nav>

          {/* Utilities & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              title="Search Events"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Favorites Icon with Counter */}
            <Link
              to="/explore?filter=favorites"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              title="Saved Events"
            >
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              {favoritesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-container text-white font-sans text-[10px] font-bold flex items-center justify-center leading-none animate-pulse">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Notifications with interactive dropdown */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => {
                  setNotifsOpen(!notifsOpen);
                  if (profileOpen) setProfileOpen(false);
                }}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  notifsOpen
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                type="button"
                title="Notifications"
                aria-label="View notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifsOpen && (
                <div
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Panel Header */}
                  <div className="p-4 bg-gradient-to-r from-primary-container to-surface-tint text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">notifications</span>
                      <h4 className="font-display font-bold text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] text-secondary-container hover:text-white font-semibold transition-colors underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Panel Body */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-surface-container">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[36px] text-outline mb-1">notifications_off</span>
                        <p className="text-xs font-semibold">You're all caught up!</p>
                        <p className="text-[11px] text-outline mt-0.5">No new notifications at this time.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 flex items-start gap-3 hover:bg-surface-container-low transition-colors ${
                            notif.unread ? 'bg-primary-container/5' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              notif.type === 'success'
                                ? 'bg-emerald-100 text-emerald-700'
                                : notif.type === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-primary-fixed text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{notif.icon}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-sans font-bold text-xs text-on-surface truncate">
                                {notif.title}
                              </h5>
                              <span className="text-[10px] text-on-surface-variant shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <Link
                                to={notif.link}
                                onClick={() => setNotifsOpen(false)}
                                className="text-[11px] text-primary font-bold hover:underline flex items-center gap-0.5"
                              >
                                <span>View details</span>
                                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeNotification(notif.id)}
                                className="text-[11px] text-outline hover:text-error transition-colors"
                                title="Dismiss notification"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Panel Footer */}
                  {notifications.length > 0 && (
                    <div className="p-2.5 bg-surface-container-low border-t border-surface-container flex items-center justify-between px-4">
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Showing {notifications.length} recent alerts
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotifications([])}
                        className="text-[11px] text-error font-semibold hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action CTA */}
            {isOrganizer ? (
              <Link
                to="/organizer?action=create"
                className="hidden xl:inline-flex items-center justify-center px-space-lg py-space-xs rounded-full bg-primary-container text-white font-sans font-semibold text-label-md hover:bg-primary transition-all shadow-md active:scale-95"
              >
                + Create Event
              </Link>
            ) : !user ? (
              <Link
                to="/explore"
                className="hidden xl:inline-flex items-center justify-center px-space-lg py-space-xs rounded-full bg-primary-container text-white font-sans font-semibold text-label-md hover:bg-primary transition-all shadow-md active:scale-95"
              >
                Get Started
              </Link>
            ) : null}

            {/* User Profile & Demo Switcher or Sign In / Sign Up */}
            {user ? (
              <div className="relative pl-space-2xs" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center rounded-full p-0.5 hover:ring-2 hover:ring-secondary-container transition-all focus:outline-none"
                  type="button"
                >
                  <img
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                    }
                  />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 mt-3 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-space-md z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-container">
                      <img
                        alt="Profile"
                        className="w-11 h-11 rounded-full object-cover"
                        src={
                          user?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                        }
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-sans font-bold text-on-surface truncate">
                          {user?.full_name || 'Sarah Lin'}
                        </span>
                        <span className="text-xs text-on-surface-variant truncate">
                          {user?.email || 'attendee@eventora.com'}
                        </span>
                        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-primary uppercase tracking-wider w-fit">
                          {user?.role || 'Attendee'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-space-xs flex flex-col gap-1">
                      <Link
                        to="/my-tickets"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl text-sm text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">confirmation_number</span>
                        My Tickets & Passes
                      </Link>
                      {isOrganizer && (
                        <Link
                          to="/organizer"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl text-sm text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary">dashboard</span>
                          Organizer Studio
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate('/');
                        }}
                        className="flex items-center gap-2 p-2 rounded-xl text-sm text-error hover:bg-error-container/40 transition-colors w-full text-left font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-on-surface hover:text-primary hover:bg-surface-container transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full bg-primary-container text-white text-xs font-bold hover:bg-primary transition-all shadow-sm active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Input Row */}
        {searchOpen && (
          <div className="bg-surface-container-lowest border-t border-surface-container px-4 py-3 shadow-md animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search events, festivals, tech summits, or venues..."
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
