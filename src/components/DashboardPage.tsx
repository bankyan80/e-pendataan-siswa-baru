import { Users, GraduationCap, TrendingUp, School, Download, FileSpreadsheet } from 'lucide-react';
import { SiswaBaru, AlumniSD, ActivityLog } from '../types';
import MetricCard from './MetricCard';
import ActivityFeed from './ActivityFeed';
import DashboardCharts from './DashboardCharts';

interface DashboardPageProps {
  siswaBaru: SiswaBaru[];
  alumni: AlumniSD[];
  logs: ActivityLog[];
  activeSchool: string;
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
  onExportSiswa: () => void;
  onExportAlumni: () => void;
}

export default function DashboardPage(props: DashboardPageProps) {
  const { siswaBaru, alumni, logs, activeSchool, kpis, onExportSiswa, onExportAlumni } = props;

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
        {/* Excel Quick-Export Cluster */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExportSiswa}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 rounded-2xl text-xs font-bold shadow-lg hover:bg-white/95 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-700" />
            Ekspor Excel Pendaftar
          </button>
          <button
            onClick={onExportAlumni}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500/80 hover:bg-green-600 text-white rounded-2xl text-xs font-bold shadow-lg active:scale-95 border border-white/25 transition-all backdrop-blur-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ekspor Excel Alumni
          </button>
        </div>
      </div>

      {/* Master KPI Row - Dynamically filters for active context */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          id="kpi_total"
          title="Total Siswa Baru"
          value={kpis.totalNew}
          subtitle={activeSchool ? 'Khusus sekolah aktif' : 'KB + TK + SD'}
          icon={Users}
          color="blue"
        />
        <MetricCard
          id="kpi_sd"
          title="SD (Sekolah Dasar)"
          value={kpis.totalSD}
          subtitle="Tingkat Dasmen"
          icon={School}
          color="emerald"
        />
        <MetricCard
          id="kpi_tk_kb"
          title="TK & KB (PAUD)"
          value={kpis.totalTK + kpis.totalKB}
          subtitle={`TK: ${kpis.totalTK} | KB: ${kpis.totalKB}`}
          icon={GraduationCap}
          color="indigo"
        />
        <MetricCard
          id="kpi_transisi"
          title="Transisi Alumni SD"
          value={`${kpis.transitionRate}%`}
          subtitle={`${kpis.continuing} dari ${kpis.alumnCount} siswa Melanjutkan`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* SD Specific Entry Path Alerts (Jalur alerts) */}
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

      {/* Charts Section using Recharts */}
      <div className="bg-transparent p-0 rounded-2xl">
        <DashboardCharts id="charts_dashboard" siswaBaru={siswaBaru} alumni={alumni} />
      </div>

      {/* Bottom Row - Real-time activity feeds and notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Real-time sync logs feed */}
        <div className="lg:col-span-2 p-5 bg-white/20 backdrop-blur-md border border-white/25 rounded-3xl shadow-xl">
          <ActivityFeed id="live_activity_logs" logs={logs} />
        </div>

        {/* Info / Quick Actions Card */}
        <div className="p-5 bg-black/25 backdrop-blur-md text-white/95 border border-white/15 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs uppercase font-black tracking-widest text-[#fdbb2d]">
              Instruksi Tugas Mandat TP 2026/2027
            </h4>
            <div className="mt-4 space-y-3.5 text-xs text-white/85 leading-relaxed">
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] self-start border border-white/10">1</span>
                <p><strong>Kepala Sekolah</strong> berkewajiban mendaftarkan siswa baru, memvalidasi jalur pendaftaran SD, serta memperbaharui alumni lulus.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] self-start border border-white/10">2</span>
                <p><strong>Pengawas</strong> memantau transisi Wajib Belajar 9 Tahun agar angka putus sekolah paska-SD teratasi sepenuhnya di tingkat kecamatan.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] self-start border border-white/10">3</span>
                <p><strong>Tim Kerja Dinas</strong> bertindak sebagai administrator agregasi untuk memverifikasi kecocokan NIK pusat & ekspor berkas rekapitulasi.</p>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/15 text-[10px] text-white/50 italic font-mono leading-relaxed">
            * Data tervalidasi selaras dengan Data Pokok Pendidikan (Dapodik) Kemendikbudristek 2026.
          </div>
        </div>

      </div>

    </div>
  );
}
