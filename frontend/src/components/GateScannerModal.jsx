import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function GateScannerModal({ onClose, onScanComplete }) {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const scannerRef = useRef(null);

  useEffect(() => {
    if (mode === 'camera') {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          verifyTicket(decodedText);
          scanner.clear();
        },
        (error) => {
          // scanning frame errors are silent
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch {}
        }
      };
    }
  }, [mode]);

  const verifyTicket = async (token) => {
    if (!token || !token.trim()) return;
    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.post('/tickets/verify-qr/', {
        token: token.trim(),
        gate_name: 'Gate B - VIP Fast-lane Scanner',
      });

      setScanResult({
        success: true,
        status: res.data.status,
        message: res.data.message,
        ticket: res.data.ticket,
      });
      toast.success('🎉 Admission Approved!');
      if (onScanComplete) onScanComplete(res.data.ticket);
    } catch (err) {
      const data = err.response?.data || {};
      setScanResult({
        success: false,
        status: data.status || 'invalid',
        message: data.message || 'Ticket not recognized or gate admission rejected.',
        ticket: data.ticket,
      });
      toast.error(data.message || 'Verification rejected.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyTicket(manualToken);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-space-lg bg-gradient-to-r from-primary-container to-surface-tint text-white flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">Gate Check-in Scanner</h3>
              <p className="text-xs text-secondary-container">Turnstile admission verification system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-space-sm bg-surface-container-low border-b border-surface-container flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'camera'
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            Camera Scanner
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'manual'
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">pin</span>
            Manual Code Entry
          </button>
        </div>

        {/* Body */}
        <div className="p-space-lg flex flex-col gap-space-md">
          {mode === 'camera' ? (
            <div className="flex flex-col items-center">
              <div id="qr-reader-container" className="w-full max-w-xs rounded-2xl overflow-hidden shadow-inner"></div>
              <p className="text-xs text-on-surface-variant text-center mt-3">
                Align the attendee's digital pass or printed QR code within the target box.
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-on-surface">
                Enter QR Token or Ticket Number:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="e.g. EVT-PASS-NEON-HORIZON-2025-VIP-883491"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Validate'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="text-[11px] text-on-surface-variant">Try seeded test token:</span>
                <button
                  type="button"
                  onClick={() => setManualToken('EVT-PASS-NEON-HORIZON-2025-VIP-883491')}
                  className="text-[11px] text-primary font-mono underline hover:text-primary-container"
                >
                  EVT-PASS-NEON-HORIZON-2025-VIP-883491
                </button>
              </div>
            </form>
          )}

          {/* Validation Result Banner */}
          {scanResult && (
            <div
              className={`p-space-md rounded-2xl border transition-all animate-in zoom-in-95 ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : scanResult.status === 'already_used'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-[28px] shrink-0">
                  {scanResult.success ? 'check_circle' : scanResult.status === 'already_used' ? 'warning' : 'cancel'}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm">
                    {scanResult.success
                      ? 'ADMISSION GRANTED'
                      : scanResult.status === 'already_used'
                      ? 'ALREADY CHECKED IN'
                      : 'INVALID PASS'}
                  </h4>
                  <p className="text-xs mt-0.5">{scanResult.message}</p>

                  {scanResult.ticket && (
                    <div className="mt-2 pt-2 border-t border-current/20 text-xs space-y-1">
                      <div className="font-semibold">{scanResult.ticket.attendee_name}</div>
                      <div>{scanResult.ticket.event_title}</div>
                      <div className="font-mono text-[11px] opacity-80">
                        {scanResult.ticket.tier_name} • {scanResult.ticket.access_point}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
