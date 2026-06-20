/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  SiswaBaru,
  AlumniSD,
  UserRole,
  ActivityLog
} from './types';
import {
  INITIAL_SISWA_BARU,
  INITIAL_ALUMNI,
  INITIAL_LOGS,
  LIST_SEKOLAH
} from './data/initialData';
import {
  exportSiswaBaruToCSV,
  exportAlumniToCSV
} from './utils/excelExport';

// Components
import ConfirmModal from './components/ConfirmModal';
import DashboardPage from './components/DashboardPage';
import SiswaBaruPage from './components/SiswaBaruPage';
import AlumniPage from './components/AlumniPage';
import RekapSekolahPage from './components/RekapSekolahPage';

// Icons
import {
  Signal,
  Wifi,
  BatteryMedium,
  Building2,
  Building,
  Users,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export default function App() {
  // --- STATE ---
  const [siswaBaru, setSiswaBaru] = useState<SiswaBaru[]>(() => {
    const saved = localStorage.getItem('siswa_baru_real');
    let loaded: SiswaBaru[];
    try { loaded = saved ? JSON.parse(saved) : INITIAL_SISWA_BARU; } catch { loaded = INITIAL_SISWA_BARU; }
    
    // Prune legacy schools that are no longer in LIST_SEKOLAH
    const validNames = new Set(LIST_SEKOLAH.map(s => s.nama));
    loaded = loaded.filter(s => s && validNames.has(s.sekolahTujuan));

    // Append reports for any of the 23 new TK/KB schools that might be missing from the loaded array
    const existingReports = new Set(loaded.map(s => s.sekolahTujuan));
    const missingReports = INITIAL_SISWA_BARU.filter(s => s && !existingReports.has(s.sekolahTujuan));
    if (missingReports.length > 0) {
      loaded = [...loaded, ...missingReports];
    }
    return loaded;
  });

  const [alumni, setAlumni] = useState<AlumniSD[]>(() => {
    const saved = localStorage.getItem('alumni_sd_real');
    try { return saved ? JSON.parse(saved) : INITIAL_ALUMNI; } catch { return INITIAL_ALUMNI; }
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('activity_logs_real');
    let parsed: ActivityLog[];
    try { parsed = saved ? JSON.parse(saved) : INITIAL_LOGS; } catch { parsed = INITIAL_LOGS; }
    const seenIds = new Set<string>();
    return parsed.map(log => {
      if (!log.id || seenIds.has(log.id)) {
        return {
          ...log,
          id: `${log.id || 'log'}_temp_${Math.random().toString(36).substring(2, 9)}`
        };
      }
      seenIds.add(log.id);
      return log;
    });
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN_DINAS');
  
  // Sekolah terpilih jika Admin Dinas memfilter, atau sekolah Asal Kepala Sekolah
  const [activeSchool, setActiveSchool] = useState<string>('');
  
  const isReadOnly = currentRole === 'PENGAWAS_SEKOLAH' || currentRole === 'PUBLIK' || currentRole === 'KEPALA_SEKOLAH' || (currentRole === 'OPERATOR_SEKOLAH' && !activeSchool);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'siswa_baru' | 'alumni' | 'rekap_sekolah'>('dashboard');

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'siswa' | 'alumni';
    id: string;
    name: string;
    school: string;
  } | null>(null);

  // --- LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('siswa_baru_real', JSON.stringify(siswaBaru));
  }, [siswaBaru]);

  useEffect(() => {
    localStorage.setItem('alumni_sd_real', JSON.stringify(alumni));
  }, [alumni]);

  useEffect(() => {
    localStorage.setItem('activity_logs_real', JSON.stringify(logs));
  }, [logs]);

  // Real-time Clock Simulator for Android Status Bar
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSelectedTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const [selectedTime, setSelectedTime] = useState('10:15');

  // --- DERIVED METRICS ---
  // Overall Global Counts for KPI cards (taking into account selected school if any)
  const kpis = useMemo(() => {
    const listSiswa = activeSchool 
      ? siswaBaru.filter(s => s.sekolahTujuan === activeSchool) 
      : siswaBaru;
    
    const listAlumni = activeSchool 
      ? alumni.filter(a => a.sekolahAsal === activeSchool) 
      : alumni;

    const getSiswaBaruTotal = (s: SiswaBaru) => {
      if (s.jenjang === 'SD') {
        return (s.lakiLaki || 0) + (s.perempuan || 0);
      } else {
        return (s.kelompokA || 0) + (s.kelompokB || 0);
      }
    };

    const totalNew = listSiswa.reduce((acc, s) => acc + getSiswaBaruTotal(s), 0);
    const totalTK = listSiswa.filter(s => s.jenjang === 'TK').reduce((acc, s) => acc + getSiswaBaruTotal(s), 0);
    const totalKB = listSiswa.filter(s => s.jenjang === 'KB').reduce((acc, s) => acc + getSiswaBaruTotal(s), 0);
    const totalSD = listSiswa.filter(s => s.jenjang === 'SD').reduce((acc, s) => acc + getSiswaBaruTotal(s), 0);

    // SD Path counts
    const domisili = listSiswa.filter(s => s.jenjang === 'SD').reduce((acc, s) => acc + (s.domisili || 0), 0);
    const afirmasi = listSiswa.filter(s => s.jenjang === 'SD').reduce((acc, s) => acc + (s.afirmasi || 0), 0);
    const mutasi = listSiswa.filter(s => s.jenjang === 'SD').reduce((acc, s) => acc + (s.mutasi || 0), 0);

    // Alumni transition rate
    const alumnCount = listAlumni.length;
    const continuing = listAlumni.filter(a => a.status === 'Melanjutkan').length;
    const notContinuing = listAlumni.filter(a => a.status === 'Tidak Melanjutkan').length;
    const transitionRate = alumnCount > 0 ? Math.round((continuing / alumnCount) * 100) : 0;

    return {
      totalNew,
      totalTK,
      totalKB,
      totalSD,
      domisili,
      afirmasi,
      mutasi,
      alumnCount,
      continuing,
      notContinuing,
      transitionRate
    };
  }, [siswaBaru, alumni, activeSchool]);

  // --- ACTIONS ---
  const handleSaveStudent = (student: SiswaBaru) => {
    const exists = siswaBaru.some(s => s.id === student.id);
    let original = siswaBaru.find(s => s.id === student.id);

    if (exists) {
      setSiswaBaru(prev => prev.map(s => s.id === student.id ? student : s));
      
      const logText = original?.statusVerifikasi !== student.statusVerifikasi 
        ? `mengubah status verifikasi rekapitulasi ${student.sekolahTujuan} menjadi ${student.statusVerifikasi}`
        : `mengedit rekapitulasi pendaftaran siswa baru di ${student.sekolahTujuan}`;

      const newLog: ActivityLog = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        role: currentRole,
        actorName: currentRole === 'ADMIN_DINAS' ? 'Tim Dinas Pendidikan' : `Kepala Sekolah (${student.sekolahTujuan})`,
        action: 'Ubah Data',
        detail: `Berhasil ${logText}.`,
        type: original?.statusVerifikasi !== student.statusVerifikasi ? 'success' : 'info'
      };
      setLogs(prev => [newLog, ...prev]);
    } else {
      setSiswaBaru(prev => [student, ...prev]);
      const newLog: ActivityLog = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        role: currentRole,
        actorName: currentRole === 'ADMIN_DINAS' ? 'Tim Dinas Pendidikan' : `Kepala Sekolah (${student.sekolahTujuan})`,
        action: 'Daftar',
        detail: `Menambahkan rekapitulasi siswa baru di ${student.sekolahTujuan}.`,
        type: 'info'
      };
      setLogs(prev => [newLog, ...prev]);
    }
  };

  const handleDeleteStudent = (id: string, schoolName: string, school: string) => {
    setSiswaBaru(prev => prev.filter(s => s.id !== id));
    const newLog: ActivityLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      role: currentRole,
      actorName: currentRole === 'ADMIN_DINAS' ? 'Kecamatan Dinas' : `Kepala Sekolah (${school})`,
      action: 'Hapus Data',
      detail: `Menghapus rekapitulasi pendaftar baru dari ${schoolName}.`,
      type: 'danger'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleSaveAlumni = (alum: AlumniSD) => {
    const exists = alumni.some(a => a.id === alum.id);
    if (exists) {
      setAlumni(prev => prev.map(a => a.id === alum.id ? alum : a));
      const newLog: ActivityLog = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        role: currentRole,
        actorName: `Admin (${alum.sekolahAsal})`,
        action: 'Edit Alumni',
        detail: `Memperbarui data alumni SD ${alum.nama} (${alum.status}).`,
        type: 'info'
      };
      setLogs(prev => [newLog, ...prev]);
    } else {
      setAlumni(prev => [alum, ...prev]);
      const newLog: ActivityLog = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        role: currentRole,
        actorName: `Admin (${alum.sekolahAsal})`,
        action: 'Tambah Alumni',
        detail: `Mendata alumni baru SD ${alum.nama} dengan status ${alum.status}.`,
        type: 'success'
      };
      setLogs(prev => [newLog, ...prev]);
    }
  };

  const handleDeleteAlumni = (id: string, name: string, school: string) => {
    setAlumni(prev => prev.filter(a => a.id !== id));
    const newLog: ActivityLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      role: currentRole,
      actorName: `Admin (${school})`,
      action: 'Hapus Alumni',
      detail: `Menghapus data alumni berkelanjutan ${name}.`,
      type: 'danger'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Switch role and update UI context safely
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setActiveSchool(''); // clear school filter, user picks one via dropdown
    
    // Add logging
    const newLog: ActivityLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      role,
      actorName: role === 'ADMIN_DINAS' ? 'Tim Dinas' : role === 'PENGAWAS_SEKOLAH' ? 'Pengawas' : role === 'PUBLIK' ? 'Masyarakat (Publik)' : role === 'OPERATOR_SEKOLAH' ? 'Operator Sekolah' : 'Kepala Sekolah',
      action: 'Login',
      detail: `Mengganti mode akses dashboard menjadi ${
        role === 'ADMIN_DINAS'
          ? 'Tim Kerja Dinas Pendidikan Kecamatan'
          : role === 'PENGAWAS_SEKOLAH'
          ? 'Pengawas Sekolah'
          : role === 'PUBLIK'
          ? 'Akses Publik (Masyarakat / Wali Murid)'
          : role === 'OPERATOR_SEKOLAH'
          ? 'Operator Sekolah'
          : 'Kepala Sekolah'
      }.`,
      type: 'info'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] font-sans text-white overflow-x-hidden flex flex-col md:items-center md:py-8 md:px-4">
      
      {/* Container simulating a high-end Android Tablet view frame with Premium Frosted Glass */}
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl md:rounded-[2rem] md:border md:border-white/20 shadow-2xl overflow-hidden flex flex-col min-h-screen md:min-h-[880px]">
        
        {/* Android Native-Style Top Status Bar (Immersive visual context in Frosted Dark) */}
        <div className="bg-black/30 backdrop-blur-md text-white/90 text-[11px] font-sans h-8 px-4 flex items-center justify-between pointer-events-none select-none border-b border-white/10">
          <div className="font-extrabold tracking-tight">{selectedTime}</div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-white/25 border border-white/25 px-1.5 py-0.5 rounded-full text-white font-black tracking-wider shadow-sm">
              PPDB 2026/2027
            </span>
            <Wifi className="w-3.5 h-3.5" />
            <Signal className="w-3.5 h-3.5" />
            <BatteryMedium className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
        </div>

        {/* Dynamic App Header with Glassy Design */}
        <div className="p-5 border-b border-white/15 bg-white/10 backdrop-blur-xl flex flex-col gap-4">
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/25 rounded-2xl text-white border border-white/35 shadow-lg">
                <Building2 className="w-[1.375rem] h-[1.375rem]" />
              </div>
              <div className="space-y-1">
                <h1 className="text-base font-black tracking-wider text-white flex items-center gap-2">
                  E-PENDATAAN SISWA BARU
                  <span className="hidden sm:inline-block px-2.5 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]">Active</span>
                </h1>
                <p className="text-[11px] text-white/70 font-bold uppercase tracking-[0.1em]">
                  Kecamatan Lemahabang • TP 2026/2027
                </p>
              </div>
            </div>

            {/* Status indicator on the right side of the header */}
            <div className="flex items-center gap-2 justify-end relative">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-300">Sistem Online</span>
            </div>
          </div>

          {/* Role Status and school switcher belt with Sleek Glass container */}
          <div className="p-3.5 bg-black/15 backdrop-blur-md border border-white/15 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-1 px-3 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                Akses Peran:
              </div>
              
              {/* Role Select Buttons with beautiful white glass states */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleRoleChange('ADMIN_DINAS')}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'ADMIN_DINAS'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Admin Dinas
                </button>
                <button
                  onClick={() => handleRoleChange('KEPALA_SEKOLAH')}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'KEPALA_SEKOLAH'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Kepala Sekolah
                </button>
                <button
                  onClick={() => handleRoleChange('OPERATOR_SEKOLAH')}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'OPERATOR_SEKOLAH'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Operator
                </button>
                <button
                  onClick={() => handleRoleChange('PENGAWAS_SEKOLAH')}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'PENGAWAS_SEKOLAH'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Pengawas
                </button>
                <button
                  onClick={() => handleRoleChange('PUBLIK')}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'PUBLIK'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Publik
                </button>
              </div>
            </div>

            {/* Scope info & school filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-white/70 uppercase tracking-wider">Cakupan Unit:</span>
              
              {currentRole === 'KEPALA_SEKOLAH' || currentRole === 'OPERATOR_SEKOLAH' ? (
                <select
                  value={activeSchool}
                  onChange={(e) => setActiveSchool(e.target.value)}
                  className="px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                >
                  {!activeSchool && <option value="" disabled>Pilih Sekolah Anda...</option>}
                  {LIST_SEKOLAH.map(s => (
                    <option key={s.id} value={s.nama} className="text-slate-800">{s.nama}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={activeSchool}
                  onChange={(e) => setActiveSchool(e.target.value)}
                  className="px-3 py-1 bg-white/15 backdrop-blur-md font-bold text-[10px] uppercase tracking-wide border border-white/20 rounded-xl cursor-pointer text-white focus:bg-slate-900 focus:text-white focus:outline-none transition-all duration-200"
                >
                  <option value="" className="text-slate-800">Semua Sekolah Kecamatan</option>
                  <optgroup label="Tingkat SD" className="text-slate-800">
                    {LIST_SEKOLAH.filter(s => s.jenjang === 'SD').map(s => (
                      <option key={s.id} value={s.nama} className="text-slate-800">{s.nama}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Tingkat TK" className="text-slate-800">
                    {LIST_SEKOLAH.filter(s => s.jenjang === 'TK').map(s => (
                      <option key={s.id} value={s.nama} className="text-slate-800">{s.nama}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Tingkat KB" className="text-slate-800">
                    {LIST_SEKOLAH.filter(s => s.jenjang === 'KB').map(s => (
                      <option key={s.id} value={s.nama} className="text-slate-800">{s.nama}</option>
                    ))}
                  </optgroup>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* ---- TAB 1: DASHBOARD MONITORING REAL-TIME ---- */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              siswaBaru={siswaBaru}
              alumni={alumni}
              logs={logs}
              activeSchool={activeSchool}
              kpis={kpis}
              onExportSiswa={() => exportSiswaBaruToCSV(siswaBaru)}
              onExportAlumni={() => exportAlumniToCSV(alumni)}
            />
          )}


          {activeTab === 'siswa_baru' && (
            <SiswaBaruPage
              siswaBaru={siswaBaru}
              activeSchool={activeSchool}
              isReadOnly={isReadOnly}
              currentRole={currentRole}
              onSaveStudent={handleSaveStudent}
              onEditStudent={function (_s: SiswaBaru | null) {}}
              onDeleteStudent={(id, name, school) => {
                setConfirmDelete({ type: 'siswa', id, name, school });
              }}
            />
          )}

          {/* ---- TAB 3: ALUMNI ---- */}
          {activeTab === 'alumni' && (
            <AlumniPage
              alumni={alumni}
              activeSchool={activeSchool}
              isReadOnly={isReadOnly}
              userRole={currentRole}
              kpis={{ continuing: kpis.continuing, notContinuing: kpis.notContinuing }}
              onSaveAlumni={handleSaveAlumni}
              onEditAlumni={function (_a: AlumniSD | null) {}}
              onDeleteAlumni={(id, name, school) => setConfirmDelete({ type: 'alumni', id, name, school })}
            />
          )}

          {/* ---- TAB 4: REKAP SEKOLAH ---- */}
          {activeTab === 'rekap_sekolah' && (
            <RekapSekolahPage
              siswaBaru={siswaBaru}
              alumni={alumni}
              activeSchool={activeSchool}
              setActiveSchool={setActiveSchool}
              setActiveTab={setActiveTab}
            />
          )}

        </main>

        {/* Immersive Android Bottom Navigation Bar (Immersive Glassy Layout) */}
        <nav className="w-full h-16 flex-shrink-0 bg-black/40 backdrop-blur-xl border-t border-white/20 flex justify-around items-center px-2 md:rounded-b-[2rem]">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-[350ms] ${
              activeTab === 'dashboard'
                ? 'text-yellow-300 font-extrabold scale-105'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Building className="w-5 h-5" />
            <span className="text-[10px] tracking-tight uppercase font-bold">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('siswa_baru')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-[350ms] ${
              activeTab === 'siswa_baru'
                ? 'text-yellow-300 font-extrabold scale-105'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight uppercase font-bold">Siswa Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('alumni')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-[350ms] ${
              activeTab === 'alumni'
                ? 'text-yellow-300 font-extrabold scale-105'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] tracking-tight uppercase font-bold">Alumni & Transisi</span>
          </button>

          <button
            onClick={() => setActiveTab('rekap_sekolah')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-[350ms] ${
              activeTab === 'rekap_sekolah'
                ? 'text-yellow-300 font-extrabold scale-105'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] tracking-tight uppercase font-bold">Rekap Unit</span>
          </button>

        </nav>

        <ConfirmModal
          open={!!confirmDelete}
          title={confirmDelete?.type === 'siswa' ? 'Hapus Rekapitulasi' : 'Hapus Data Alumni'}
          message={
            confirmDelete?.type === 'siswa'
              ? `Apakah Anda yakin ingin menghapus laporan rekapitulasi ${confirmDelete?.name}?`
              : `Apakah Anda yakin ingin menghapus data alumni ${confirmDelete?.name}?`
          }
          variant="danger"
          confirmLabel={confirmDelete?.type === 'siswa' ? 'Ya, Hapus' : 'Ya, Hapus'}
          onConfirm={() => {
            if (confirmDelete?.type === 'siswa') {
              handleDeleteStudent(confirmDelete.id, confirmDelete.name, confirmDelete.school);
            } else if (confirmDelete?.type === 'alumni') {
              handleDeleteAlumni(confirmDelete.id, confirmDelete.name, confirmDelete.school);
            }
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />

      </div>

    </div>
  );
}
