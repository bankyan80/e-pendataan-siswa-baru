const GEMINI_KEYS = (import.meta.env.VITE_GEMINI_KEYS || '').split(',').filter(Boolean);
const DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_KEY || '';

export interface AiWarning {
  type: 'error' | 'warning' | 'info';
  field?: string;
  message: string;
}

export interface AiValidationResult {
  isValid: boolean;
  warnings: AiWarning[];
}

const SKILL_PROMPT = `Anda adalah asisten AI untuk sistem E-Pendataan Siswa Baru di Kecamatan Lemahabang. Tugas Anda adalah memvalidasi data pendidikan yang dimasukkan operator sekolah.

KONTEKS SISTEM:
- Aplikasi: E-Pendataan Siswa Baru Kecamatan Lemahabang
- Tahun Pelajaran: 2026/2027
- Jenjang: SD (Sekolah Dasar), TK (Taman Kanak-Kanak), KB (Kelompok Bermain)
- Data disimpan di localStorage (offline-first, tanpa server)

STRUKTUR DATA SISWA BARU:
{
  sekolahTujuan: string (nama sekolah),
  jenjang: 'SD' | 'TK' | 'KB',
  lakiLaki: number (SD only),
  perempuan: number (SD only),
  domisili: number (SD only, jalur zonasi),
  afirmasi: number (SD only),
  mutasi: number (SD only),
  umum: number (SD only),
  kelompokA: number (TK/KB only, usia 4-5 tahun),
  kelompokB: number (TK/KB only, usia 5-6 tahun),
  statusVerifikasi: 'Diproses' | 'Diverifikasi' | 'Ditolak',
  catatan?: string
}

ATURAN VALIDASI SD:
1. Total siswa (L+P) harus sama dengan total jalur (Domisili+Afirmasi+Mutasi+Umum)
2. Semua nilai harus >= 0
3. Jika total siswa > 0, status minimal 'Diproses'
4. Wajar jika total 0 untuk sekolah yang belum melapor

ATURAN VALIDASI TK/KB:
1. Total = KelompokA + KelompokB
2. Kedua nilai boleh 0 jika belum ada data
3. Perbandingan KelompokA dan KelompokB wajar jika tidak timpang (salah satu > 3x lipat yang lain patut dipertanyakan)

ATURAN VALIDASI ALUMNI SD:
{
  nama: string,
  nik: string (16 digit),
  jk: 'L' | 'P',
  sekolahAsal: string,
  tahunLulus: string (tahun 4 digit),
  status: 'Melanjutkan' | 'Tidak Melanjutkan' | 'Tidak Lulus',
  tujuanSekolah?: string (jika Melanjutkan),
  alasanTidakMelanjutkan?: string (jika Tidak Melanjutkan),
  statusVerifikasi: 'Diproses' | 'Diverifikasi'
}

1. NIK harus 16 digit angka
2. tahunLulus harus 4 digit dan tidak lebih dari 2026
3. Jika status 'Melanjutkan', tujuanSekolah harus diisi
4. Jika status 'Tidak Melanjutkan', alasanTidakMelanjutkan harus diisi
5. Nama tidak boleh kosong

ATURAN UMUM:
- Respons dalam BAHASA INDONESIA
- Jika semua benar, kembalikan {"isValid": true, "warnings": []}
- Jika ada masalah, berikan peringatan dalam format JSON array
- Setiap warning punya type: 'error' (pasti salah), 'warning' (perlu dicek), 'info' (saran)
- field adalah nama field yang bermasalah (optional)
- message dalam Bahasa Indonesia yang jelas dan membantu

Contoh respons valid:
{"isValid": true, "warnings": []}

Contoh respons dengan masalah:
{"isValid": false, "warnings": [{"type": "error", "field": "domisili", "message": "Jumlah domisili (15) + afirmasi (5) + mutasi (3) + umum (7) = 30, tidak sama dengan total siswa L+P (28)."}]}

HANYA kembalikan JSON, tanpa markdown, tanpa teks lain.`;

function keyIndex(key: string): number {
  return GEMINI_KEYS.indexOf(key);
}

async function callGemini(prompt: string, key: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: SKILL_PROMPT }] },
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function callDeepSeek(prompt: string): Promise<string | null> {
  const url = 'https://api.deepseek.com/v1/chat/completions';
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SKILL_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_KEY}` }, body: JSON.stringify(body) });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

function parseResponse(text: string): AiValidationResult {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && 'isValid' in parsed) {
      return { isValid: parsed.isValid, warnings: parsed.warnings || [] };
    }
  } catch {}
  return { isValid: true, warnings: [{ type: 'warning', message: 'Gagal memproses respons AI. Periksa data secara manual.' }] };
}

export async function validateData(data: Record<string, unknown>, context: 'siswa' | 'alumni'): Promise<AiValidationResult> {
  const prompt = `Validasi data ${context === 'siswa' ? 'Siswa Baru' : 'Alumni SD'} berikut:\n${JSON.stringify(data, null, 2)}`;

  for (const key of GEMINI_KEYS) {
    const result = await callGemini(prompt, key);
    if (result) return parseResponse(result);
  }

  const result = await callDeepSeek(prompt);
  if (result) return parseResponse(result);

  return { isValid: true, warnings: [{ type: 'warning', message: 'Layanan AI tidak tersedia. Periksa koneksi internet Anda.' }] };
}
