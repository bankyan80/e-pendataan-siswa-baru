/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SiswaBaru,
  AlumniSD,
  UserRole,
  Jenjang,
  ActivityLog
} from './types';
import {
  INITIAL_SISWA_BARU,
  INITIAL_ALUMNI,
  INITIAL_LOGS,
  LIST_SEKOLAH
} from './data/initialData';
import {
  fetchSiswaBaru,
  fetchAlumni,
  fetchLogs,
  upsertSiswaBaru,
  upsertAlumni,
  upsertLogs,
  deleteSiswaBaru as dbDeleteSiswaBaru,
  deleteAlumni as dbDeleteAlumni,
} from './services/database';

// Components
import ConfirmModal from './components/ConfirmModal';
import LoginModal from './components/LoginModal';
import DashboardPage from './components/DashboardPage';
import SiswaBaruPage from './components/SiswaBaruPage';
import AlumniPage from './components/AlumniPage';
import RekapSekolahPage from './components/RekapSekolahPage';

// Icons
import {
  Signal,
  Wifi,
  BatteryMedium,
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
  const [siswaBaru, setSiswaBaru] = useState<SiswaBaru[]>([]);
  const [alumni, setAlumni] = useState<AlumniSD[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [currentRole, setCurrentRole] = useState<UserRole>('PUBLIK');
  
  const [activeSchool, setActiveSchool] = useState<string>('');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  
  const isReadOnly = currentRole === 'PENGAWAS_SEKOLAH' || currentRole === 'PENILIK' || currentRole === 'PUBLIK' || currentRole === 'KEPALA_SEKOLAH' || (currentRole === 'OPERATOR_SEKOLAH' && !activeSchool);
  
  const jenjangFilter = currentRole === 'PENGAWAS_SEKOLAH' ? (['SD', 'TK'] as Jenjang[]) : currentRole === 'PENILIK' ? (['KB'] as Jenjang[]) : null;

  // Pre-filter data by jenjang before passing to pages
  const filteredSiswaBaru = useMemo(() => jenjangFilter ? siswaBaru.filter(s => jenjangFilter.includes(s.jenjang)) : siswaBaru, [siswaBaru, jenjangFilter]);
  const filteredAlumni = useMemo(() => jenjangFilter ? alumni.filter(a => {
    const s = LIST_SEKOLAH.find(s => s.nama === a.sekolahAsal);
    return s && jenjangFilter.includes(s.jenjang);
  }) : alumni, [alumni, jenjangFilter]);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'siswa_baru' | 'alumni' | 'rekap_sekolah'>(() => {
    const saved = localStorage.getItem('active_tab');
    if (saved === 'siswa_baru' || saved === 'alumni' || saved === 'rekap_sekolah' || saved === 'dashboard') return saved;
    return 'dashboard';
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'siswa' | 'alumni';
    id: string;
    name: string;
    school: string;
  } | null>(null);

  const noopEditSiswa = useCallback(function (_s: SiswaBaru | null) {}, []);
  const noopEditAlumni = useCallback(function (_a: AlumniSD | null) {}, []);

  // --- LOAD DATA FROM BACKEND ---
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [fetchedSiswa, fetchedAlumni, fetchedLogs] = await Promise.all([
          fetchSiswaBaru(),
          fetchAlumni(),
          fetchLogs(),
        ]);
        if (cancelled) return;

        // Seed initial data if backend is empty
        const finalSiswa = fetchedSiswa.length > 0 ? fetchedSiswa : INITIAL_SISWA_BARU;
        const finalAlumni = fetchedAlumni.length > 0 ? fetchedAlumni : INITIAL_ALUMNI;
        const finalLogs = fetchedLogs.length > 0 ? fetchedLogs : INITIAL_LOGS;

        // If we seeded, push to backend
        if (fetchedSiswa.length === 0 && INITIAL_SISWA_BARU.length > 0) {
          upsertSiswaBaru(INITIAL_SISWA_BARU).catch(() => {});
        }
        if (fetchedAlumni.length === 0 && INITIAL_ALUMNI.length > 0) {
          upsertAlumni(INITIAL_ALUMNI).catch(() => {});
        }

        setSiswaBaru(finalSiswa);
        setAlumni(finalAlumni);
        setLogs(finalLogs);
      } catch {
        // Fallback to localStorage if backend fails
        const saved = localStorage.getItem('siswa_baru_real');
        try {
          const local: SiswaBaru[] = saved ? JSON.parse(saved) : INITIAL_SISWA_BARU;
          const validNames = new Set(LIST_SEKOLAH.map(s => s.nama));
          const filtered = local.filter(s => s && validNames.has(s.sekolahTujuan));
          const existing = new Set(filtered.map(s => s.sekolahTujuan));
          const missing = INITIAL_SISWA_BARU.filter(s => s && !existing.has(s.sekolahTujuan));
          setSiswaBaru(missing.length > 0 ? [...filtered, ...missing] : filtered);
        } catch { setSiswaBaru(INITIAL_SISWA_BARU); }

        try { setAlumni(saved ? JSON.parse(localStorage.getItem('alumni_sd_real') || '[]') : INITIAL_ALUMNI); } catch { setAlumni(INITIAL_ALUMNI); }
        try { setLogs(saved ? JSON.parse(localStorage.getItem('activity_logs_real') || '[]') : INITIAL_LOGS); } catch { setLogs(INITIAL_LOGS); }
      }
      if (!cancelled) setDataLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // --- PERSIST TO BACKEND ON CHANGE ---
  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('siswa_baru_real', JSON.stringify(siswaBaru));
    upsertSiswaBaru(siswaBaru).catch(() => {});
  }, [siswaBaru, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('alumni_sd_real', JSON.stringify(alumni));
    upsertAlumni(alumni).catch(() => {});
  }, [alumni, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('activity_logs_real', JSON.stringify(logs));
    upsertLogs(logs).catch(() => {});
  }, [logs, dataLoaded]);

  // Redirect non-admin away from rekap_sekolah tab
  useEffect(() => {
    if (activeTab === 'rekap_sekolah' && currentRole !== 'ADMIN_DINAS') {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentRole]);

  useEffect(() => {
    try { localStorage.setItem('active_tab', activeTab); } catch {}
  }, [activeTab]);

  const [selectedTime, setSelectedTime] = useState('10:15');

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

  // --- DERIVED METRICS ---
  // Overall Global Counts for KPI cards (taking into account selected school if any)
  const kpis = useMemo(() => {
    const listSiswa = activeSchool 
      ? filteredSiswaBaru.filter(s => s.sekolahTujuan === activeSchool) 
      : filteredSiswaBaru;
    
    const listAlumni = activeSchool 
      ? filteredAlumni.filter(a => a.sekolahAsal === activeSchool) 
      : filteredAlumni;

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
    dbDeleteSiswaBaru(id).catch(() => {});
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

  const handleDeleteAlumni = (id: string, name: string, school: string) => {
    setAlumni(prev => prev.filter(a => a.id !== id));
    dbDeleteAlumni(id).catch(() => {});
    const newLog: ActivityLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      role: currentRole,
      actorName: `Admin (${school})`,
      action: 'Hapus Alumni',
      detail: `Menghapus data alumni ${name}.`,
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

  // Switch role and update UI context safely
  const handleRoleChange = (role: UserRole) => {
    // If already on this role, skip the modal
    if (role === currentRole) {
      return;
    }
    
    // ADMIN_DINAS, OPERATOR_SEKOLAH, and KEPALA_SEKOLAH require PIN
    if (role === 'ADMIN_DINAS' || role === 'OPERATOR_SEKOLAH' || role === 'KEPALA_SEKOLAH') {
      setPendingRole(role);
      setShowLoginModal(true);
      return;
    }
    
    setCurrentRole(role);
    setActiveSchool('');
    
    // Add logging
    const newLog: ActivityLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      role,
      actorName: role === 'PENGAWAS_SEKOLAH' ? 'Pengawas' : role === 'PENILIK' ? 'Penilik' : 'Masyarakat (Publik)',
      action: 'Login',
      detail: `Mengganti mode akses dashboard menjadi ${
        role === 'PENGAWAS_SEKOLAH'
          ? 'Pengawas Sekolah'
          : role === 'PENILIK'
          ? 'Penilik'
          : 'Akses Publik (Masyarakat / Wali Murid)'
      }.`,
      type: 'info'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleLoginSuccess = (pin: string) => {
    setShowLoginModal(false);

    if (!pendingRole) return;

    if (pendingRole === 'ADMIN_DINAS') {
      if (pin !== '637238') {
        setShowLoginModal(true);
        return;
      }
      setCurrentRole('ADMIN_DINAS');
      setActiveSchool('');
      setPinAuthenticated(true);
      const newLog: ActivityLog = {
        id: generateId('log'), timestamp: new Date().toISOString(),
        role: 'ADMIN_DINAS', actorName: 'Tim Dinas', action: 'Login',
        detail: 'Login sebagai Admin Dinas',
        type: 'info'
      };
      setLogs(prev => [newLog, ...prev]);
      setPendingRole(null);
      return;
    }

    // OPERATOR_SEKOLAH or KEPALA_SEKOLAH — PIN = NPSN
    const school = LIST_SEKOLAH.find(s => s.npsn === pin);
    if (!school) {
      setShowLoginModal(true);
      return;
    }

    setCurrentRole(pendingRole);
    setActiveSchool(school.nama);
    setPinAuthenticated(true);

    const roleName = pendingRole === 'KEPALA_SEKOLAH' ? 'Kepala Sekolah' : 'Operator';
    const newLog: ActivityLog = {
      id: generateId('log'), timestamp: new Date().toISOString(),
      role: pendingRole, actorName: roleName, action: 'Login',
      detail: `Login sebagai ${roleName} di ${school.nama} (NPSN: ${pin})`,
      type: 'info'
    };
    setLogs(prev => [newLog, ...prev]);
    setPendingRole(null);
  };

  const handleLogout = () => {
    setPinAuthenticated(false);
    setCurrentRole('ADMIN_DINAS');
    setActiveSchool('');

    const newLog: ActivityLog = {
      id: generateId('log'), timestamp: new Date().toISOString(),
      role: 'ADMIN_DINAS', actorName: 'Tim Dinas', action: 'Logout',
      detail: 'Keluar dari sesi',
      type: 'info'
    };
    setLogs(prev => [newLog, ...prev]);

    // Re-show PIN modal for ADMIN_DINAS
    setPendingRole('ADMIN_DINAS');
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] font-sans text-white overflow-x-hidden flex flex-col md:items-center md:py-8 md:px-4">
      
      {/* Container simulating a high-end Android Tablet view frame with Premium Frosted Glass */}
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl md:rounded-[2rem] md:border md:border-white/20 shadow-2xl overflow-hidden flex flex-col h-screen md:h-[880px]">
        
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
        <div className="p-3 md:p-5 border-b border-white/15 bg-white/10 backdrop-blur-xl flex flex-col gap-2 md:gap-4">
          
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1 md:p-1.5 bg-white/25 rounded-2xl text-white border border-white/35 shadow-lg overflow-hidden">
                <img src="/logokab.png" alt="Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
              </div>
              <div className="space-y-1">
                <h1 className="text-sm md:text-base font-black tracking-wider text-white flex items-center gap-2">
                  E-PENDATAAN SISWA BARU
                  <span className="hidden sm:inline-block px-2.5 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]">Active</span>
                </h1>
                <p className="text-[10px] md:text-[11px] text-white/70 font-bold uppercase tracking-[0.1em]">
                  Kec. Lemahabang • TP 2026/2027
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
          <div className="p-2 md:p-3.5 bg-black/15 backdrop-blur-md border border-white/15 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3 shadow-inner">
            <div className="flex items-center gap-1.5 md:gap-2.5 min-w-0">
              <div className="shrink-0 p-1 px-2 md:px-3 bg-white/20 text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/20">
                Peran:
              </div>
              
              {/* Role Select Buttons with beautiful white glass states */}
              <div className="flex gap-1 md:gap-1.5 overflow-x-auto flex-nowrap pb-0.5 scrollbar-none">
                <button
                  onClick={() => handleRoleChange('ADMIN_DINAS')}
                  className={`shrink-0 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'ADMIN_DINAS'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRoleChange('KEPALA_SEKOLAH')}
                  className={`shrink-0 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'KEPALA_SEKOLAH'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Kepsek
                </button>
                <button
                  onClick={() => handleRoleChange('OPERATOR_SEKOLAH')}
                  className={`shrink-0 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'OPERATOR_SEKOLAH'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Operator
                </button>
                <button
                  onClick={() => handleRoleChange('PENGAWAS_SEKOLAH')}
                  className={`shrink-0 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'PENGAWAS_SEKOLAH'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Pengawas
                </button>
                <button
                  onClick={() => handleRoleChange('PENILIK')}
                  className={`shrink-0 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                    currentRole === 'PENILIK'
                      ? 'bg-white text-slate-800 font-bold shadow-lg scale-[1.02] border border-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Penilik
                </button>
                <button
                  onClick={() => handleRoleChange('PUBLIK')}
                  className={`shrink-0 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
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
            {currentRole !== 'PENGAWAS_SEKOLAH' && currentRole !== 'PENILIK' && (
            <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
              <span className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-wider whitespace-nowrap">Unit:</span>
              
              {currentRole === 'KEPALA_SEKOLAH' || currentRole === 'OPERATOR_SEKOLAH' ? (
                activeSchool ? (
                  <div className="flex items-center gap-1 md:gap-2 min-w-0">
                    <span className="px-2 md:px-3 py-1 md:py-1.5 bg-white/20 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-lg truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs">
                      {activeSchool}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg bg-rose-500/30 text-rose-200 text-[9px] md:text-[10px] font-black uppercase tracking-wider hover:bg-rose-500/50 transition-all border border-rose-400/30"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="px-2 md:px-3 py-1 md:py-1.5 bg-white/10 text-white/60 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10 whitespace-nowrap">
                    Login dulu
                  </div>
                )
              ) : (
                <select
                  value={activeSchool}
                  onChange={(e) => setActiveSchool(e.target.value)}
                  className="px-2 md:px-3 py-1 bg-white/15 backdrop-blur-md font-bold text-[9px] md:text-[10px] uppercase tracking-wide border border-white/20 rounded-xl cursor-pointer text-white focus:bg-slate-900 focus:text-white focus:outline-none transition-all duration-200 max-w-[160px] sm:max-w-full"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="text-white">Semua Sekolah</option>
                  {jenjangFilter
                    ? LIST_SEKOLAH.filter(s => jenjangFilter.includes(s.jenjang)).map(s => (
                        <option key={s.id} value={s.nama} className="text-white">{s.nama}</option>
                      ))
                    : <>
                        <optgroup label="SD" className="text-slate-300">
                          {LIST_SEKOLAH.filter(s => s.jenjang === 'SD').map(s => (
                            <option key={s.id} value={s.nama} className="text-white">{s.nama}</option>
                          ))}
                        </optgroup>
                        <optgroup label="TK" className="text-slate-300">
                          {LIST_SEKOLAH.filter(s => s.jenjang === 'TK').map(s => (
                            <option key={s.id} value={s.nama} className="text-white">{s.nama}</option>
                          ))}
                        </optgroup>
                        <optgroup label="KB" className="text-slate-300">
                          {LIST_SEKOLAH.filter(s => s.jenjang === 'KB').map(s => (
                            <option key={s.id} value={s.nama} className="text-white">{s.nama}</option>
                          ))}
                        </optgroup>
                      </>
                  }
                </select>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 space-y-6">

          {currentRole === 'OPERATOR_SEKOLAH' && !activeSchool && (
            <div className="p-4 bg-amber-500/20 backdrop-blur-md border border-amber-400/30 rounded-2xl text-amber-100 text-xs font-bold text-center">
              Pilih sekolah terlebih dahulu pada menu Cakupan Unit untuk mengedit data.
            </div>
          )}

          {/* ---- TAB 1: DASHBOARD MONITORING REAL-TIME ---- */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              siswaBaru={filteredSiswaBaru}
              alumni={filteredAlumni}
              activeSchool={activeSchool}
              kpis={kpis}
              currentRole={currentRole}
            />
          )}


          {activeTab === 'siswa_baru' && (
            <SiswaBaruPage
              siswaBaru={filteredSiswaBaru}
              activeSchool={activeSchool}
              isReadOnly={isReadOnly}
              currentRole={currentRole}
              onSaveStudent={handleSaveStudent}
              onEditStudent={noopEditSiswa}
              onDeleteStudent={(id, name, school) => {
                setConfirmDelete({ type: 'siswa', id, name, school });
              }}
            />
          )}

          {/* ---- TAB 3: ALUMNI ---- */}
          {activeTab === 'alumni' && (
            <AlumniPage
              alumni={filteredAlumni}
              activeSchool={activeSchool}
              isReadOnly={isReadOnly}
              userRole={currentRole}
              kpis={{ continuing: kpis.continuing, notContinuing: kpis.notContinuing }}
              onSaveAlumni={handleSaveAlumni}
              onEditAlumni={noopEditAlumni}
              onDeleteAlumni={(id, name, school) => setConfirmDelete({ type: 'alumni', id, name, school })}
            />
          )}

          {/* ---- TAB 4: REKAP SEKOLAH ---- */}
          {activeTab === 'rekap_sekolah' && (
            <RekapSekolahPage
              siswaBaru={filteredSiswaBaru}
              alumni={filteredAlumni}
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

          {currentRole === 'ADMIN_DINAS' && (
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
          )}

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

        {showLoginModal && pendingRole && (
          <LoginModal
            role={pendingRole}
            onSuccess={handleLoginSuccess}
            onCancel={() => {
              setShowLoginModal(false);
              setPendingRole(null);
              if (!pinAuthenticated) {
                setCurrentRole('PUBLIK');
              }
            }}
          />
        )}

      </div>

    </div>
  );
}
