/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SiswaBaru, Jenjang, StatusVerifikasi, UserRole } from '../types';
import { LIST_SEKOLAH } from '../data/initialData';
import { X, AlertCircle, Info, Calendar, School, Check } from 'lucide-react';

interface SiswaBaruFormProps {
  id: string;
  student?: SiswaBaru | null;
  onSave: (student: SiswaBaru) => void;
  onClose: () => void;
  userRole: UserRole;
  userSchool?: string; // If school head
}

export default function SiswaBaruForm({
  id,
  student,
  onSave,
  onClose,
  userRole,
  userSchool
}: SiswaBaruFormProps) {
  const isEdit = !!student;
  const isReadOnly = userRole === 'PENGAWAS_SEKOLAH' || userRole === 'PUBLIK';

  const [sekolahTujuan, setSekolahTujuan] = useState('');
  const [jenjang, setJenjang] = useState<Jenjang>('SD');
  
  // For SD (Gender & Paths)
  const [lakiLaki, setLakiLaki] = useState(0);
  const [perempuan, setPerempuan] = useState(0);
  const [domisili, setDomisili] = useState(0);
  const [afirmasi, setAfirmasi] = useState(0);
  const [mutasi, setMutasi] = useState(0);
  const [umum, setUmum] = useState(0);

  // For TK/KB (Age Groups)
  const [kelompokA, setKelompokA] = useState(0);
  const [kelompokB, setKelompokB] = useState(0);

  const [statusVerifikasi, setStatusVerifikasi] = useState<StatusVerifikasi>('Diproses');
  const [catatan, setCatatan] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Filter schools based on selected jenjang
  const filteredSchools = LIST_SEKOLAH.filter(s => s.jenjang === jenjang);

  // Auto-set school and fields
  useEffect(() => {
    if (student) {
      setSekolahTujuan(student.sekolahTujuan);
      setJenjang(student.jenjang);
      setLakiLaki(student.lakiLaki || 0);
      setPerempuan(student.perempuan || 0);
      setDomisili(student.domisili || 0);
      setAfirmasi(student.afirmasi || 0);
      setMutasi(student.mutasi || 0);
      setUmum(student.umum || 0);
      setKelompokA(student.kelompokA || 0);
      setKelompokB(student.kelompokB || 0);
      setStatusVerifikasi(student.statusVerifikasi);
      setCatatan(student.catatan || '');
    } else {
      setLakiLaki(0);
      setPerempuan(0);
      setDomisili(0);
      setAfirmasi(0);
      setMutasi(0);
      setUmum(0);
      setKelompokA(0);
      setKelompokB(0);
      setStatusVerifikasi('Diproses');
      setCatatan('');

      // Auto assign if Kepala Sekolah
      if (userRole === 'KEPALA_SEKOLAH' && userSchool) {
        setSekolahTujuan(userSchool);
        const matchedSchool = LIST_SEKOLAH.find(s => s.nama === userSchool);
        if (matchedSchool) {
          setJenjang(matchedSchool.jenjang);
        }
      } else {
        const firstSchool = LIST_SEKOLAH.find(s => s.jenjang === 'SD');
        setSekolahTujuan(firstSchool ? firstSchool.nama : '');
        setJenjang('SD');
      }
    }
  }, [student, userRole, userSchool]);

  // Adjust school list and selected school when jenjang changes
  const handleJenjangChange = (val: Jenjang) => {
    setJenjang(val);
    const schools = LIST_SEKOLAH.filter(s => s.jenjang === val);
    if (schools.length > 0) {
      setSekolahTujuan(schools[0].nama);
    } else {
      setSekolahTujuan('');
    }
    // Clear outputs
    setLakiLaki(0);
    setPerempuan(0);
    setDomisili(0);
    setAfirmasi(0);
    setMutasi(0);
    setUmum(0);
    setKelompokA(0);
    setKelompokB(0);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!sekolahTujuan) {
      newErrors.sekolahTujuan = 'Harap pilih sekolah terlebih dahulu';
    }

    if (jenjang === 'SD') {
      const totalGender = (lakiLaki || 0) + (perempuan || 0);
      const totalJalur = (domisili || 0) + (afirmasi || 0) + (mutasi || 0) + (umum || 0);

      if (totalGender === 0) {
        newErrors.totals = 'Jumlah siswa baru tidak boleh nol';
      }

      if (totalGender !== totalJalur) {
        newErrors.mismatch = `Jumlah gender (${totalGender}) dan jumlah jalur (${totalJalur}) tidak selaras.`;
      }
    } else {
      const totalAgeGroups = (kelompokA || 0) + (kelompokB || 0);
      if (totalAgeGroups === 0) {
        newErrors.totals = 'Jumlah siswa kelompok A & B tidak boleh kosong';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;

    const data: SiswaBaru = {
      id: student?.id || `sb_sch_${Date.now()}`,
      sekolahTujuan,
      jenjang,
      lakiLaki: jenjang === 'SD' ? lakiLaki : 0,
      perempuan: jenjang === 'SD' ? perempuan : 0,
      domisili: jenjang === 'SD' ? domisili : 0,
      afirmasi: jenjang === 'SD' ? afirmasi : 0,
      mutasi: jenjang === 'SD' ? mutasi : 0,
      umum: jenjang === 'SD' ? umum : 0,
      kelompokA: jenjang !== 'SD' ? kelompokA : 0,
      kelompokB: jenjang !== 'SD' ? kelompokB : 0,
      statusVerifikasi,
      tanggalDaftar: student?.id ? (student.tanggalDaftar || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      catatan: catatan.trim()
    };

    onSave(data);
  };

  const sumGender = (lakiLaki || 0) + (perempuan || 0);
  const sumJalur = (domisili || 0) + (afirmasi || 0) + (mutasi || 0) + (umum || 0);
  const isMismatch = jenjang === 'SD' && sumGender !== sumJalur;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end md:items-center md:justify-center p-0 md:p-4 animate-fade-in backdrop-blur-sm">
      <div
        id={id}
        className="bg-white dark:bg-slate-900 w-full max-w-lg h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[2.5rem] md:rounded-[2rem] flex flex-col shadow-2xl overflow-hidden self-end md:self-auto transition-all transform duration-300 translate-y-0 border-t border-white/20"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-600" />
              {isEdit ? 'Ubah Rekap Pendaftar' : 'Tambah Rekap Pendaftaran baru'}
            </h3>
            <p className="text-xs text-slate-600 font-medium">Input Rekapitulasi Siswa Baru TP 2026/2027</p>
          </div>
          <button
            id="btn_form_close"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Information banner */}
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-slate-700 text-xs flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-extrabold text-indigo-950">Aturan Pendataan Pokok:</p>
              <ul className="list-disc pl-4 space-y-0.5 font-medium text-slate-600">
                <li>SD menginput rekap terbagi atas <strong>Gender</strong> dan <strong>Jalur Masuk</strong></li>
                <li>TK & KB menginput rekap usia terbagi atas <strong>Kelompok A (4-5 tahun)</strong> dan <strong>Kelompok B (5-6 tahun)</strong></li>
              </ul>
            </div>
          </div>

          {/* Jenjang Selection Button Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-400 block uppercase tracking-wider">Jenjang Pendidikan</label>
            <div className="grid grid-cols-3 gap-2">
              {(['SD', 'TK', 'KB'] as Jenjang[]).map(jen => (
                <button
                  key={jen}
                  type="button"
                  disabled={userRole === 'KEPALA_SEKOLAH' || isReadOnly} // Lock jenjang if school head or read-only
                  onClick={() => handleJenjangChange(jen)}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition flex flex-col items-center justify-center border ${
                    jenjang === jen
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base font-extrabold">{jen}</span>
                  <span className="text-[8px] font-medium opacity-85">
                    {jen === 'SD' ? 'Sekolah Dasar' : jen === 'TK' ? 'Taman Kanak' : 'Kelompok Bermain'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sekolah Tujuan Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-400 block uppercase tracking-wider">Nama Lembaga Pendidikan</label>
            {userRole === 'KEPALA_SEKOLAH' || isReadOnly ? (
              <div className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-black text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                {sekolahTujuan}
              </div>
            ) : (
              <select
                value={sekolahTujuan}
                onChange={(e) => setSekolahTujuan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Pilih Lembaga --</option>
                {filteredSchools.map(sch => (
                  <option key={sch.id} value={sch.nama}>{sch.nama}</option>
                ))}
              </select>
            )}
            {errors.sekolahTujuan && (
              <span className="text-xs text-rose-600 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.sekolahTujuan}
              </span>
            )}
          </div>

          {/* DYNAMIC FORM SEGMENTS */}

          {jenjang === 'SD' ? (
            /* --- REGISTRATION INPUTS FOR SD (GENDER & JALUR) --- */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wider">1. Ringkasan Gender (Laki-laki & Perempuan)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Laki-Laki (L)</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={lakiLaki || ''}
                      onChange={(e) => setLakiLaki(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Jumlah L"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-sm text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Perempuan (P)</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={perempuan || ''}
                      onChange={(e) => setPerempuan(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Jumlah P"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-sm text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-black text-slate-700 bg-slate-200/50 p-2 rounded-xl">
                  <span>GRAND TOTAL SISWA BARU:</span>
                  <span className="text-indigo-700 text-sm">{sumGender} Siswa</span>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-indigo-50/55 border border-indigo-100 space-y-3">
                <h4 className="text-xs font-black text-slate-900 border-b border-indigo-200 pb-1.5 uppercase tracking-wider text-indigo-950">2. Ringkasan Jalur Pendaftaran</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wide block">Zonasi / Domisili</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={domisili || ''}
                      onChange={(e) => setDomisili(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Jumlah"
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wide block">Afirmasi (KIP)</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={afirmasi || ''}
                      onChange={(e) => setAfirmasi(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Jumlah"
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wide block">Perpindahan Mutasi</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={mutasi || ''}
                      onChange={(e) => setMutasi(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Jumlah"
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wide block">Jalur Umum</label>
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={umum || ''}
                      onChange={(e) => setUmum(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Jumlah"
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-black text-indigo-950 bg-indigo-200/40 p-2 rounded-xl">
                  <span>TOTAL REKAP JALUR MASUK:</span>
                  <span className="text-indigo-800 text-sm">{sumJalur} Kuota</span>
                </div>

                {isMismatch ? (
                  <div className="p-2.5 bg-red-100 border border-red-200 rounded-xl text-[11px] text-red-800 font-bold flex gap-1.5 items-center">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>L/P ({sumGender}) dan Jumlah Jalur ({sumJalur}) berbeda! Sesuaikan agar seimbang.</span>
                  </div>
                ) : (
                  sumGender > 0 && (
                    <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-bold flex gap-1.5 items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Data Gender & Jalur Terpenuhi & Seimbang</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            /* --- REGISTRATION INPUTS FOR TK & KB (AGE GROUPS) --- */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-200 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Ringkasan Rentang Usia Siswa Baru</h4>
                  <p className="text-[10px] text-slate-600 font-bold italic leading-relaxed">
                    Khusus jenjang PAUD (TK & KB), laporan diinput akumulatif per kategori rombongan belajar usia.
                  </p>
                </div>

                {/* Kelompok A */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase border border-amber-200">Kelompok A</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">Usia 4 - 5 Tahun</p>
                    <p className="text-[10px] text-slate-400 font-medium">Usia minimal 4.0 tahun sampai maksimal 5.0 tahun</p>
                  </div>
                  
                  <div className="w-24">
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={kelompokA || ''}
                      onChange={(e) => setKelompokA(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0 Anak"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-sm text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Kelompok B */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-black uppercase border border-blue-200">Kelompok B</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">Usia 5 - 6 Tahun</p>
                    <p className="text-[10px] text-slate-400 font-medium">Usia minimal 5.0 tahun sampai maksimal 6.0 tahun</p>
                  </div>
                  
                  <div className="w-24">
                    <input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      value={kelompokB || ''}
                      onChange={(e) => setKelompokB(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0 Anak"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-sm text-center disabled:bg-slate-200 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-black text-amber-950 bg-amber-500/10 p-3 rounded-2xl">
                  <span>TOTAL PENDAFTAR SISWA BARU:</span>
                  <span className="text-amber-800 text-sm font-black">{(kelompokA || 0) + (kelompokB || 0)} Anak</span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Status (Only editable for Dinas and Kepala Sekolah) */}
          <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status Berkas Laporan</span>
              {isReadOnly && (
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Hanya Baca
                </span>
              )}
            </div>

            {isReadOnly ? (
              <div className="flex items-center gap-2 text-sm font-semibold mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    statusVerifikasi === 'Diverifikasi'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : statusVerifikasi === 'Ditolak'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {statusVerifikasi}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(['Diproses', 'Diverifikasi', 'Ditolak'] as StatusVerifikasi[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusVerifikasi(st)}
                    className={`py-1.5 rounded-xl text-xs font-black transition border ${
                      statusVerifikasi === st
                        ? st === 'Diverifikasi'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : st === 'Ditolak'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1.5 mt-2">
              <label className="text-[10px] font-black text-slate-600 block uppercase tracking-wide">
                Catatan Verifikasi / Keterangan Penunjang
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="cth: berkas berita acara fisik telah disahkan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none disabled:bg-slate-200 disabled:text-slate-400"
              />
            </div>
          </div>

          {errors.totals && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-extrabold flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errors.totals}</span>
            </div>
          )}

          {errors.mismatch && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-extrabold flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errors.mismatch}</span>
            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 dark:bg-slate-900/55 flex gap-2 justify-end">
          {isReadOnly ? (
            <button
              type="button"
              id="btn_form_cancel"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg active:scale-95"
            >
              Tutup Detail Laporan
            </button>
          ) : (
            <>
              <button
                type="button"
                id="btn_form_cancel"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-black text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                type="button"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow-lg active:scale-95"
              >
                Simpan Rekap
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
