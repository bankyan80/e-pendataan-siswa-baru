import { useState } from 'react';
import { AiWarning, validateData } from '../services/ai';
import { AlertTriangle, CheckCircle, Info, Loader2, Sparkles, X } from 'lucide-react';

interface AiValidationProps {
  data: Record<string, unknown>;
  context: 'siswa' | 'alumni';
  onValidate?: (isValid: boolean) => void;
  autoValidate?: boolean;
}

export default function AiValidation({ data, context, onValidate, autoValidate }: AiValidationProps) {
  const [warnings, setWarnings] = useState<AiWarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    setShow(true);
    try {
      const result = await validateData(data, context);
      setWarnings(result.warnings);
      onValidate?.(result.isValid);
    } catch {
      setWarnings([{ type: 'warning', message: 'Gagal menghubungi AI. Coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  };

  const iconMap = {
    error: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  if (!show) {
    return (
      <button
        type="button"
        onClick={handleValidate}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        Cek AI
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleValidate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Memeriksa...' : 'Cek Ulang'}
        </button>
        <button
          type="button"
          onClick={() => { setShow(false); setWarnings([]); }}
          className="p-1 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {warnings.length === 0 && !loading && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-emerald-700">Data terlihat baik. Tidak ditemukan masalah.</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-xl border ${
              w.type === 'error' ? 'bg-red-50 border-red-200' : w.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
            }`}>
              {iconMap[w.type]}
              <div className="space-y-0.5">
                {w.field && <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">{w.field}</span>}
                <p className={`text-xs font-medium ${
                  w.type === 'error' ? 'text-red-700' : w.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
                }`}>{w.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
