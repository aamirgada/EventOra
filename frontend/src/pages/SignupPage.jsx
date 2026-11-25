import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('attendee');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        phone: phone || undefined,
      });
      toast.success('Account created successfully! Welcome to Eventora.');
      navigate(role === 'organizer' ? '/organizer' : '/');
    } catch (err) {
      const errors = err.response?.data;
      let msg = 'Registration failed. Please check your information.';
      if (errors) {
        if (typeof errors === 'string') msg = errors;
        else {
          // Collect all field errors
          const fieldMsgs = Object.entries(errors)
            .map(([field, val]) => {
              const text = Array.isArray(val) ? val.join(', ') : String(val);
              return field === 'non_field_errors' ? text : `${field}: ${text}`;
            })
            .join('\n');
          if (fieldMsgs) msg = fieldMsgs;
        }
      }
      toast.error(msg, { duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="pointer-events-none absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-secondary-container/40 blur-3xl -z-10 animate-float"></div>
      <div className="pointer-events-none absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl -z-10 animate-pulse-glow"></div>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-surface-container animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-white mb-3 shadow-md">
            <span className="material-symbols-outlined text-[26px]">celebration</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5">
            Join the community discovering world-class festivals, concerts & summits
          </p>
        </div>

        {/* Role Picker */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2 text-center">
            I am joining as:
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#f8f6fc] border border-surface-container">
            <button
              type="button"
              onClick={() => setRole('attendee')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'attendee'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <span>👤 Attendee</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'organizer'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <span>🎪 Event Organizer</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/30 border border-transparent focus-within:border-primary-container/30 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px]">person</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/30 border border-transparent focus-within:border-primary-container/30 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/30 border border-transparent focus-within:border-primary-container/30 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px]">phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/30 border border-transparent focus-within:border-primary-container/30 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-outline hover:text-on-surface transition-colors shrink-0"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1 ml-1">
              Any password with 6+ characters works (letters, numbers, symbols all OK)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-primary-container text-white font-sans font-bold text-sm hover:bg-primary transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-surface-container text-center">
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
