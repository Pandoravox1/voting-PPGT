import { supabase } from './supabaseClient';
import { Candidate, Position } from '../types';

export interface Result<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

const ensureClient = () => {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi (cek VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY).');
  }
};

const mapRow = (row: any): Candidate => ({
  id: row.id,
  name: row.name,
  position: row.position as Position,
  photoUrl: row.photo_url || '',
  vision: row.vision || '',
  mission: row.mission || [],
});

export const fetchCandidates = async (): Promise<Result<Candidate[]>> => {
  try {
    ensureClient();
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('position', { ascending: true })
      .order('name', { ascending: true });

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: (data || []).map(mapRow) };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Gagal memuat kandidat.' };
  }
};

export const upsertCandidate = async (candidate: Candidate): Promise<Result> => {
  try {
    ensureClient();
    const { error } = await supabase
      .from('candidates')
      .upsert({
        id: candidate.id,
        name: candidate.name,
        position: candidate.position,
        photo_url: candidate.photoUrl || '',
        vision: candidate.vision || '',
        mission: candidate.mission || [],
      });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Gagal menyimpan kandidat.' };
  }
};

export const deleteCandidate = async (id: string): Promise<Result> => {
  try {
    ensureClient();
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Gagal menghapus kandidat.' };
  }
};
