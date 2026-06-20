/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiswaBaru, AlumniSD } from '../types';

/**
 * Converts New Student (Siswa Baru) array to Excel-compatible CSV string with BOM
 */
export function exportSiswaBaruToCSV(data: SiswaBaru[]): void {
  const headers = [
    'No',
    'Nama Lembaga Pendidikan',
    'Jenjang',
    'Laki-laki (SD)',
    'Perempuan (SD)',
    'Total SD',
    'Jalur Domisili (SD)',
    'Jalur Afirmasi (SD)',
    'Jalur Mutasi (SD)',
    'Jalur Umum (SD)',
    'Kelompok A (PAUD)',
    'Kelompok B (PAUD)',
    'Total TK/KB',
    'Total Keseluruhan',
    'Status Verifikasi',
    'Tanggal Update Rekap',
    'Catatan / Berkas Keterangan'
  ];

  const rows = data.map((item, index) => {
    const totalSD = item.jenjang === 'SD' ? (item.lakiLaki || 0) + (item.perempuan || 0) : 0;
    const totalPAUD = item.jenjang !== 'SD' ? (item.kelompokA || 0) + (item.kelompokB || 0) : 0;
    const grandTotal = totalSD + totalPAUD;

    return [
      index + 1,
      `"${item.sekolahTujuan.replace(/"/g, '""')}"`,
      item.jenjang,
      item.jenjang === 'SD' ? item.lakiLaki : 0,
      item.jenjang === 'SD' ? item.perempuan : 0,
      totalSD,
      item.jenjang === 'SD' ? item.domisili : 0,
      item.jenjang === 'SD' ? item.afirmasi : 0,
      item.jenjang === 'SD' ? item.mutasi : 0,
      item.jenjang === 'SD' ? item.umum : 0,
      item.jenjang !== 'SD' ? item.kelompokA : 0,
      item.jenjang !== 'SD' ? item.kelompokB : 0,
      totalPAUD,
      grandTotal,
      item.statusVerifikasi,
      item.tanggalDaftar,
      `"${(item.catatan || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(e => e.join(';'))
  ].join('\n');

  downloadFile(csvContent, 'REKAP_SISWA_BARU_KECAMATAN_TP_2026_2027.csv', 'text/csv;charset=utf-8;');
}

/**
 * Converts SD Alumni array to Excel-compatible CSV string with BOM
 */
export function exportAlumniToCSV(data: AlumniSD[]): void {
  const headers = [
    'No',
    'Nama Alumni',
    'NIK',
    'Jenis Kelamin',
    'Sekolah Asal',
    'Tahun Lulus',
    'Status Transisi',
    'Sekolah Tujuan (Jika Melanjutkan)',
    'Alasan Utama (Jika Tidak Melanjutkan)',
    'Status Verifikasi',
    'Tanggal Update Data'
  ];

  const rows = data.map((item, index) => [
    index + 1,
    `"${item.nama.replace(/"/g, '""')}"`,
    `'${item.nik}`,
    item.jk === 'L' ? 'Laki-laki' : 'Perempuan',
    `"${item.sekolahAsal.replace(/"/g, '""')}"`,
    item.tahunLulus,
    item.status,
    `"${(item.tujuanSekolah || '-').replace(/"/g, '""')}"`,
    `"${(item.alasanTidakMelanjutkan || '-').replace(/"/g, '""')}"`,
    item.statusVerifikasi,
    item.tanggalUpdate
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(e => e.join(';'))
  ].join('\n');

  downloadFile(csvContent, 'Alumni_SD_Transisi_2026.csv', 'text/csv;charset=utf-8;');
}

/**
 * Trigger browser file download
 */
function downloadFile(content: string, fileName: string, mimeType: string): void {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM). Microsoft Excel requires this to render UTF-8 CSVs correctly.
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
