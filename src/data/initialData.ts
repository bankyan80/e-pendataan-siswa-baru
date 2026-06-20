/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiswaBaru, AlumniSD, Sekolah, ActivityLog } from '../types';

export const LIST_SEKOLAH: Sekolah[] = [
  // 22 SD Schools from Kecamatan Lemahabang (Matching target image precisely)
  { id: 'sch_s1', npsn: '20215216', nama: 'SD NEGERI 1 ASEM', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s2', npsn: '20215230', nama: 'SD NEGERI 1 BELAWA', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s3', npsn: '20215287', nama: 'SD NEGERI 1 CIPEUJEUH KULON', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s4', npsn: '20215286', nama: 'SD NEGERI 1 CIPEUJEUH WETAN', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s5', npsn: '20215162', nama: 'SD NEGERI 1 LEMAHABANG', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s6', npsn: '20215161', nama: 'SD NEGERI 1 LEMAHABANG KULON', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s7', npsn: '20215164', nama: 'SD NEGERI 1 LEUWIDINGDING', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s8', npsn: '20246442', nama: 'SD NEGERI 1 PICUNGPUGUR', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s9', npsn: '20215517', nama: 'SD NEGERI 1 SARAJAYA', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s10', npsn: '20215506', nama: 'SD NEGERI 1 SIGONG', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s11', npsn: '20215464', nama: 'SD NEGERI 1 SINDANGLAUT', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s12', npsn: '20246445', nama: 'SD NEGERI 1 TUK KARANGSUWUNG', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s13', npsn: '20215584', nama: 'SD NEGERI 1 WANGKELANG', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s14', npsn: '20215564', nama: 'SD NEGERI 2 BELAWA', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s15', npsn: '20215381', nama: 'SD NEGERI 2 CIPEUJEUH KULON', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s16', npsn: '20215380', nama: 'SD NEGERI 2 CIPEUJEUH WETAN', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s17', npsn: '20214656', nama: 'SD NEGERI 2 LEMAHABANG', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s18', npsn: '20214726', nama: 'SD NEGERI 2 SARAJAYA', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s19', npsn: '20214479', nama: 'SD NEGERI 3 CIPEUJEUH WETAN', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s20', npsn: '20214570', nama: 'SD NEGERI 3 SIGONG', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s21', npsn: '20244513', nama: 'SD NEGERI 4 SIGONG', jenjang: 'SD', kecamatan: 'LEMAHABANG' },
  { id: 'sch_s22', npsn: '20215221', nama: 'SD IT AL IRSYAD AL ISLAMIYYAH', jenjang: 'SD', kecamatan: 'LEMAHABANG' },

  // 23 TK & KB schools from official spreadsheet
  { id: 'sch_tk_kb_1', npsn: '70039880', nama: 'KB A.H. PLUS', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_2', npsn: '69804039', nama: 'KB AMALIA SALSABILA', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_3', npsn: '69804068', nama: 'KB AZ-ZAHRA', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_4', npsn: '70044538', nama: 'KB MUTIARA', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_5', npsn: '69870486', nama: 'KB PALAPA', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_6', npsn: '70024652', nama: 'KB PERMATA BUNDA', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_7', npsn: '69947715', nama: 'PAUD AL HAMBRA', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_8', npsn: '69870488', nama: 'PAUD AL- HIDAYAH', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_9', npsn: '69870479', nama: 'PAUD AL-HUSNA', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_10', npsn: '69870482', nama: 'PAUD AMANAH', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_11', npsn: '69870484', nama: 'PAUD AN NAIM', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_12', npsn: '69870485', nama: 'PAUD ASY - SYAFIIYAH', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_13', npsn: '69870489', nama: 'PAUD BUDGENVIL', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_14', npsn: '69870490', nama: 'PAUD TUNAS HARAPAN', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_15', npsn: '20270605', nama: 'TK NEGERI LEMAHABANG', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_16', npsn: '20254372', nama: 'TK AISYIYAH LEMAHABANG', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_17', npsn: '20254376', nama: 'TK AL-AQSO', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_18', npsn: '20254373', nama: 'TK AL-IRSYAD AL-ISLAMIYYAH', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_19', npsn: '20254374', nama: 'TK BPP KENANGA', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_20', npsn: '20254370', nama: 'TK GELATIK', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_21', npsn: '20254378', nama: 'TK MELATI', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_22', npsn: '20254375', nama: 'TK MUSLIMAT NU', jenjang: 'TK', kecamatan: 'LEMAHABANG' },
  { id: 'sch_tk_kb_23', npsn: '69804044', nama: 'PAUD SPS MELATI', jenjang: 'KB', kecamatan: 'LEMAHABANG' },
];

export const INITIAL_SISWA_BARU: SiswaBaru[] = LIST_SEKOLAH.map((school) => ({
  id: `sb_${school.id}`,
  sekolahTujuan: school.nama,
  jenjang: school.jenjang as 'SD' | 'TK' | 'KB',
  lakiLaki: 0,
  perempuan: 0,
  domisili: 0,
  afirmasi: 0,
  mutasi: 0,
  umum: 0,
  kelompokA: 0,
  kelompokB: 0,
  statusVerifikasi: 'Diproses' as const,
  tanggalDaftar: '',
  catatan: ''
}));

export const INITIAL_ALUMNI: AlumniSD[] = [];

export const INITIAL_LOGS: ActivityLog[] = [];
