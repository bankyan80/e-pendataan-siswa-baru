import { useState, type FormEvent } from 'react';
import { X, LogIn, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../types';

interface LoginModalProps {
  role: UserRole;
  onSuccess: (pin: string) => void;
  onCancel: () => void;
}

function roleLabel(role: UserRole): string {
  switch (role) {
    case 'ADMIN_DINAS': return 'Admin Dinas';
    case 'KEPALA_SEKOLAH': return 'Kepala Sekolah';
    case 'OPERATOR_SEKOLAH': return 'Operator Sekolah';
    default: return role;
  }
}

export default function LoginModal({ role, onSuccess, onCancel }: LoginModalProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin.trim()) {
      setError('Masukkan PIN.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess(pin.trim());
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-700">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 text-slate-300 hover:bg-slate-600 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Masukkan PIN</h2>
              <p className="text-[11px] text-slate-400 font-medium">Akses sebagai {roleLabel(role)}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">PIN</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan PIN"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/80 border border-slate-600 text-white text-sm font-bold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all tracking-widest text-center text-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          <p className="text-[10px] text-slate-500 font-medium text-center leading-relaxed">
            {role === 'ADMIN_DINAS'
              ? <>PIN Admin Dinas: <span className="text-slate-300 font-bold">637238</span></>
              : <>Masukkan NPSN sekolah sebagai PIN. Contoh: <span className="text-slate-300 font-bold">20215216</span></>}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Masuk
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
