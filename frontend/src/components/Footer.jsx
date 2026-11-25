import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing to Eventora Curations!');
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container text-on-surface-variant pt-space-3xl pb-space-2xl">
      <div className="max-w-[1280px] mx-auto px-margin-sm md:px-margin lg:px-margin-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl mb-space-2xl">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <Link to="/" className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-primary-container to-secondary-container flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-[24px]">local_activity</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-headline-sm tracking-tight text-primary font-bold leading-none">
                  Eventora
                </span>
                <span className="font-sans text-label-sm text-on-surface-variant">
                  Discover. Book. Experience.
                </span>
              </div>
            </Link>
            <p className="font-sans text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
              The premier platform connecting curious minds with spellbinding music festivals, 
              intimate culinary masterclasses, and leading-edge technology summits worldwide.
            </p>
            <div className="flex items-center gap-space-xs mt-space-xs">
              <a href="#" className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">share</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">rss_feed</span>
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-display text-label-lg font-bold text-on-surface">Explore</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/explore" className="hover:text-primary transition-colors">All Events</Link></li>
              <li><Link to="/explore?timeframe=this-weekend" className="hover:text-primary transition-colors">This Weekend</Link></li>
              <li><Link to="/explore?featured=true" className="hover:text-primary transition-colors">Featured Curations</Link></li>
              <li><Link to="/my-tickets" className="hover:text-primary transition-colors">My Ticket Vault</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-display text-label-lg font-bold text-on-surface">Categories</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/explore?category=music" className="hover:text-primary transition-colors">Live Music & Concerts</Link></li>
              <li><Link to="/explore?category=tech" className="hover:text-primary transition-colors">Technology & AI Summits</Link></li>
              <li><Link to="/explore?category=food" className="hover:text-primary transition-colors">Culinary & Wine Galas</Link></li>
              <li><Link to="/explore?category=arts" className="hover:text-primary transition-colors">Arts & Immersive Culture</Link></li>
              <li><Link to="/explore?category=workshop" className="hover:text-primary transition-colors">Workshops & Labs</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-display text-label-lg font-bold text-on-surface">Stay Inspired</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Curated drop notifications, secret stage announcements, and early bird access directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary-container text-white font-sans text-xs font-semibold hover:bg-primary transition-colors shadow-sm"
              >
                Join Eventora Digest
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-space-lg border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm text-xs text-on-surface-variant">
          <div className="flex items-center gap-1">
            <span>© 2026 Eventora Technologies Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-space-md">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Terms of Experience</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Verified Ticket Guarantee</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
