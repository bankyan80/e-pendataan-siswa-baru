/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityLog } from '../types';
import { Clock, CheckCircle2, UserPlus, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ActivityFeedProps {
  id: string;
  logs: ActivityLog[];
}

export default function ActivityFeed({ id, logs }: ActivityFeedProps) {
  
  // Format standard timestamps nicely
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch {
      return 'Baru Saja';
    }
  };

  const getIcon = (type: string, action: string) => {
    if (action.includes('Setuju') || action.includes('Verifikasi')) {
      return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (action.includes('Daftar') || action.includes('Tambah')) {
      return <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    if (action.includes('Ulasan') || action.includes('Periksa')) {
      return <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    return <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'warning':
        return 'bg-amber-500/20 text-amber-100 border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'danger':
        return 'bg-rose-500/20 text-rose-100 border-rose-400/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      default:
        return 'bg-blue-500/20 text-blue-100 border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
    }
  };

  return (
    <div id={id} className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/15 pb-2">
        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Aktivitas Pendataan Real-Time
        </h4>
        <span className="text-[10px] font-bold text-white bg-green-500/30 border border-green-400/40 px-2.5 py-0.5 rounded-full shadow-sm">
          Live Sync
        </span>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 bg-white/15 dark:bg-black/20 rounded-2xl border border-white/20 transition hover:bg-white/25 shadow-md flex gap-3 items-start animate-fade-in"
          >
            <div className={`p-1.5 rounded-xl ${getColorClass(log.type)} border flex-shrink-0 mt-0.5`}>
              {getIcon(log.type, log.action)}
            </div>
            
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {log.actorName}
                </span>
                <span className="text-[10px] font-semibold text-white/50 flex-shrink-0">
                  {formatTime(log.timestamp)}
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                {log.detail}
              </p>
              
              {/* Actor Role Tag */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/20 text-white border border-white/10">
                  {log.role === 'ADMIN_DINAS'
                    ? 'Tim Kerja Dinas'
                    : log.role === 'KEPALA_SEKOLAH'
                    ? 'Kepsek'
                    : log.role === 'OPERATOR_SEKOLAH'
                    ? 'Operator'
                    : log.role === 'PENILIK'
                    ? 'Penilik'
                    : 'Pengawas'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="py-8 text-center text-xs text-white/50 italic">
            Belum ada aktivitas pendataan.
          </div>
        )}
      </div>
    </div>
  );
}
