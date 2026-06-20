import { Users, GraduationCap, TrendingUp, School } from 'lucide-react';
import { SiswaBaru, AlumniSD, UserRole } from '../types';
import MetricCard from './MetricCard';
import DashboardCharts from './DashboardCharts';

interface DashboardPageProps {
  siswaBaru: SiswaBaru[];
  alumni: AlumniSD[];
  activeSchool: string;
  currentRole: UserRole;
  kpis: {
    totalNew: number;
    totalTK: number;
    totalKB: number;
    totalSD: number;
    domisili: number;
    afirmasi: number;
    mutasi: number;
    alumnCount: number;
    continuing: number;
    notContinuing: number;
    transitionRate: number;
  };
}

export default function DashboardPage(props: DashboardPageProps) {
  const { siswaBaru, alumni, activeSchool, currentRole, kpis } = props;

  const showSD = currentRole !== 'PENILIK';
  const showKB = currentRole !== 'PENGAWAS_SEKOLAH';
  const showTransisi = currentRole !== 'PENILIK';
  const showJalurSD = currentRole !== 'PENILIK';

  return (
    <div className="space-y-6">

      {/* Top Summary Banner */}
      <div className="p-5 bg-white/20 backdrop-blur-md rounded-3xl text-white shadow-lg border border-white/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-black tracking-normal text-white">PPDB Real-Time Monitoring Panel</h2>
          <p className="text-xs text-white/85 leading-relaxed max-w-lg font-medium">
            Sistem validasi terintegrasi untuk pendaftar baru SD/TK/KB, alumni lanjut sekolah, serta rekapitulasi tim kerja sub-dinas kecamatan.
          </p>
        </div>
        
      </div>

      {/* Master KPI Row - Dynamically filters for active context */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          id="kpi_total"
          title="Total Siswa Baru"
          value={kpis.totalNew}
          subtitle={activeSchool ? 'Khusus sekolah aktif' : currentRole === 'PENGAWAS_SEKOLAH' ? 'SD + TK' : currentRole === 'PENILIK' ? 'KB' : 'KB + TK + SD'}
          icon={Users}
          color="blue"
        />
        {showSD && (
        <MetricCard
          id="kpi_sd"
          title="SD (Sekolah Dasar)"
          value={kpis.totalSD}
          subtitle="Tingkat Dasmen"
          icon={School}
          color="emerald"
        />
        )}
        {(showSD || showKB) && (
        <MetricCard
          id="kpi_tk_kb"
          title={currentRole === 'PENGAWAS_SEKOLAH' ? 'TK' : currentRole === 'PENILIK' ? 'KB' : 'TK & KB (PAUD)'}
          value={currentRole === 'PENGAWAS_SEKOLAH' ? kpis.totalTK : currentRole === 'PENILIK' ? kpis.totalKB : kpis.totalTK + kpis.totalKB}
          subtitle={currentRole === 'PENGAWAS_SEKOLAH' ? `TK: ${kpis.totalTK}` : currentRole === 'PENILIK' ? `KB: ${kpis.totalKB}` : `TK: ${kpis.totalTK} | KB: ${kpis.totalKB}`}
          icon={GraduationCap}
          color="indigo"
        />
        )}
        {showTransisi && (
        <MetricCard
          id="kpi_transisi"
          title="Transisi Alumni SD"
          value={`${kpis.transitionRate}%`}
          subtitle={`${kpis.continuing} dari ${kpis.alumnCount} siswa Melanjutkan`}
          icon={TrendingUp}
          color="amber"
        />
        )}
      </div>

      {/* SD Specific Entry Path Alerts (Jalur alerts) */}
      {showJalurSD && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white/15 backdrop-blur-md rounded-3xl border border-white/20 shadow-md">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-black text-white/60 tracking-wider">Jalur Domisili / Zonasi</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-amber-300">{kpis.domisili}</span>
            <span className="text-xs text-white/75 font-bold">Siswa Baru SD</span>
          </div>
          <p className="text-[10px] text-white/60 italic leading-relaxed">Kapasitas berlandaskan KK & jarak radius zonasi terdekat.</p>
        </div>

        <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-5">
          <span className="text-[10px] uppercase font-black text-white/60 tracking-wider">Jalur Afirmasi (KIP/Jamkes)</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-indigo-300">{kpis.afirmasi}</span>
            <span className="text-xs text-white/75 font-bold">Siswa Baru SD</span>
          </div>
          <p className="text-[10px] text-white/60 italic leading-relaxed">Proteksi jaminan sosial & pembebasan operasional khusus.</p>
        </div>

        <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-5">
          <span className="text-[10px] uppercase font-black text-white/60 tracking-wider">Jalur Mutasi Tugas Orang Tua</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-blue-300">{kpis.mutasi}</span>
            <span className="text-xs text-white/75 font-bold">Siswa Baru SD</span>
          </div>
          <p className="text-[10px] text-white/60 italic leading-relaxed">Diperuntukkan anak mutasi dinas/kerja fungsional luar daerah.</p>
        </div>
      </div>
      )}

      {/* Charts Section using Recharts */}
      <div className="bg-transparent p-0 rounded-2xl">
        <DashboardCharts id="charts_dashboard" siswaBaru={siswaBaru} alumni={alumni} currentRole={currentRole} activeSchool={activeSchool} />
      </div>

    </div>
  );
}
