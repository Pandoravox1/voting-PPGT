import { supabase } from './supabaseClient';

export interface ClaimResult {
  ok: boolean;
  error?: string;
  code?: string;
}

// Attempt to claim a voter code once. Returns ok=false if invalid/used/misconfigured.
export const claimVoterCode = async (rawCode: string): Promise<ClaimResult> => {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { ok: false, error: 'Kode tidak boleh kosong.' };
  }

  if (!supabase) {
    return { ok: false, error: 'Supabase belum dikonfigurasi (cek VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY).' };
  }

  // Update with optimistic locking: only where used = false
  const { data, error } = await supabase
    .from('voter_codes')
    .update({ used: true, used_at: new Date().toISOString() })
    .ilike('code', code) // case-insensitive match so input/cell casing tidak memblok
    .eq('used', false)
    .select('code')
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: 'Kode tidak ditemukan atau sudah digunakan.' };
  }

  return { ok: true, code: data.code };
};
