import { createClient } from '@insforge/sdk';
import type { SiswaBaru, AlumniSD, ActivityLog } from '../types';

const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});

const db = insforge.database;

export async function fetchSiswaBaru(): Promise<SiswaBaru[]> {
  const { data, error } = await db.from('siswa_baru').select('*');
  if (error) throw error;
  return data as SiswaBaru[];
}

export async function fetchAlumni(): Promise<AlumniSD[]> {
  const { data, error } = await db.from('alumni').select('*');
  if (error) throw error;
  return data as AlumniSD[];
}

export async function fetchLogs(): Promise<ActivityLog[]> {
  const { data, error } = await db.from('activity_logs').select('*');
  if (error) throw error;
  return data as ActivityLog[];
}

export async function upsertSiswaBaru(students: SiswaBaru[]): Promise<void> {
  const { error } = await db.from('siswa_baru').upsert(students, { onConflict: 'id' });
  if (error) throw error;
}

export async function upsertAlumni(items: AlumniSD[]): Promise<void> {
  const { error } = await db.from('alumni').upsert(items, { onConflict: 'id' });
  if (error) throw error;
}

export async function upsertLogs(logs: ActivityLog[]): Promise<void> {
  const { error } = await db.from('activity_logs').upsert(logs, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteSiswaBaru(id: string): Promise<void> {
  const { error } = await db.from('siswa_baru').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteAlumni(id: string): Promise<void> {
  const { error } = await db.from('alumni').delete().eq('id', id);
  if (error) throw error;
}
