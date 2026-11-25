import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to Eventora!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid email or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-secondary-container/40 blur-3xl -z-10 animate-float"></div>
      <div className="pointer-events-none absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl -z-10 animate-pulse-glow"></div>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-surface-container animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-white mb-3 shadow-md">
            <span className="material-symbols-outlined text-[26px]">local_activity</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Sign In to Eventora
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5">
            Access your admission passes, favorite events, and live organizers
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Email Address
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => toast('Password reset coming soon!', { icon: '🔐' })}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f8f6fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-container/30 border border-transparent focus-within:border-primary-container/30 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-primary-container text-white font-sans font-bold text-sm hover:bg-primary transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-surface-container text-center">
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Don't have an Eventora account?{' '}
            <Link to="/signup" className="font-bold text-primary hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
