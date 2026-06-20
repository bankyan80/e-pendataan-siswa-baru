/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiswaBaru, AlumniSD } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardChartsProps {
  id: string;
  siswaBaru: SiswaBaru[];
  alumni: AlumniSD[];
  currentRole: string;
}

export default function DashboardCharts({ id, siswaBaru, alumni, currentRole }: DashboardChartsProps) {
  const isPenilik = currentRole === 'PENILIK';
  const isPengawas = currentRole === 'PENGAWAS_SEKOLAH';
  
  // 1. Calculate Pendaftar bY Jenjang
  const countJenjang = (jenjang: string) => {
    return siswaBaru
      .filter(s => s.jenjang === jenjang)
      .reduce((acc, s) => {
        if (s.jenjang === 'SD') {
          return acc + (s.lakiLaki || 0) + (s.perempuan || 0);
        } else {
          return acc + (s.kelompokA || 0) + (s.kelompokB || 0);
        }
      }, 0);
  };
  
  const dataJenjang = isPenilik
    ? [{ name: 'KB (Kelompok Bermain)', value: countJenjang('KB'), fill: '#9333ea' }]
    : isPengawas
    ? [
        { name: 'TK (Taman Kanak-Kanak)', value: countJenjang('TK'), fill: '#3b82f6' },
        { name: 'SD (Sekolah Dasar)', value: countJenjang('SD'), fill: '#10b981' },
      ]
    : [
        { name: 'KB (Kelompok Bermain)', value: countJenjang('KB'), fill: '#9333ea' },
        { name: 'TK (Taman Kanak-Kanak)', value: countJenjang('TK'), fill: '#3b82f6' },
        { name: 'SD (Sekolah Dasar)', value: countJenjang('SD'), fill: '#10b981' },
      ];

  // 2. Calculate Jalur Pendaftaran (SD Only!)
  const countJalur = (jalur: string) => {
    return siswaBaru
      .filter(s => s.jenjang === 'SD')
      .reduce((acc, s) => {
        if (jalur === 'Domisili') return acc + (s.domisili || 0);
        if (jalur === 'Afirmasi') return acc + (s.afirmasi || 0);
        if (jalur === 'Mutasi') return acc + (s.mutasi || 0);
        if (jalur === 'Umum') return acc + (s.umum || 0);
        return acc;
      }, 0);
  };

  const dataJalur = [
    { name: 'Domisili / Zonasi', pendaftar: countJalur('Domisili'), fill: '#fbbf24' }, // Amber
    { name: 'Afirmasi / KIP', pendaftar: countJalur('Afirmasi'), fill: '#f43f5e' }, // Rose
    { name: 'Mutasi Orang Tua', pendaftar: countJalur('Mutasi'), fill: '#6366f1' }, // Indigo
    { name: 'Umum / Lainnya', pendaftar: countJalur('Umum'), fill: '#14b8a6' }, // Teal
  ];

  // 3. Calculate Alumni SD Transition (Melanjutkan vs Tidak Melanjutkan)
  const countAlumniStatus = (status: 'Melanjutkan' | 'Tidak Melanjutkan') => {
    return alumni.filter(a => a.status === status).length;
  };
  const totalAlumni = alumni.length;
  const melanjutkan = countAlumniStatus('Melanjutkan');
  const tidakMelanjutkan = countAlumniStatus('Tidak Melanjutkan');

  const dataAlumni = [
    { name: 'Melanjutkan ke SMP/MTs', value: melanjutkan, percentage: totalAlumni > 0 ? Math.round((melanjutkan / totalAlumni) * 100) : 0 },
    { name: 'Tidak Melanjutkan', value: tidakMelanjutkan, percentage: totalAlumni > 0 ? Math.round((tidakMelanjutkan / totalAlumni) * 100) : 0 }
  ];

  const COLORS_ALUMNI = ['#10b981', '#f43f5e']; // Emerald for Melanjutkan, Rose for Tidak Melanjutkan

  // Chart Tooltips Custom Styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl px-4 py-2.5 border border-white/20 rounded-2xl shadow-2xl text-xs text-white">
          <p className="font-bold text-white mb-1">{label || payload[0].name}</p>
          <p className="text-yellow-300 font-extrabold">
            Jumlah: <span>{payload[0].value} Siswa</span>
          </p>
          {payload[0].payload.percentage !== undefined && (
            <p className="text-white/60 text-[11px] mt-0.5">
              Persentase: {payload[0].payload.percentage}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Chart 1: Pendaftar per Jenjang */}
      <div className="p-5 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex flex-col justify-between shadow-lg">
        <div className="space-y-1 mb-3">
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Metrik</span>
          <h4 className="text-sm font-black text-white">
            Pendaftar Baru per Jenjang
          </h4>
        </div>
        <div className="h-60 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataJenjang}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {dataJenjang.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Customized Legend */}
        <div className="space-y-1.5 mt-3 border-t border-white/10 pt-3">
          {dataJenjang.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span>{item.name}</span>
              </div>
              <span className="font-extrabold text-white">{item.value} Siswa</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Jalur Pendaftaran SD */}
      {!isPenilik && (
      <div className="p-5 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex flex-col justify-between shadow-lg">
        <div className="space-y-1 mb-3">
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Zonasi & Regulasi</span>
          <h4 className="text-sm font-black text-white">
            Jalur Pendaftaran Siswa Baru (SD)
          </h4>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataJalur} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }} />
              <Bar dataKey="pendaftar" radius={[6, 6, 0, 0]}>
                {dataJalur.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 mt-3 border-t border-white/10 pt-3">
          {dataJalur.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="truncate max-w-[150px]">{item.name}</span>
              </div>
              <span className="font-extrabold text-white">{item.pendaftar} Siswa</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Chart 3: Alumni SD Transition Rate */}
      {!isPenilik && (
      <div className="p-5 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex flex-col justify-between shadow-lg">
        <div className="space-y-1 mb-3">
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Pemantauan Wajib Belajar</span>
          <h4 className="text-sm font-black text-white">
            Angka Transisi Keberlanjutan Alumni SD
          </h4>
        </div>
        <div className="h-60 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataAlumni}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={75}
                dataKey="value"
              >
                {dataAlumni.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_ALUMNI[index % COLORS_ALUMNI.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Transition Stats Summary */}
        <div className="space-y-1.5 mt-3 border-t border-white/10 pt-3">
          {dataAlumni.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS_ALUMNI[idx] }} />
                <span>{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-white">{item.value} Siswa</span>
                <span className="text-white/50 text-[10px] ml-1.5 font-bold">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

    </div>
  );
}
