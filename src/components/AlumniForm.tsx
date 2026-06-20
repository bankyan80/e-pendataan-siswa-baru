/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlumniSD, UserRole } from '../types';
import { LIST_SEKOLAH } from '../data/initialData';
import { X, Check, AlertCircle } from 'lucide-react';

interface AlumniFormProps {
  id: string;
  alumni?: AlumniSD | null;
  onSave: (alumni: AlumniSD) => void;
  onClose: () => void;
  userRole: UserRole;
  userSchool?: string;
}

export default function AlumniForm({
  id,
  alumni,
  onSave,
  onClose,
  userRole,
  userSchool
}: AlumniFormProps) {
  const isEdit = !!alumni;
  const isReadOnly = userRole === 'PENGAWAS_SEKOLAH' || userRole === 'PUBLIK';

  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [sekolahAsal, setSekolahAsal] = useState('');
  const [tahunLulus, setTahunLulus] = useState('2026');
  const [status, setStatus] = useState<'Melanjutkan' | 'Tidak Melanjutkan'>('Melanjutkan');
  const [tujuanSekolah, setTujuanSekolah] = useState('');
  const [alasanTidakMelanjutkan, setAlasanTidakMelanjutkan] = useState('');
  const [statusVerifikasi, setStatusVerifikasi] = useState<'Diproses' | 'Diverifikasi'>('Diproses');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Filter only SD schools for alumni origin
  const sdSchools = LIST_SEKOLAH.filter(s => s.jenjang === 'SD');

  useEffect(() => {
    if (alumni) {
      setNama(alumni.nama);
      setNik(alumni.nik);
      setJk(alumni.jk);
      setSekolahAsal(alumni.sekolahAsal);
      setTahunLulus(alumni.tahunLulus);
      setStatus(alumni.status);
      setTujuanSekolah(alumni.tujuanSekolah || '');
      setAlasanTidakMelanjutkan(alumni.alasanTidakMelanjutkan || '');
      setStatusVerifikasi(alumni.statusVerifikasi);
    } else {
      setNama('');
      setNik('');
      setJk('L');
      setTahunLulus('2026');
      setStatus('Melanjutkan');
      setTujuanSekolah('');
      setAlasanTidakMelanjutkan('');
      setStatusVerifikasi('Diproses');

      // Auto assign if Kepala Sekolah of an SD
      if (userRole === 'KEPALA_SEKOLAH' && userSchool) {
        setSekolahAsal(userSchool);
      } else {
        setSekolahAsal(sdSchools[0]?.nama || '');
      }
    }
  }, [alumni, userRole, userSchool]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!nama.trim()) newErrors.nama = 'Nama lengkap wajib diisi';
    if (!nik.trim()) {
      newErrors.nik = 'NIK wajib diisi';
    } else if (!/^\d{16}$/.test(nik)) {
      newErrors.nik = 'NIK harus berupa 16 digit angka';
    }
    if (!sekolahAsal) newErrors.sekolahAsal = 'Harap pilih sekolah asal';
    
    if (status === 'Melanjutkan' && !tujuanSekolah.trim()) {
      newErrors.tujuanSekolah = 'Harap tuliskan nama SMP/MTs/Pesantren tujuan';
    }
    if (status === 'Tidak Melanjutkan' && !alasanTidakMelanjutkan) {
      newErrors.alasanTidakMelanjutkan = 'Harap pilih atau tuliskan alasan utama';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;

    const data: AlumniSD = {
      id: alumni?.id || `al_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nama: nama.trim(),
      nik: nik.trim(),
      jk,
      sekolahAsal,
      tahunLulus,
      status,
      tujuanSekolah: status === 'Melanjutkan' ? tujuanSekolah.trim() : undefined,
      alasanTidakMelanjutkan: status === 'Tidak Melanjutkan' ? alasanTidakMelanjutkan : undefined,
      statusVerifikasi,
      tanggalUpdate: alumni?.tanggalUpdate || new Date().toISOString().split('T')[0]
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end md:items-center md:justify-center p-0 md:p-4 animate-fade-in">
      <div
        id={id}
        className="bg-white dark:bg-gray-900 w-full max-w-lg h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-3xl md:rounded-2xl flex flex-col shadow-2xl overflow-hidden self-end md:self-auto transition-all transform duration-300 translate-y-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-gray-900">
              {isEdit ? 'Ubah Data Transisi Alumni' : 'Tambah Data Transisi Alumni'}
            </h3>
            <p className="text-xs text-gray-500">Pemantauan Wajib Belajar 9 Tahun (SMP/MTs)</p>
          </div>
          <button
            id="btn_alumni_close"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block">Nama Lengkap Alumni</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama lengkap sesuai ijazah/rapor"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                errors.nama ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-gray-900'
              } disabled:bg-slate-200 disabled:text-slate-400`}
            />
            {errors.nama && (
              <span className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.nama}
              </span>
            )}
          </div>

          {/* NIK & JK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block">NIK (16 Digit)</label>
              <input
                type="text"
                maxLength={16}
                disabled={isReadOnly}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="NIK siswa"
                className={`w-full px-3.5 py-2 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                  errors.nik ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-gray-900'
                } disabled:bg-slate-200 disabled:text-slate-400`}
              />
              {errors.nik && (
                <span className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.nik}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block">Jenis Kelamin</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setJk('L')}
                  className={`py-2 rounded-xl text-xs font-medium border transition disabled:opacity-60 ${
                    jk === 'L'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setJk('P')}
                  className={`py-2 rounded-xl text-xs font-medium border transition disabled:opacity-60 ${
                    jk === 'P'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Perempuan
                </button>
              </div>
            </div>
          </div>

          {/* Sekolah Asal & Tahun Lulus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block">Sekolah Asal (SD)</label>
              {userRole === 'KEPALA_SEKOLAH' || isReadOnly ? (
                <input
                  type="text"
                  readOnly
                  value={sekolahAsal}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium disabled:opacity-60"
                />
              ) : (
                <select
                  value={sekolahAsal}
                  onChange={(e) => setSekolahAsal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-gray-900 text-sm focus:outline-none"
                >
                  <option value="">-- Pilih SD Asal --</option>
                  {sdSchools.map(sch => (
                    <option key={sch.id} value={sch.nama}>{sch.nama}</option>
                  ))}
                </select>
              )}
              {errors.sekolahAsal && (
                <span className="text-xs text-rose-600">{errors.sekolahAsal}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block">Tahun Kelulusan</label>
              <select
                value={tahunLulus}
                disabled={isReadOnly}
                onChange={(e) => setTahunLulus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-gray-900 text-sm focus:outline-none disabled:bg-slate-200 disabled:text-slate-400"
              >
                <option value="2026">2026 (Tahun Ini)</option>
                <option value="2025">2025 (Tahun Lalu)</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          {/* Status Transisi (Melanjutkan vs Tidak Melanjutkan) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/20">
            <label className="text-xs font-bold text-indigo-950 dark:text-indigo-400 block">
              Status Keberlanjutan Pendidikan (Wajib Belajar 9 Tahun)
            </label>
            
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setStatus('Melanjutkan')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition duration-200 flex flex-col items-center justify-center gap-0.5 disabled:opacity-75 ${
                  status === 'Melanjutkan'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Melanjutkan Sekolah</span>
                <span className={`text-[9px] ${status === 'Melanjutkan' ? 'text-indigo-200' : 'text-gray-400'}`}>SMP / MTs / Ponpes</span>
              </button>

              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setStatus('Tidak Melanjutkan')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition duration-200 flex flex-col items-center justify-center gap-0.5 disabled:opacity-75 ${
                  status === 'Tidak Melanjutkan'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Tidak Melanjutkan</span>
                <span className={`text-[9px] ${status === 'Tidak Melanjutkan' ? 'text-indigo-200' : 'text-gray-400'}`}>Putus Sekolah / Menunda</span>
              </button>
            </div>

            {/* Conditional Input Fields */}
            {status === 'Melanjutkan' ? (
              <div className="space-y-1.5 mt-3 animate-fade-in">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                  Nama Sekolah Tujuan (SMP / MTs / Pesantren)
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={tujuanSekolah}
                  onChange={(e) => setTujuanSekolah(e.target.value)}
                  placeholder="Sebutkan SMPN XX, MTs, atau nama pesantren"
                  className={`w-full px-3 py-2 rounded-xl border text-sm transition focus:outline-none ${
                    errors.tujuanSekolah ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-gray-900'
                  } disabled:bg-slate-200 disabled:text-slate-400`}
                />
                {errors.tujuanSekolah && (
                  <span className="text-xs text-rose-600">{errors.tujuanSekolah}</span>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 mt-3 animate-fade-in">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                  Alasan Utama Tidak Berlanjut
                </label>
                <select
                  value={alasanTidakMelanjutkan}
                  disabled={isReadOnly}
                  onChange={(e) => setAlasanTidakMelanjutkan(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                    errors.alasanTidakMelanjutkan ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-gray-900'
                  } disabled:bg-slate-200 disabled:text-slate-400`}
                >
                  <option value="">-- Pilih Alasan Utama --</option>
                  <option value="Biaya/Faktor Ekonomi">Kendala Biaya / Masalah Ekonomi Keluarga</option>
                  <option value="Jarak Rumah Jauh">Akses Jarak Rumah & Kendala Transportasi</option>
                  <option value="Membantu Orang Tua Bekerja">Membantu Orang Tua Bekerja / Mencari Nafkah</option>
                  <option value="Kurang Minat Belajar">Anak Kurang Berminat Melanjutkan / Menolak Sekolah</option>
                  <option value="Pernikahan Dini">Pernikahan Dini / Faktor Sosial Keluarga</option>
                  <option value="Lainnya">Lainnya / Sakit Kronis / Kebutuhan Khusus Tanpa Fasilitas</option>
                </select>
                {errors.alasanTidakMelanjutkan && (
                  <span className="text-xs text-rose-600">{errors.alasanTidakMelanjutkan}</span>
                )}
              </div>
            )}
          </div>

          {/* Status Verifikasi (Only editable for Dinas and Kepala Sekolah) */}
          <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Status Verifikasi Tim Data</span>
            </div>

            {isReadOnly ? (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusVerifikasi === 'Diverifikasi'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {statusVerifikasi}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatusVerifikasi('Diproses')}
                  className={`py-1.5 rounded-lg text-xs font-medium transition border ${
                    statusVerifikasi === 'Diproses'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Diproses / Validasi
                </button>
                <button
                  type="button"
                  onClick={() => setStatusVerifikasi('Diverifikasi')}
                  className={`py-1.5 rounded-lg text-xs font-medium transition border ${
                    statusVerifikasi === 'Diverifikasi'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Diverifikasi Valid
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-end">
          {isReadOnly ? (
            <button
              type="button"
              id="btn_alumni_cancel"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg active:scale-95"
            >
              Tutup Detail Alumni
            </button>
          ) : (
            <>
              <button
                type="button"
                id="btn_alumni_cancel"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                type="button"
                className="px-[1.125rem] py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
              >
                Simpan data
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
