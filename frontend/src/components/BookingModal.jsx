import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function BookingModal({ event, tier, quantity, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attendeeName, setAttendeeName] = useState(user?.full_name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [processing, setProcessing] = useState(false);

  const unitPrice = parseFloat(tier?.price || 0);
  const subtotal = unitPrice * quantity;
  const serviceFee = subtotal * 0.05; // 5% fee
  const total = subtotal + serviceFee;

  const formatINR = (n) =>
    '\u20B9' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const payload = {
        items: [
          {
            ticket_tier_id: tier.id,
            quantity: quantity,
            attendee_name: attendeeName,
            attendee_email: attendeeEmail,
          },
        ],
        payment_method: paymentMethod,
        discount_amount: 0.00,
      };

      const res = await api.post('/bookings/create/', payload);
      window.dispatchEvent(new Event('eventora_ticket_booked'));
      toast.success(
        `\uD83C\uDF89 Booking Confirmed! Ref: #${res.data.booking_reference}. Your digital ticket pass is ready.`,
        { duration: 5000 }
      );
      if (onSuccess) onSuccess(res.data);
      onClose();
      navigate('/my-tickets');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to complete booking. Please try again.';
      toast.error(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-space-lg bg-gradient-to-r from-primary-container via-primary to-primary-container text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-container block">
              Checkout &amp; Ticket Issuance
            </span>
            <h3 className="font-display font-bold text-headline-sm leading-tight mt-0.5">
              Confirm Your Admission
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleConfirmBooking} className="p-space-lg flex-1 overflow-y-auto flex flex-col gap-space-md">
          {/* Event Quick Summary */}
          <div className="p-space-sm bg-surface-container-low rounded-2xl flex items-center gap-space-sm">
            <img
              src={event.banner_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'}
              alt={event.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-display font-bold text-sm text-on-surface truncate">{event.title}</h4>
              <p className="text-xs text-on-surface-variant truncate">{event.venue?.name || 'Mumbai'}, {event.event_date}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-primary font-semibold">
                <span>{quantity}x {tier?.name}</span>
                <span>•</span>
                <span>{'\u20B9'}{Number(unitPrice).toLocaleString('en-IN')} each</span>
              </div>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Attendee Information</span>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium">Primary Attendee Name</label>
              <input
                type="text"
                required
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder="Full name as shown on ID"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium">Delivery Email (Ticket &amp; Pass updates)</label>
              <input
                type="email"
                required
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">Payment Method</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Credit Card')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                  paymentMethod.includes('Credit Card')
                    ? 'border-primary-container bg-primary-container/10 font-bold text-primary'
                    : 'border-surface-container bg-surface-container-low text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-primary">credit_card</span>
                <span className="text-xs">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Apple Pay / Wallet')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                  paymentMethod.includes('Apple Pay')
                    ? 'border-primary-container bg-primary-container/10 font-bold text-primary'
                    : 'border-surface-container bg-surface-container-low text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-primary">wallet</span>
                <span className="text-xs">UPI / Google Pay</span>
              </button>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-space-sm bg-surface-container-low rounded-2xl space-y-1.5 text-xs text-on-surface-variant">
            <div className="flex justify-between">
              <span>Subtotal ({quantity} tickets)</span>
              <span className="font-semibold text-on-surface">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee &amp; Security</span>
              <span className="font-semibold text-on-surface">{formatINR(serviceFee)}</span>
            </div>
            <div className="pt-2 border-t border-surface-container flex justify-between text-sm font-bold text-primary">
              <span>Total Due</span>
              <span className="font-display text-base">{formatINR(total)}</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 rounded-full bg-primary-container hover:bg-primary text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  <span>Pay &amp; Issue {quantity} Digital {quantity > 1 ? 'Tickets' : 'Ticket'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
