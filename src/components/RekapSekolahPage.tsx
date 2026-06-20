import { useState, useEffect } from 'react';
import { SiswaBaru, AlumniSD, RekapKelasSD } from '../types';
import { LIST_SEKOLAH } from '../data/initialData';
import { School, Save } from 'lucide-react';

const STORAGE_KEY = 'rekap_kelas_sd';

function loadRekapKelas(): RekapKelasSD[] {
  let saved: string | null = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
  if (saved) { try { return JSON.parse(saved); } catch {} }
  const sdSchools = LIST_SEKOLAH.filter(s => s.jenjang === 'SD');
  return sdSchools.map(s => ({
    sekolah: s.nama,
    kelas1L: 0, kelas1P: 0,
    kelas2L: 0, kelas2P: 0,
    kelas3L: 0, kelas3P: 0,
    kelas4L: 0, kelas4P: 0,
    kelas5L: 0, kelas5P: 0,
    kelas6L: 0, kelas6P: 0,
  }));
}

interface RekapSekolahPageProps {
  siswaBaru: SiswaBaru[];
  alumni: AlumniSD[];
  activeSchool: string;
  setActiveSchool: (school: string) => void;
  setActiveTab: (tab: 'dashboard' | 'siswa_baru' | 'alumni' | 'rekap_sekolah') => void;
}

const getStudentTotal = (s: SiswaBaru): number => {
  if (s.jenjang === 'SD') return (s.lakiLaki || 0) + (s.perempuan || 0);
  return (s.kelompokA || 0) + (s.kelompokB || 0);
};

