import { Position, VoteCount, Candidate } from '../types';

const STORAGE_KEY = 'ppgt_votes_2026';
const USER_VOTES_KEY = 'ppgt_user_history_2026';

const buildInitialVotes = (candidates: Candidate[]) => {
  const votes: Record<string, number> = {};
  candidates.forEach(c => {
    votes[c.id] = Math.floor(Math.random() * 40) + 10;
  });
  return votes;
};

export const getVotes = (candidates: Candidate[]): Record<string, number> => {
  const existing = localStorage.getItem(STORAGE_KEY);
  let votes: Record<string, number> = existing ? JSON.parse(existing) : buildInitialVotes(candidates);

  const allowedIds = new Set(candidates.map(c => c.id));
  let changed = false;

  // Remove votes for deleted candidates
  Object.keys(votes).forEach(id => {
    if (!allowedIds.has(id)) {
      delete votes[id];
      changed = true;
    }
  });

  // Add zero votes for newly added candidates
  candidates.forEach(c => {
    if (!(c.id in votes)) {
      votes[c.id] = 0;
      changed = true;
    }
  });

  if (changed || !existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  }

  return votes;
};

export const getUserVotedPositions = (): Position[] => {
  const data = localStorage.getItem(USER_VOTES_KEY);
  return data ? JSON.parse(data) : [];
};

export const submitVote = (position: Position, candidateId: string, candidates: Candidate[]) => {
  // 1. Update Global Counts
  const currentVotes = getVotes(candidates);
  if (candidateId) {
    currentVotes[candidateId] = (currentVotes[candidateId] || 0) + 1;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentVotes));
  
  // 2. Update User History
  const votedPositions = getUserVotedPositions();
  if (!votedPositions.includes(position)) {
    votedPositions.push(position);
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votedPositions));
  }

  // Dispatch event for realtime feel across tabs
  window.dispatchEvent(new Event('storage'));
};

export const getVoteCountsByPosition = (position: Position, candidates: Candidate[]): VoteCount[] => {
  const votes = getVotes(candidates);
  return candidates
    .filter(c => c.position === position)
    .map(c => ({
      candidateId: c.id,
      count: votes[c.id] || 0
    }))
    .sort((a, b) => b.count - a.count); // Sort by highest votes
};

export const getTotalVotes = (candidates: Candidate[]): number => {
    const votes = getVotes(candidates);
    // Just sum up Ketua votes as a proxy for total voters for simplicity, 
    // or better: sum of all votes divided by positions, but stick to simple logic
    // Let's return the max votes of any position to approximate 'voters'
    // Actually, let's just sum all votes.
    let total = 0;
    Object.values(votes).forEach(v => total += v);
    return Math.round(total / 3); // Approximation of voters since there are 3 positions
}

export const syncVotesWithCandidates = (candidates: Candidate[]) => {
  getVotes(candidates);
};
