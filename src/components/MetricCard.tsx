/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  color: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'teal';
  onClick?: () => void;
}

export default function MetricCard({
  id,
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color,
  onClick
}: MetricCardProps) {
  const colorMap = {
    blue: {
      bg: 'bg-white/20 backdrop-blur-md',
      iconBg: 'bg-blue-500/30 text-blue-200 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      border: 'border-white/30'
    },
    indigo: {
      bg: 'bg-white/20 backdrop-blur-md',
      iconBg: 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]',
      border: 'border-white/30'
    },
    emerald: {
      bg: 'bg-white/20 backdrop-blur-md',
      iconBg: 'bg-emerald-500/30 text-green-200 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      border: 'border-white/30'
    },
    amber: {
      bg: 'bg-white/20 backdrop-blur-md',
      iconBg: 'bg-amber-500/30 text-amber-200 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      border: 'border-white/30'
    },
    rose: {
      bg: 'bg-white/20 backdrop-blur-md',
      iconBg: 'bg-rose-500/30 text-rose-200 border border-rose-400/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      border: 'border-white/30'
    },
    teal: {
      bg: 'bg-white/20 backdrop-blur-md',
      iconBg: 'bg-teal-500/30 text-teal-200 border border-teal-400/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]',
      border: 'border-white/30'
    }
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-5 rounded-[2rem] border ${colors.border} ${colors.bg} flex flex-col justify-between transition-all duration-300 shadow-xl ${
        onClick ? 'cursor-pointer hover:bg-white/35 active:scale-95' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-white/70 text-xs font-semibold uppercase tracking-wider block">{title}</span>
          <span className="text-3xl font-black text-white font-sans tracking-tight">{value}</span>
        </div>
        <div className={`p-2.5 rounded-2xl ${colors.iconBg} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-white/65">
          {subtitle && <span className="truncate max-w-[150px] font-medium">{subtitle}</span>}
          {trend && (
            <span className={`font-bold px-2 py-0.5 rounded-lg ${trend.isPositive ? 'bg-green-400/20 text-green-300' : 'bg-rose-400/20 text-rose-300'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
