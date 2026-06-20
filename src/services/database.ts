import { createClient } from '@insforge/sdk';
import type { SiswaBaru, AlumniSD, ActivityLog } from '../types';

const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});

const db = insforge.database;

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function keysToSnake<T>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    out[toSnake(key)] = (obj as Record<string, unknown>)[key];
  }
  return out;
}

function keysToCamel<T>(obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    out[toCamel(key)] = obj[key];
  }
  return out as T;
}

export async function fetchSiswaBaru(): Promise<SiswaBaru[]> {
  const { data, error } = await db.from('siswa_baru').select('*');
  if (error) throw error;
  return ((data as Record<string, unknown>[]) || []).map((r) => keysToCamel<SiswaBaru>(r));
}

export async function fetchAlumni(): Promise<AlumniSD[]> {
  const { data, error } = await db.from('alumni').select('*');
  if (error) throw error;
  return ((data as Record<string, unknown>[]) || []).map((r) => keysToCamel<AlumniSD>(r));
}

export async function fetchLogs(): Promise<ActivityLog[]> {
  const { data, error } = await db.from('activity_logs').select('*');
  if (error) throw error;
  return ((data as Record<string, unknown>[]) || []).map((r) => keysToCamel<ActivityLog>(r));
}

export async function upsertSiswaBaru(students: SiswaBaru[]): Promise<void> {
  const snake = students.map((s) => keysToSnake(s));
  const { error } = await db.from('siswa_baru').upsert(snake, { onConflict: 'id' });
  if (error) throw error;
}

export async function upsertAlumni(items: AlumniSD[]): Promise<void> {
  const snake = items.map((a) => keysToSnake(a));
  const { error } = await db.from('alumni').upsert(snake, { onConflict: 'id' });
  if (error) throw error;
}

export async function upsertLogs(logs: ActivityLog[]): Promise<void> {
  const snake = logs.map((l) => keysToSnake(l));
  const { error } = await db.from('activity_logs').upsert(snake, { onConflict: 'id' });
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
