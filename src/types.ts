/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Jenjang = 'TK' | 'KB' | 'SD';

export type JalurSD = 'Domisili' | 'Afirmasi' | 'Mutasi' | 'Umum'; // SD-only routes

export type StatusVerifikasi = 'Diproses' | 'Diverifikasi' | 'Ditolak';

export type SiswaBaru = {
  id: string;
  sekolahTujuan: string;
  jenjang: Jenjang;
  
  // For SD (Gender & Jalur)
  lakiLaki: number;
  perempuan: number;
  domisili: number;
  afirmasi: number;
  mutasi: number;
  umum: number;

  // For TK/KB (Age categories)
  kelompokA: number; // min 4 - max 5 tahun
  kelompokB: number; // min 5 - max 6 tahun

  statusVerifikasi: StatusVerifikasi;
  tanggalDaftar: string;
  catatan?: string;
};

export type AlumniSD = {
  id: string;
  nama: string;
  nik: string;
  jk: 'L' | 'P';
  sekolahAsal: string;
  tahunLulus: string;
  status: 'Melanjutkan' | 'Tidak Melanjutkan' | 'Tidak Lulus';
  tujuanSekolah?: string; // SMP / MTs / Pondok Pesantren
  alasanTidakMelanjutkan?: string; // Biaya, Jarak, Membantu Orang Tua, Lainnya
  statusVerifikasi: 'Diproses' | 'Diverifikasi';
  tanggalUpdate: string;
};

export type UserRole = 'ADMIN_DINAS' | 'KEPALA_SEKOLAH' | 'PENGAWAS_SEKOLAH' | 'PUBLIK';

export type Sekolah = {
  id: string;
  npsn?: string;
  nama: string;
  jenjang: Jenjang;
  kecamatan: string;
};

export type RekapKelasSD = {
  sekolah: string;
  kelas1L: number;
  kelas1P: number;
  kelas2L: number;
  kelas2P: number;
  kelas3L: number;
  kelas3P: number;
  kelas4L: number;
  kelas4P: number;
  kelas5L: number;
  kelas5P: number;
  kelas6L: number;
  kelas6P: number;
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  role: string;
  actorName: string;
  action: string;
  detail: string;
  type: 'info' | 'success' | 'warning' | 'danger';
};
