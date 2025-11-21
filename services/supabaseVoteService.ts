import { supabase } from './supabaseClient';
import { Position, VoteCount } from '../types';

export interface VoteResult {
  ok: boolean;
  error?: string;
}

const ensureClient = () => {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi (cek VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY).');
  }
};

export const getUserVotedPositions = async (voterCode: string): Promise<Position[]> => {
  if (!voterCode) return [];
  ensureClient();
  const { data, error } = await supabase
    .from('votes')
    .select('position')
    .eq('voter_code', voterCode);
  if (error) {
    console.error('getUserVotedPositions error', error);
    return [];
  }
  const positions = (data || []).map(d => d.position as Position);
  return Array.from(new Set(positions));
};

export const submitVote = async (position: Position, candidateId: string, voterCode: string): Promise<VoteResult> => {
  ensureClient();
  if (!voterCode) {
    return { ok: false, error: 'Kode pemilih kosong.' };
  }
  const payload = {
    voter_code: voterCode,
    position,
    candidate_id: candidateId,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('votes')
    .upsert(payload, { onConflict: 'voter_code,position' });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
};

export const getVoteCountsByPosition = async (position: Position): Promise<VoteCount[]> => {
  ensureClient();
  const { data, error } = await supabase
    .from('votes')
    .select('candidate_id')
    .eq('position', position);

  if (error) {
    console.error('getVoteCountsByPosition error', error);
    return [];
  }

  const counts: Record<string, number> = {};
  (data || []).forEach(row => {
    const id = (row as any).candidate_id as string;
    counts[id] = (counts[id] || 0) + 1;
  });

  return Object.entries(counts).map(([candidateId, count]) => ({
    candidateId,
    count,
  })).sort((a, b) => b.count - a.count);
};

export const getTotalVotes = async (): Promise<number> => {
  ensureClient();
  const { count, error } = await supabase
    .from('votes')
    .select('voter_code', { count: 'exact', head: true });
  if (error) {
    console.error('getTotalVotes error', error);
    return 0;
  }
  return count || 0;
};

export const resetVotesByPosition = async (position: Position): Promise<VoteResult> => {
  ensureClient();
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('position', position);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
};
