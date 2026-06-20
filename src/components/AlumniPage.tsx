/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { AlumniSD, UserRole } from '../types';
import AlumniForm from './AlumniForm';

interface AlumniPageProps {
  alumni: AlumniSD[];
  activeSchool: string;
  isReadOnly: boolean;
  userRole: UserRole;
  kpis: {
    continuing: number;
    notContinuing: number;
  };
  onSaveAlumni: (alumni: AlumniSD) => void;
  onEditAlumni: (alumni: AlumniSD | null) => void;
  onDeleteAlumni: (id: string, name: string, school: string) => void;
}

export default function AlumniPage(props: AlumniPageProps) {
  const { alumni, activeSchool, isReadOnly, userRole, kpis, onSaveAlumni, onEditAlumni, onDeleteAlumni } = props;

  const [alumniSearch, setAlumniSearch] = useState('');
  const [alumniFilterStatus, setAlumniFilterStatus] = useState<string>('ALL');
  const [alumniFilterVerif, setAlumniFilterVerif] = useState<string>('ALL');
  const [showAlumniForm, setShowAlumniForm] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniSD | null>(null);

  const filteredAlumni = useMemo(() => {
    return alumni.filter(alum => {
      if (activeSchool && alum.sekolahAsal !== activeSchool) return false;

      const query = alumniSearch.toLowerCase().trim();
      const matchesSearch = !query ||
        alum.nama.toLowerCase().includes(query) ||
        alum.nik.includes(query);

      const matchesStatus = alumniFilterStatus === 'ALL' || alum.status === alumniFilterStatus;
      const matchesVerif = alumniFilterVerif === 'ALL' || alum.statusVerifikasi === alumniFilterVerif;

      return matchesSearch && matchesStatus && matchesVerif;
    });
  }, [alumni, activeSchool, alumniSearch, alumniFilterStatus, alumniFilterVerif]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/15 backdrop-blur-md p-5 border border-white/20 rounded-3xl text-white shadow-xl">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <img src="/logokab.png" className="w-5 h-5 text-[#fdbb2d]" />
            Pencatatan & Tracing Alumni SD
          </h3>
          <p className="text-xs text-white/75 font-medium">
            Memantau kepatuhan Wajib Belajar 9 Tahun (apakah alumni SD melanjutkan ke SMP/MTs atau Tidak Melanjutkan)
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => {
              setEditingAlumni(null);
              setShowAlumniForm(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-slate-800 rounded-2xl text-xs font-black transition shadow-lg hover:bg-white/90 active:scale-95"
          >
            <img src="/logokab.png" className="w-4 h-4 text-amber-600" />
            Tambah Data Alumni Lulus
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-md">
          <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">Angka Melanjutkan</span>
          <p className="text-lg font-black text-emerald-200 mt-1">{kpis.continuing} Alumni</p>
          <p className="text-[10px] text-white/70">SMP / MTs / Ponpes</p>
        </div>
        <div className="p-3.5 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 rounded-2xl shadow-md">
          <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider block">Tidak Melanjutkan</span>
          <p className="text-lg font-black text-rose-200 mt-1">{kpis.notContinuing} Alumni</p>
          <p className="text-[10px] text-white/70 italic">Kerentanan Putus SMP</p>
        </div>
        <div className="p-3.5 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-2xl col-span-2 shadow-md">
          <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider block">Ikhtisar Kebijakan Wajib Belajar</span>
          <p className="text-xs text-white/90 mt-1 font-medium leading-relaxed">
            Setiap alumnus jenjang SD berumur wajib bersekolah wajib didorong masuk ke SMP/MTs sederajat. Data yang 'Tidak Melanjutkan' akan dialirkan ke penanggung jawab Dinas Pendidikan untuk ditindaklanjuti dengan beasiswa pembinaan.
          </p>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-md p-4 border border-white/25 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-lg">
        <div className="relative">
          <img src="/logokab.png" className="absolute left-3 top-2.5 w-4 h-4 text-white/60" />
          <input
            type="text"
            value={alumniSearch}
            onChange={(e) => setAlumniSearch(e.target.value)}
            placeholder="Cari Alumni (Nama / NIK)..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-white/20 text-xs focus:ring-2 focus:ring-white/20 focus:outline-none bg-white/10 text-white placeholder-white/50"
          />
          {alumniSearch && (
            <button onClick={() => setAlumniSearch('')} className="absolute right-2.5 top-2 text-xs text-white/65 px-1.5">×</button>
          )}
        </div>
        <select
          value={alumniFilterStatus}
          onChange={(e) => setAlumniFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-white/20 text-xs focus:outline-none bg-white/10 text-white cursor-pointer font-bold transition-all"
        >
          <option value="ALL" className="text-slate-800 bg-white">Semua Status Melanjutkan</option>
          <option value="Melanjutkan" className="text-slate-800 bg-white">Melanjutkan (SMP/MTs)</option>
          <option value="Tidak Melanjutkan" className="text-slate-800 bg-white">Tidak Melanjutkan</option>
        </select>
        <select
          value={alumniFilterVerif}
          onChange={(e) => setAlumniFilterVerif(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-white/20 text-xs focus:outline-none bg-white/10 text-white cursor-pointer font-bold transition-all"
        >
          <option value="ALL" className="text-slate-800 bg-white">Semua Status Validasi</option>
          <option value="Diverifikasi" className="text-slate-800 bg-white">Valid / Diverifikasi</option>
          <option value="Diproses" className="text-slate-800 bg-white">Diproses Tim Data</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredAlumni.map((alum) => (
          <div
            key={alum.id}
            className="bg-white/90 hover:bg-white backdrop-blur-2xl p-5 border border-white/40 rounded-[2rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-800 hover:scale-[1.01] transition-all duration-300"
          >
            <div className="flex gap-3.5 items-start">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-800 font-black text-xs flex-shrink-0 shadow-sm border border-amber-200">
                {alum.nama.charAt(0)}
              </div>
              <div className="space-y-1.5 min-w-0">
                <h4 className="font-extrabold text-sm text-slate-900">
                  {alum.nama}
                </h4>
                <div className="text-xs text-slate-600 font-mono space-y-1.5">
                  <p>NIK: <span className="text-slate-800 font-bold">{alum.nik}</span> • Lulusan: <strong className="text-slate-700">{alum.sekolahAsal}</strong> ({alum.tahunLulus})</p>
                  {alum.status === 'Melanjutkan' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 shadow-sm mt-1">
                      <img src="/logokab.png" className="w-3.5 h-3.5 text-emerald-600" />
                      Melanjutkan: {alum.tujuanSekolah}
                    </div>
                  ) : (
                    <div className="inline-flex flex-col gap-1.5 px-3 py-2 bg-rose-100 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200 shadow-sm mt-1">
                      <span className="font-bold flex items-center gap-1">
                        <img src="/logokab.png" className="w-3.5 h-3.5 text-rose-600" />
                        Tidak Melanjutkan Sekolah
                      </span>
                      <span className="text-[11px] text-rose-700 italic font-sans font-medium pl-5 leading-relaxed">Alasan: {alum.alasanTidakMelanjutkan}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-200/60 pt-3.5 md:pt-0">
              <div className="text-right">
                <span className="text-[9px] font-extrabold text-slate-400 block uppercase tracking-wider">Verifikasi</span>
                <div className="flex items-center gap-1 md:justify-end">
                  <span className={`text-xs font-black ${alum.statusVerifikasi === 'Diverifikasi' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {alum.statusVerifikasi}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-mono">Update: {alum.tanggalUpdate}</p>
              </div>

              <div className="flex gap-1">
                {!isReadOnly ? (
                  <>
                    <button
                      onClick={() => {
                        setEditingAlumni(alum);
                        setShowAlumniForm(true);
                        onEditAlumni(alum);
                      }}
                      className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105"
                      title="Edit Data"
                    >
                      <img src="/logokab.png" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAlumni(alum.id, alum.nama, alum.sekolahAsal)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      <img src="/logokab.png" className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAlumni(alum);
                      setShowAlumniForm(true);
                      onEditAlumni(alum);
                    }}
                    className="p-2 text-indigo-600 hover:bg-slate-50 rounded-xl flex items-center gap-1 text-xs font-bold"
                  >
                    <img src="/logokab.png" className="w-4 h-4" /> Detail
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAlumni.length === 0 && (
          <div className="p-12 text-center bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl">
            <p className="text-sm text-white/70 italic font-medium">Melacak database, tidak ada data alumni yang cocok.</p>
          </div>
        )}
      </div>

      {showAlumniForm && (
        <AlumniForm
          id="modal_alumni_form"
          alumni={editingAlumni}
          onSave={onSaveAlumni}
          onClose={() => {
            setShowAlumniForm(false);
            setEditingAlumni(null);
          }}
          userRole={userRole}
          userSchool={activeSchool}
        />
      )}
    </div>
  );
}