export default function RekapSekolahPage(props: RekapSekolahPageProps) {
  const { siswaBaru, alumni, activeSchool, setActiveSchool, setActiveTab } = props;
  const [rekapTab, setRekapTab] = useState<'lulus' | 'ppdb' | 'kelas'>('lulus');
  const [rekapKelas, setRekapKelas] = useState<RekapKelasSD[]>(loadRekapKelas);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rekapKelas));
  }, [rekapKelas]);

  const handleKelasChange = (sekolah: string, field: keyof RekapKelasSD, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setRekapKelas(prev => prev.map(r =>
      r.sekolah === sekolah ? { ...r, [field]: num } : r
    ));
  };

  const sdSchools = LIST_SEKOLAH.filter(s => s.jenjang === 'SD');

  let grandTotalMelanjutkan = 0;
  let grandTotalTidakMelanjutkan = 0;
  let grandTotalLulusJumlah = 0;
  let grandTotalTidakLulus = 0;
  let grandTotalJumlah = 0;

  const rekapKelulusanData = sdSchools.map((school, i) => {
    const alums = alumni.filter(a => a.sekolahAsal === school.nama);
    const totalMelanjutkan = alums.filter(a => a.status === 'Melanjutkan').length;
    const totalTidakMelanjutkan = alums.filter(a => a.status === 'Tidak Melanjutkan').length;
    const totalTidakLulus = alums.filter(a => a.status === 'Tidak Lulus').length;
    const totalLulusJumlah = totalMelanjutkan + totalTidakMelanjutkan;
    const totalJumlah = totalLulusJumlah + totalTidakLulus;

    grandTotalMelanjutkan += totalMelanjutkan;
    grandTotalTidakMelanjutkan += totalTidakMelanjutkan;
    grandTotalLulusJumlah += totalLulusJumlah;
    grandTotalTidakLulus += totalTidakLulus;
    grandTotalJumlah += totalJumlah;

    return {
      no: i + 1,
      npsn: school.npsn || '-',
      namaSekolah: school.nama,
      kecamatan: school.kecamatan,
      melanjutkan: totalMelanjutkan,
      tidakMelanjutkan: totalTidakMelanjutkan,
      lulusJumlah: totalLulusJumlah,
      tidakLulus: totalTidakLulus,
      jumlah: totalJumlah,
      originalId: school.id
    };
  });

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header widget */}
      <div className="p-5 bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide uppercase">
              <School className="w-5 h-5 text-[#fdbb2d]" />
              Rekapitulasi Data Lembaga & Kelulusan SD
            </h3>
            <p className="text-xs text-white/75 font-medium">
              Rangkuman performa statistik kelulusan & pendaftaran siswa baru se-Kecamatan Lemahabang TP 2026/2027
            </p>
          </div>
        </div>

        {/* Triple Mode Subtabs */}
        <div className="mt-4 flex bg-black/25 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setRekapTab('lulus')}
            className={`flex-1 py-2 rounded-xl text-center text-xs font-black transition-all ${
              rekapTab === 'lulus'
                ? 'bg-white text-slate-800 shadow-md scale-[1.01]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Format 1: Rekap Kelulusan SD
          </button>
          <button
            onClick={() => setRekapTab('ppdb')}
            className={`flex-1 py-2 rounded-xl text-center text-xs font-black transition-all ${
              rekapTab === 'ppdb'
                ? 'bg-white text-slate-800 shadow-md scale-[1.01]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Format 2: Rekap PPDB Siswa Baru
          </button>
          <button
            onClick={() => setRekapTab('kelas')}
            className={`flex-1 py-2 rounded-xl text-center text-xs font-black transition-all ${
              rekapTab === 'kelas'
                ? 'bg-white text-slate-800 shadow-md scale-[1.01]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Format 3: Rekap Data Per Kelas
          </button>
        </div>
      </div>

      {rekapTab === 'lulus' ? (
        <div className="space-y-4">
          <div className="text-center text-white py-2 space-y-0.5">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-yellow-300">
              REKAPITULASI KELULUSAN PESERTA DIDIK SEKOLAH DASAR
            </h2>
            <p className="text-xs font-medium text-white/80">
              Tahun Pelajaran 2026-2027 • Kecamatan Lemahabang
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider text-center">
                    <th className="p-3 pl-5 text-left border-r border-slate-200" rowSpan={2}>No.</th>
                    <th className="p-3 text-center border-r border-slate-200" rowSpan={2}>NPSN</th>
                    <th className="p-3 text-left border-r border-slate-200" rowSpan={2}>Nama Sekolah</th>
                    <th className="p-3 text-left border-r border-slate-200" rowSpan={2}>Kecamatan</th>
                    <th className="p-2 border-b border-r border-slate-200 bg-indigo-50/60" colSpan={3}>Lulus</th>
                    <th className="p-3 border-r border-slate-200" rowSpan={2}>Tidak Lulus</th>
                    <th className="p-3" rowSpan={2}>Jumlah</th>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px] tracking-wider text-center">
                    <th className="p-2 border-r border-slate-200 text-center font-extrabold text-emerald-800">Melanjutkan</th>
                    <th className="p-2 border-r border-slate-200 text-center font-extrabold text-amber-700">Tidak Melanjutkan</th>
                    <th className="p-2 border-r border-slate-200 text-center font-extrabold text-indigo-800 bg-indigo-100/10">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                  {rekapKelulusanData.map((row) => (
                    <tr
                      key={row.originalId}
                      className="hover:bg-slate-50 cursor-pointer transition"
                      onClick={() => {
                        setActiveSchool(row.namaSekolah);
                        setActiveTab('dashboard');
                      }}
                    >
                      <td className="p-2.5 pl-5 font-black text-slate-400 text-center border-r border-slate-200">{row.no}</td>
                      <td className="p-2.5 font-mono text-center border-r border-slate-200 text-slate-600">{row.npsn}</td>
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">{row.namaSekolah}</td>
                      <td className="p-2.5 text-slate-600 border-r border-slate-200">{row.kecamatan}</td>
                      <td className="p-2.5 text-center text-emerald-700 font-bold border-r border-slate-200">{row.melanjutkan}</td>
                      <td className="p-2.5 text-center text-amber-600 font-bold border-r border-slate-200">{row.tidakMelanjutkan}</td>
                      <td className="p-2.5 text-center text-indigo-700 bg-slate-50/70 font-black border-r border-slate-200">{row.lulusJumlah}</td>
                      <td className="p-2.5 text-center text-rose-500 font-bold border-r border-slate-100 border-slate-200">{row.tidakLulus}</td>
                      <td className="p-2.5 text-center font-black text-slate-900 bg-slate-100/50">{row.jumlah}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800 font-black border-t-2 border-slate-300 text-slate-900 uppercase text-[11px] tracking-wide text-center">
                    <td className="p-3 pl-5 text-left border-r border-slate-200" colSpan={4}>Jumlah</td>
                    <td className="p-3 border-r border-slate-200 text-emerald-700 text-base font-black">{grandTotalMelanjutkan}</td>
                    <td className="p-3 border-r border-slate-200 text-amber-600 text-base font-black">{grandTotalTidakMelanjutkan}</td>
                    <td className="p-3 border-r border-slate-200 text-indigo-700 bg-slate-50 font-black text-base">{grandTotalLulusJumlah}</td>
                    <td className="p-3 border-r border-slate-200 text-rose-500 text-base font-black">{grandTotalTidakLulus}</td>
                    <td className="p-3 font-black text-slate-950 text-base bg-slate-200/50">{grandTotalJumlah}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="p-4 bg-slate-100/50 text-slate-600 text-[11px] border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between font-bold gap-1">
              <span>* Klik baris sekolah untuk memantau rincian dashboard satuan pendidikan secara langsung.</span>
              <span className="text-emerald-700">Persentase Transisi Kecamatan: {grandTotalJumlah > 0 ? Math.round((grandTotalMelanjutkan / (grandTotalJumlah - grandTotalTidakLulus)) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      ) : rekapTab === 'ppdb' ? (
        <div className="bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-300 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-3.5 pl-5">No</th>
                  <th className="p-3.5">Nama Lembaga Pendidikan</th>
                  <th className="p-3.5">Jenjang</th>
                  <th className="p-3.5 text-center">Total Pendaftar</th>
                  <th className="p-3.5 text-center">Diverifikasi</th>
                  <th className="p-3.5 text-center">Draft/Diproses</th>
                  <th className="p-3.5 text-center">Ditolak</th>
                  <th className="p-3.5 text-center">Traced Alumni</th>
                  <th className="p-3.5 text-center">Melanjutkan (SMP)</th>
                  <th className="p-3.5 text-center">Angka Transisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {LIST_SEKOLAH.map((school, idx) => {
                  const entry = siswaBaru.find(s => s.sekolahTujuan === school.nama);
                  const totalSiswa = entry ? getStudentTotal(entry) : 0;
                  const diverif = entry?.statusVerifikasi === 'Diverifikasi' ? 1 : 0;
                  const process = entry?.statusVerifikasi === 'Diproses' ? 1 : 0;
                  const reject = entry?.statusVerifikasi === 'Ditolak' ? 1 : 0;

                  const alums = alumni.filter(a => a.sekolahAsal === school.nama);
                  const cont = alums.filter(a => a.status === 'Melanjutkan').length;
                  const rate = alums.length > 0 ? Math.round((cont / alums.length) * 100) : 0;

                  return (
                    <tr
                      key={school.id}
                      className="hover:bg-indigo-50/50 cursor-pointer transition-all duration-150"
                      onClick={() => {
                        setActiveSchool(school.nama);
                        setActiveTab('dashboard');
                      }}
                    >
                      <td className="p-3.5 pl-5 font-black text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-extrabold text-slate-900">{school.nama}</td>
                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          school.jenjang === 'SD'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : school.jenjang === 'TK'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {school.jenjang}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-black text-indigo-700">{totalSiswa}</td>
                      <td className="p-3.5 text-center text-emerald-600 font-extrabold">{diverif}</td>
                      <td className="p-3.5 text-center text-amber-600 font-bold">{process}</td>
                      <td className="p-3.5 text-center text-rose-500 font-bold">{reject}</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">{school.jenjang === 'SD' ? alums.length : '-'}</td>
                      <td className="p-3.5 text-center text-emerald-700 font-extrabold">{school.jenjang === 'SD' ? cont : '-'}</td>
                      <td className="p-3.5 text-center">
                        {school.jenjang === 'SD' ? (
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                            rate >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' : rate >= 70 ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm' : 'bg-red-100 text-red-800 border border-red-200 shadow-sm'
                          }`}>
                            {rate}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-100/50 text-slate-600 text-[11px] border-t border-slate-200 flex items-center justify-between font-bold">
            <span>* Klik baris sekolah mana saja untuk beralih dan memantau rincian dashboard sekolah tersebut secara instan.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center text-white py-2 space-y-0.5">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-yellow-300">
              REKAPITULASI DATA SISWA PER KELAS SD
            </h2>
            <p className="text-xs font-medium text-white/80">
              Tahun Pelajaran 2026-2027 • Kecamatan Lemahabang
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider text-center">
                    <th className="p-3 pl-5 text-left border-r border-slate-200" rowSpan={2}>No.</th>
                    <th className="p-3 text-left border-r border-slate-200" rowSpan={2}>Nama Sekolah</th>
                    <th className="p-2 border-b border-r border-slate-200 bg-emerald-50/60" colSpan={2}>Kelas 1</th>
                    <th className="p-2 border-b border-r border-slate-200 bg-blue-50/60" colSpan={2}>Kelas 2</th>
                    <th className="p-2 border-b border-r border-slate-200 bg-indigo-50/60" colSpan={2}>Kelas 3</th>
                    <th className="p-2 border-b border-r border-slate-200 bg-amber-50/60" colSpan={2}>Kelas 4</th>
                    <th className="p-2 border-b border-r border-slate-200 bg-rose-50/60" colSpan={2}>Kelas 5</th>
                    <th className="p-2 border-b border-r border-slate-200 bg-teal-50/60" colSpan={2}>Kelas 6</th>
                    <th className="p-3 border-r border-slate-200" rowSpan={2}>Total</th>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px] tracking-wider text-center">
                    <th className="p-2 border-r border-slate-200 text-emerald-700">L</th>
                    <th className="p-2 border-r border-slate-200 text-emerald-700">P</th>
                    <th className="p-2 border-r border-slate-200 text-blue-700">L</th>
                    <th className="p-2 border-r border-slate-200 text-blue-700">P</th>
                    <th className="p-2 border-r border-slate-200 text-indigo-700">L</th>
                    <th className="p-2 border-r border-slate-200 text-indigo-700">P</th>
                    <th className="p-2 border-r border-slate-200 text-amber-700">L</th>
                    <th className="p-2 border-r border-slate-200 text-amber-700">P</th>
                    <th className="p-2 border-r border-slate-200 text-rose-700">L</th>
                    <th className="p-2 border-r border-slate-200 text-rose-700">P</th>
                    <th className="p-2 border-r border-slate-200 text-teal-700">L</th>
                    <th className="p-2 border-r border-slate-200 text-teal-700">P</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                  {rekapKelas.map((row, i) => {
                    const total = row.kelas1L + row.kelas1P + row.kelas2L + row.kelas2P + row.kelas3L + row.kelas3P + row.kelas4L + row.kelas4P + row.kelas5L + row.kelas5P + row.kelas6L + row.kelas6P;
                    return (
                      <tr key={row.sekolah} className="hover:bg-slate-50 transition">
                        <td className="p-2 pl-5 font-black text-slate-400 text-center border-r border-slate-200 w-8">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">{row.sekolah}</td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas1L} onChange={e => handleKelasChange(row.sekolah, 'kelas1L', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas1P} onChange={e => handleKelasChange(row.sekolah, 'kelas1P', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas2L} onChange={e => handleKelasChange(row.sekolah, 'kelas2L', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas2P} onChange={e => handleKelasChange(row.sekolah, 'kelas2P', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas3L} onChange={e => handleKelasChange(row.sekolah, 'kelas3L', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas3P} onChange={e => handleKelasChange(row.sekolah, 'kelas3P', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas4L} onChange={e => handleKelasChange(row.sekolah, 'kelas4L', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas4P} onChange={e => handleKelasChange(row.sekolah, 'kelas4P', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas5L} onChange={e => handleKelasChange(row.sekolah, 'kelas5L', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas5P} onChange={e => handleKelasChange(row.sekolah, 'kelas5P', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas6L} onChange={e => handleKelasChange(row.sekolah, 'kelas6L', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400" /></td>
                        <td className="p-1 border-r border-slate-200"><input type="number" min="0" value={row.kelas6P} onChange={e => handleKelasChange(row.sekolah, 'kelas6P', e.target.value)} className="w-14 text-center border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400" /></td>
                        <td className="p-2 text-center font-black text-slate-900 bg-slate-50/70">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800 font-black border-t-2 border-slate-300 text-slate-900 uppercase text-[11px] tracking-wide text-center">
                    <td className="p-3 pl-5 text-left border-r border-slate-200" colSpan={2}>Jumlah</td>
                    {['kelas1L','kelas1P','kelas2L','kelas2P','kelas3L','kelas3P','kelas4L','kelas4P','kelas5L','kelas5P','kelas6L','kelas6P'].map(f => {
                      const totalCol = rekapKelas.reduce((sum, r) => sum + (r[f as keyof RekapKelasSD] as number), 0);
                      return <td key={f} className="p-3 border-r border-slate-200 text-base font-black">{totalCol}</td>;
                    })}
                    <td className="p-3 font-black text-slate-950 text-base bg-slate-200/50">
                      {rekapKelas.reduce((s, r) => s + r.kelas1L + r.kelas1P + r.kelas2L + r.kelas2P + r.kelas3L + r.kelas3P + r.kelas4L + r.kelas4P + r.kelas5L + r.kelas5P + r.kelas6L + r.kelas6P, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="p-4 bg-slate-100/50 text-slate-600 text-[11px] border-t border-slate-200 flex items-center justify-between font-bold gap-2">
              <span>Data disimpan otomatis ke penyimpanan lokal.</span>
              <span className="text-indigo-700"><Save className="w-3.5 h-3.5 inline mr-1" />Tersimpan</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
