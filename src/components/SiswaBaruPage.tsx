import { useState, useMemo } from 'react';
import { SiswaBaru, UserRole, StatusVerifikasi } from '../types';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Info
} from 'lucide-react';
import SiswaBaruForm from './SiswaBaruForm';

interface SiswaBaruPageProps {
  siswaBaru: SiswaBaru[];
  activeSchool: string;
  isReadOnly: boolean;
  currentRole: UserRole;
  onSaveStudent: (student: SiswaBaru) => void;
  onEditStudent: (student: SiswaBaru | null) => void;
  onDeleteStudent: (id: string, name: string, school: string) => void;
}

export default function SiswaBaruPage(props: SiswaBaruPageProps) {
  const [sbSearch, setSbSearch] = useState('');
  const [sbFilterJenjang, setSbFilterJenjang] = useState<string>('ALL');
  const [sbFilterStatus, setSbFilterStatus] = useState<string>('ALL');
  const [showSiswaForm, setShowSiswaForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<SiswaBaru | null>(null);

  const showSD = props.currentRole !== 'PENILIK';
  const showTK = props.currentRole !== 'PENILIK';
  const showKB = props.currentRole !== 'PENGAWAS_SEKOLAH';

  const filteredSiswaBaru = useMemo(() => {
    return props.siswaBaru.filter(siswa => {
      if (props.activeSchool && siswa.sekolahTujuan !== props.activeSchool) return false;
      const query = sbSearch.toLowerCase().trim();
      const matchesSearch = !query ||
        siswa.sekolahTujuan.toLowerCase().includes(query);
      const matchesJenjang = sbFilterJenjang === 'ALL' || siswa.jenjang === sbFilterJenjang;
      const matchesStatus = sbFilterStatus === 'ALL' || siswa.statusVerifikasi === sbFilterStatus;
      return matchesSearch && matchesJenjang && matchesStatus;
    });
  }, [props.siswaBaru, props.activeSchool, sbSearch, sbFilterJenjang, sbFilterStatus]);

  const handleSaveWrapper = (student: SiswaBaru) => {
    props.onSaveStudent(student);
    setShowSiswaForm(false);
    setEditingStudent(null);
  };

  const handleCloseForm = () => {
    setShowSiswaForm(false);
    setEditingStudent(null);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setShowSiswaForm(true);
    props.onEditStudent(null);
  };

  const handleEdit = (siswa: SiswaBaru) => {
    setEditingStudent(siswa);
    setShowSiswaForm(true);
    props.onEditStudent(siswa);
  };

  return (
    <>
      <div className="space-y-4 animate-fade-in">

        {/* Header registry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/15 backdrop-blur-md p-5 border border-white/20 rounded-3xl text-white shadow-xl">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide uppercase">
              <Users className="w-5 h-5 text-[#fdbb2d]" />
              Rekapitulasi Pendataan Siswa Baru (TP 2026-2027)
            </h3>
            <p className="text-xs text-white/75 font-medium">Mencatat rekapitulasi jumlah siswa baru berdasarkan gender, jalur masuk (SD), dan rentang kelompok usia (TK/KB)</p>
          </div>

          {!props.isReadOnly && (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-slate-800 rounded-2xl text-xs font-black transition shadow-lg hover:bg-white/90 active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              Input Rekap Baru
            </button>
          )}
        </div>

        {/* Filters toolbar */}
        <div className="bg-white/20 backdrop-blur-md p-4 border border-white/25 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-lg">

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/60" />
            <input
              type="text"
              value={sbSearch}
              onChange={(e) => setSbSearch(e.target.value)}
              placeholder="Cari Nama Sekolah..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-white/20 text-xs focus:ring-2 focus:ring-white/20 focus:outline-none bg-white/10 text-white placeholder-white/50"
            />
            {sbSearch && (
              <button
                onClick={() => setSbSearch('')}
                className="absolute right-2.5 top-2 py-0.5 px-1.5 text-xs text-white/65 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Level filter */}
          <select
            value={sbFilterJenjang}
            onChange={(e) => setSbFilterJenjang(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-white/20 text-xs focus:outline-none bg-white/10 text-white cursor-pointer font-bold transition-all"
          >
            <option value="ALL" className="text-slate-800 bg-white">
              {props.currentRole === 'PENGAWAS_SEKOLAH' ? 'SD & TK' : props.currentRole === 'PENILIK' ? 'KB' : 'Semua Jenjang (TK/KB/SD)'}
            </option>
            {showSD && <option value="SD" className="text-slate-800 bg-white">SD (Sekolah Dasar)</option>}
            {showTK && <option value="TK" className="text-slate-800 bg-white">TK (Taman Kanak-Kanak)</option>}
            {showKB && <option value="KB" className="text-slate-800 bg-white">KB (Kelompok Bermain)</option>}
          </select>

          {/* Verification Status filter */}
          <select
            value={sbFilterStatus}
            onChange={(e) => setSbFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-white/20 text-xs focus:outline-none bg-white/10 text-white cursor-pointer font-bold transition-all"
          >
            <option value="ALL" className="text-slate-800 bg-white">Semua Status Berkas</option>
            <option value="Diproses" className="text-slate-800 bg-white">Diproses / Validasi</option>
            <option value="Diverifikasi" className="text-slate-800 bg-white">Diverifikasi Valid</option>
            <option value="Ditolak" className="text-slate-800 bg-white">Ditolak / Dikembalikan</option>
          </select>
        </div>

        {/* Students count summary */}
        <div className="flex items-center justify-between text-[10px] font-black text-white/70 uppercase tracking-widest px-1">
          <span>Menampilkan {filteredSiswaBaru.length} dari {props.siswaBaru.length} Laporan Rekapitulasi</span>
          {props.activeSchool && <span className="text-yellow-300">Terfilter: {props.activeSchool}</span>}
        </div>

        {/* Main lists */}
        <div className="space-y-6">
          {(() => {
            const listSD = filteredSiswaBaru.filter(s => s.jenjang === 'SD');
            const listTK = filteredSiswaBaru.filter(s => s.jenjang === 'TK');
            const listKB = filteredSiswaBaru.filter(s => s.jenjang === 'KB');
            const hasMatches = filteredSiswaBaru.length > 0;

            if (!hasMatches) {
              return (
                <div className="p-12 text-center bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl">
                  <p className="text-sm text-white/75 italic font-medium">Tidak ditemukan data rekapitulasi siswa baru sesuai kriteria pencarian/filter.</p>
                </div>
              );
            }

            return (
              <>
                {/* SD TABLE */}
                {showSD && (sbFilterJenjang === 'ALL' || sbFilterJenjang === 'SD') && (
                  <div className="bg-white/95 backdrop-blur-2xl border border-white/45 rounded-3xl shadow-xl p-5 space-y-4 text-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                          Jenjang Sekolah Dasar (SD)
                        </h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-lg border border-emerald-100 self-start sm:self-auto">
                        {listSD.length} Lembaga Terdaftar
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-inner">
                      <table className="w-full text-xs text-slate-700 min-w-0 border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                          <tr>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-12">No</th>
                            <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider min-w-[120px] sm:min-w-[200px]">Nama Sekolah</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-16 border-l border-slate-300 bg-indigo-50/20 text-indigo-800">L</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-16 bg-rose-50/20 text-rose-800">P</th>
                            <th className="px-4 py-3 text-center font-black uppercase tracking-wider w-20 bg-slate-100/50 text-slate-900 border-r border-slate-300">Total</th>
                            <th className="px-3 py-3 text-center font-semibold text-[10px] uppercase tracking-wider w-20 bg-emerald-50/10 text-emerald-800">Domisili</th>
                            <th className="px-3 py-3 text-center font-semibold text-[10px] uppercase tracking-wider w-20 bg-rose-50/10 text-rose-800">Afirmasi</th>
                            <th className="px-3 py-3 text-center font-semibold text-[10px] uppercase tracking-wider w-20 bg-violet-50/10 text-violet-800">Mutasi</th>
                            <th className="px-3 py-3 text-center font-semibold text-[10px] uppercase tracking-wider w-20 bg-teal-50/10 text-teal-800">Umum</th>
                            <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider">Catatan</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-28">Status</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-24">Tgl Lapor</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {listSD.length > 0 ? (
                            listSD.map((siswa, idx) => {
                              const total = (siswa.lakiLaki || 0) + (siswa.perempuan || 0);
                              return (
                                <tr key={siswa.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-3 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                  <td className="px-4 py-3 font-extrabold text-slate-900">{siswa.sekolahTujuan}</td>
                                  <td className="px-3 py-3 text-center font-extrabold text-indigo-700 bg-indigo-50/5 border-l border-slate-300">{siswa.lakiLaki}</td>
                                  <td className="px-3 py-3 text-center font-extrabold text-rose-700 bg-rose-50/5">{siswa.perempuan}</td>
                                  <td className="px-4 py-3 text-center font-black bg-slate-100/30 text-slate-950 border-r border-slate-300">{total}</td>
                                  <td className="px-3 py-3 text-center text-emerald-800 font-extrabold">{siswa.domisili}</td>
                                  <td className="px-3 py-3 text-center text-rose-700 font-extrabold">{siswa.afirmasi}</td>
                                  <td className="px-3 py-3 text-center text-violet-800 font-extrabold">{siswa.mutasi}</td>
                                  <td className="px-3 py-3 text-center text-teal-800 font-extrabold">{siswa.umum}</td>
                                  <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={siswa.catatan}>
                                    {siswa.catatan || <span className="text-slate-300 italic text-[10px]">Tidak ada</span>}
                                  </td>
                                  <td className="px-3 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                      siswa.statusVerifikasi === 'Diverifikasi'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : siswa.statusVerifikasi === 'Ditolak'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {siswa.statusVerifikasi === 'Diverifikasi' ? (
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      ) : siswa.statusVerifikasi === 'Ditolak' ? (
                                        <XCircle className="w-3 h-3 text-rose-500" />
                                      ) : (
                                        <Clock className="w-3 h-3 text-amber-500" />
                                      )}
                                      {siswa.statusVerifikasi}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-center text-[10px] font-mono text-slate-400">{siswa.tanggalDaftar || '-'}</td>
                                  <td className="px-3 py-3 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                      {!props.isReadOnly ? (
                                        <>
                                          <button
                                            onClick={() => handleEdit(siswa)}
                                            className="p-2.5 min-w-[36px] min-h-[36px] text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hover:scale-110"
                                            title="Edit Rekap"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => props.onDeleteStudent(siswa.id, siswa.sekolahTujuan, siswa.sekolahTujuan)}
                                            className="p-2.5 min-w-[36px] min-h-[36px] text-rose-500 hover:bg-rose-50 rounded-lg transition-all hover:scale-110"
                                            title="Hapus Rekap"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => handleEdit(siswa)}
                                          className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-all text-[10px] font-extrabold flex items-center gap-0.5"
                                        >
                                          <Info className="w-3.5 h-3.5" /> Detail
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={13} className="px-4 py-8 text-center text-slate-400 italic">
                                Tidak ada data rekapitulasi siswa baru Sekolah Dasar (SD).
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TK TABLE */}
                {showTK && (sbFilterJenjang === 'ALL' || sbFilterJenjang === 'TK') && (
                  <div className="bg-white/95 backdrop-blur-2xl border border-white/45 rounded-3xl shadow-xl p-5 space-y-4 text-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                          Jenjang Taman Kanak-Kanak (TK)
                        </h4>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-black rounded-lg border border-blue-100 self-start sm:self-auto">
                        {listTK.length} Lembaga Terdaftar
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-inner">
                      <table className="w-full text-xs text-slate-700 min-w-0 border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                          <tr>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-12">No</th>
                            <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider min-w-[120px] sm:min-w-[200px]">Nama Sekolah</th>
                            <th className="px-4 py-3 text-center font-extrabold uppercase tracking-wider w-40 border-l border-slate-300 bg-amber-50/20 text-amber-900">Kelompok A (4-5 Thn)</th>
                            <th className="px-4 py-3 text-center font-extrabold uppercase tracking-wider w-40 bg-indigo-50/20 text-indigo-900 border-r border-slate-300">Kelompok B (5-6 Thn)</th>
                            <th className="px-4 py-3 text-center font-black uppercase tracking-wider w-28 bg-slate-100/50 text-slate-900">Total</th>
                            <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider">Catatan</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-28">Status</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-24">Tgl Lapor</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {listTK.length > 0 ? (
                            listTK.map((siswa, idx) => {
                              const total = (siswa.kelompokA || 0) + (siswa.kelompokB || 0);
                              return (
                                <tr key={siswa.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-3 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                  <td className="px-4 py-3 font-extrabold text-slate-900">{siswa.sekolahTujuan}</td>
                                  <td className="px-4 py-3 text-center font-extrabold text-amber-800 bg-amber-50/5 border-l border-slate-300">{siswa.kelompokA} anak</td>
                                  <td className="px-4 py-3 text-center font-extrabold text-indigo-700 bg-indigo-50/5 border-r border-slate-300">{siswa.kelompokB} anak</td>
                                  <td className="px-4 py-3 text-center font-black bg-slate-100/30 text-slate-950">{total} anak</td>
                                  <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={siswa.catatan}>
                                    {siswa.catatan || <span className="text-slate-300 italic text-[10px]">Tidak ada</span>}
                                  </td>
                                  <td className="px-3 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                      siswa.statusVerifikasi === 'Diverifikasi'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : siswa.statusVerifikasi === 'Ditolak'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {siswa.statusVerifikasi === 'Diverifikasi' ? (
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      ) : siswa.statusVerifikasi === 'Ditolak' ? (
                                        <XCircle className="w-3 h-3 text-rose-500" />
                                      ) : (
                                        <Clock className="w-3 h-3 text-amber-500" />
                                      )}
                                      {siswa.statusVerifikasi}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-center text-[10px] font-mono text-slate-400">{siswa.tanggalDaftar || '-'}</td>
                                  <td className="px-3 py-3 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                      {!props.isReadOnly ? (
                                        <>
                                          <button
                                            onClick={() => handleEdit(siswa)}
                                            className="p-2.5 min-w-[36px] min-h-[36px] text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hover:scale-110"
                                            title="Edit Rekap"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => props.onDeleteStudent(siswa.id, siswa.sekolahTujuan, siswa.sekolahTujuan)}
                                            className="p-2.5 min-w-[36px] min-h-[36px] text-rose-500 hover:bg-rose-50 rounded-lg transition-all hover:scale-110"
                                            title="Hapus Rekap"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => handleEdit(siswa)}
                                          className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-all text-[10px] font-extrabold flex items-center gap-0.5"
                                        >
                                          <Info className="w-3.5 h-3.5" /> Detail
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-slate-400 italic">
                                Tidak ada data rekapitulasi siswa baru Taman Kanak-Kanak (TK).
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* KB TABLE */}
                {showKB && (sbFilterJenjang === 'ALL' || sbFilterJenjang === 'KB') && (
                  <div className="bg-white/95 backdrop-blur-2xl border border-white/45 rounded-3xl shadow-xl p-5 space-y-4 text-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                          Jenjang Kelompok Bermain (KB)
                        </h4>
                      </div>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-black rounded-lg border border-indigo-100 self-start sm:self-auto">
                        {listKB.length} Lembaga Terdaftar
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-inner">
                      <table className="w-full text-xs text-slate-700 min-w-0 border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                          <tr>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-12">No</th>
                            <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider min-w-[120px] sm:min-w-[200px]">Nama Sekolah</th>
                            <th className="px-4 py-3 text-center font-extrabold uppercase tracking-wider w-40 border-l border-slate-300 bg-amber-50/20 text-amber-900">Kelompok A (4-5 Thn)</th>
                            <th className="px-4 py-3 text-center font-extrabold uppercase tracking-wider w-40 bg-indigo-50/20 text-indigo-900 border-r border-slate-300">Kelompok B (5-6 Thn)</th>
                            <th className="px-4 py-3 text-center font-black uppercase tracking-wider w-28 bg-slate-100/50 text-slate-900">Total</th>
                            <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider">Catatan</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-28">Status</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-24">Tgl Lapor</th>
                            <th className="px-3 py-3 text-center font-extrabold uppercase tracking-wider w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {listKB.length > 0 ? (
                            listKB.map((siswa, idx) => {
                              const total = (siswa.kelompokA || 0) + (siswa.kelompokB || 0);
                              return (
                                <tr key={siswa.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-3 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                  <td className="px-4 py-3 font-extrabold text-slate-900">{siswa.sekolahTujuan}</td>
                                  <td className="px-4 py-3 text-center font-extrabold text-amber-800 bg-amber-50/5 border-l border-slate-300">{siswa.kelompokA} anak</td>
                                  <td className="px-4 py-3 text-center font-extrabold text-indigo-700 bg-indigo-50/5 border-r border-slate-300">{siswa.kelompokB} anak</td>
                                  <td className="px-4 py-3 text-center font-black bg-slate-100/30 text-slate-950">{total} anak</td>
                                  <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={siswa.catatan}>
                                    {siswa.catatan || <span className="text-slate-300 italic text-[10px]">Tidak ada</span>}
                                  </td>
                                  <td className="px-3 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                      siswa.statusVerifikasi === 'Diverifikasi'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : siswa.statusVerifikasi === 'Ditolak'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {siswa.statusVerifikasi === 'Diverifikasi' ? (
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      ) : siswa.statusVerifikasi === 'Ditolak' ? (
                                        <XCircle className="w-3 h-3 text-rose-500" />
                                      ) : (
                                        <Clock className="w-3 h-3 text-amber-500" />
                                      )}
                                      {siswa.statusVerifikasi}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-center text-[10px] font-mono text-slate-400">{siswa.tanggalDaftar || '-'}</td>
                                  <td className="px-3 py-3 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                      {!props.isReadOnly ? (
                                        <>
                                          <button
                                            onClick={() => handleEdit(siswa)}
                                            className="p-2.5 min-w-[36px] min-h-[36px] text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hover:scale-110"
                                            title="Edit Rekap"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => props.onDeleteStudent(siswa.id, siswa.sekolahTujuan, siswa.sekolahTujuan)}
                                            className="p-2.5 min-w-[36px] min-h-[36px] text-rose-500 hover:bg-rose-50 rounded-lg transition-all hover:scale-110"
                                            title="Hapus Rekap"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => handleEdit(siswa)}
                                          className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-all text-[10px] font-extrabold flex items-center gap-0.5"
                                        >
                                          <Info className="w-3.5 h-3.5" /> Detail
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-slate-400 italic">
                                Tidak ada data rekapitulasi siswa baru Kelompok Bermain (KB).
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

      </div>

      {showSiswaForm && (
        <SiswaBaruForm
          id="modal_siswa_baru_form"
          student={editingStudent}
          onSave={handleSaveWrapper}
          onClose={handleCloseForm}
          userRole={props.currentRole}
          userSchool={props.activeSchool}
        />
      )}
    </>
  );
}
