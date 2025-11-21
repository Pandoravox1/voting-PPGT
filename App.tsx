import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Award, BarChart2, CheckCircle, ChevronRight, Vote, Users, LogOut, ChevronLeft, Lock, Wrench, Plus, Trash2, Save, Shield, KeyRound } from 'lucide-react';

import { Position, ViewMode, Candidate, VoteCount } from './types';
import { CANDIDATES } from './constants';
import { Background } from './components/Background';
import { GlassCard } from './components/GlassCard';
import { CandidateCard } from './components/CandidateCard';
import * as VoteService from './services/voteService';
import * as SupabaseVotes from './services/supabaseVoteService';
import * as SupabaseCandidates from './services/supabaseCandidateService';
import { claimVoterCode } from './services/voterCodeService';

// Main Component
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidateError, setCandidateError] = useState('');

  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ppgt_is_admin') === 'true';
    }
    return false;
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [voterCode, setVoterCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ppgt_voter_code') || '';
    }
    return '';
  });
  const [voterLoginOpen, setVoterLoginOpen] = useState(false);
  const [voterInput, setVoterInput] = useState('');
  const [voterError, setVoterError] = useState('');
  const [voterLoading, setVoterLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Bersihkan jejak login admin lama di localStorage agar tidak auto-login setelah restart.
      localStorage.removeItem('ppgt_is_admin');
    }
  }, []);

  const fetchCandidatesFromSupabase = async () => {
    setCandidatesLoading(true);
    setCandidateError('');
    const res = await SupabaseCandidates.fetchCandidates();
    if (res.ok && res.data && res.data.length > 0) {
      setCandidates(res.data);
    } else if (res.ok) {
      // jika tabel kosong, tetap kosong
      setCandidates([]);
    } else {
      setCandidateError(res.error || 'Gagal memuat kandidat.');
    }
    setCandidatesLoading(false);
  };

  useEffect(() => {
    fetchCandidatesFromSupabase();
  }, []);

  const handleRequireAdmin = (after?: () => void) => {
    setPendingAction(() => after || null);
    setLoginOpen(true);
    setLoginError('');
    setLoginUser('');
    setLoginPass('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin';
    const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'admin123';

    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setIsAdmin(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ppgt_is_admin', 'true');
      }
      setLoginOpen(false);
      pendingAction?.();
      setPendingAction(null);
    } else {
      setLoginError('Username atau password salah.');
    }
  };

  // Reset state when going home
  const handleGoHome = () => {
    setViewMode('home');
  };

  const handleVoterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoterError('');
    const code = voterInput.trim();
    if (!code) {
      setVoterError('Masukkan kode pemilih.');
      return;
    }

    try {
      setVoterLoading(true);
      const result = await claimVoterCode(code);
      if (!result.ok) {
        setVoterError(result.error || 'Kode tidak valid atau sudah digunakan.');
        return;
      }
      const normalizedCode = (result.code || code).toUpperCase();
      setVoterCode(normalizedCode);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ppgt_voter_code', normalizedCode);
      }
      setVoterInput('');
      setVoterLoginOpen(false);
    } catch (err: any) {
      setVoterError(err?.message || 'Gagal memverifikasi kode.');
    } finally {
      setVoterLoading(false);
    }
  };

  const handleVoterLogout = () => {
    setVoterCode('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ppgt_voter_code');
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500 selection:text-white">
      <Background />
      
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-900/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleGoHome}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
               <Vote className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">PPGT Jemaat Tangerang</h1>
              <p className="text-xs text-cyan-400 font-medium tracking-widest uppercase">E-Voting 2026-2027</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {voterCode && (
              <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 font-semibold border border-white/10">
                Kode: {voterCode}
              </div>
            )}
            {viewMode !== 'home' && (
              <button 
                onClick={handleGoHome}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-sm font-medium text-gray-300"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
        {candidateError && (
          <div className="mb-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            {candidateError}
          </div>
        )}
        <AnimatePresence mode='wait'>
          {viewMode === 'home' && (
            <HomeView 
              key="home" 
              onSelectMode={setViewMode} 
              isAdmin={isAdmin} 
              onRequireAdmin={handleRequireAdmin} 
              voterCode={voterCode}
              onRequireVoter={() => setVoterLoginOpen(true)}
            />
          )}
          {viewMode === 'voting' && (
            <VotingManager 
              key="voting" 
              onFinish={() => setViewMode('home')} 
              candidates={candidates}
              setCandidates={setCandidates}
              isAdmin={isAdmin}
              onRequireAdmin={handleRequireAdmin}
              voterCode={voterCode}
              onRequireVoter={() => setVoterLoginOpen(true)}
              reloadCandidates={fetchCandidatesFromSupabase}
            />
          )}
          {viewMode === 'results' && (
            isAdmin ? (
              <ResultsDashboard key="results" candidates={candidates} isAdmin={isAdmin} />
            ) : (
              <AdminRequired onRequireAdmin={() => handleRequireAdmin(() => setViewMode('results'))} />
            )
          )}
        </AnimatePresence>
      </main>
      
      <footer className="fixed bottom-4 w-full text-center text-xs text-white/30 pointer-events-none">
        &copy; 2025 PPGT Jemaat Tangerang. All Rights Reserved.
      </footer>

      {loginOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-cyan-400" />
              <div>
                <h3 className="text-xl font-bold">Login Admin</h3>
                <p className="text-sm text-white/60">Masukkan kredensial admin untuk melanjutkan.</p>
              </div>
            </div>
            <form className="space-y-3" onSubmit={handleLogin}>
              <input
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                placeholder="Username"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
              />
              <input
                type="password"
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                placeholder="Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
              {loginError && <p className="text-sm text-red-400">{loginError}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setLoginOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold"
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {voterLoginOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setVoterLoginOpen(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <KeyRound className="text-cyan-400" />
              <div>
                <h3 className="text-xl font-bold">Masukkan Kode Pemilih</h3>
                <p className="text-sm text-white/60">Gunakan kode unik yang dibagikan panitia (contoh: PPGT-001).</p>
              </div>
            </div>
            <form className="space-y-3" onSubmit={handleVoterLogin}>
              <input
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 uppercase"
                placeholder="Contoh: PPGT-001"
                value={voterInput}
                onChange={(e) => setVoterInput(e.target.value)}
              />
              {voterError && <p className="text-sm text-red-400">{voterError}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setVoterLoginOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={voterLoading}
                  className={`px-4 py-2 rounded-lg font-semibold ${voterLoading ? 'bg-cyan-900 text-white/60' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                >
                  {voterLoading ? 'Memeriksa...' : 'Masuk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 1. Home View Component
const HomeView: React.FC<{ onSelectMode: (mode: ViewMode) => void; isAdmin: boolean; onRequireAdmin: (after?: () => void) => void; voterCode: string; onRequireVoter: () => void }> = ({ onSelectMode, isAdmin, onRequireAdmin, voterCode, onRequireVoter }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center flex-grow space-y-12"
    >
      <div className="text-center space-y-6 max-w-3xl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-4"
        >
          Pemilihan Pengurus Periode 2026-2027
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-100 to-blue-900 tracking-tight">
          Suara Anda,<br />Masa Depan Kita.
        </h2>
        <p className="text-lg text-blue-200/80 max-w-2xl mx-auto leading-relaxed">
          Mari berpartisipasi dalam pemilihan Ketua, Sekretaris, dan Bendahara PPGT Jemaat Tangerang. Pilihanmu menentukan arah pelayanan kita bersama.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <GlassCard 
          className="p-8 flex flex-col items-center text-center gap-6 group cursor-pointer border-blue-500/30 hover:border-blue-400/60"
          onClick={() => {
            if (voterCode) {
              onSelectMode('voting');
            } else {
              onRequireVoter();
            }
          }}
          hoverEffect
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
            <Vote size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Bilik Suara</h3>
            <p className="text-white/60">Pilih kandidat untuk setiap kategori kepengurusan.</p>
          </div>
          <div className="mt-auto flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform">
            Mulai Memilih <ArrowRight size={18} className="ml-2" />
          </div>
        </GlassCard>

        <GlassCard 
          className="p-8 flex flex-col items-center text-center gap-6 group cursor-pointer border-cyan-500/30 hover:border-cyan-400/60"
          onClick={() => {
            if (isAdmin) {
              onSelectMode('results');
            } else {
              onRequireAdmin(() => onSelectMode('results'));
            }
          }}
          hoverEffect
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-600/40 group-hover:scale-110 transition-transform">
            <BarChart2 size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Quick Count</h3>
            <p className="text-white/60">Pantau perolehan suara sementara secara real-time.</p>
          </div>
          <div className="mt-auto flex items-center text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
            Lihat Hasil <ArrowRight size={18} className="ml-2" />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

// 2. Voting Manager Component (Handles Logic Flow)
const VotingManager: React.FC<{ onFinish: () => void; candidates: Candidate[]; setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>; isAdmin: boolean; onRequireAdmin: (after?: () => void) => void; voterCode: string; onRequireVoter: () => void; reloadCandidates: () => Promise<void> }> = ({ onFinish, candidates, setCandidates, isAdmin, onRequireAdmin, voterCode, onRequireVoter, reloadCandidates }) => {
  const [votedPositions, setVotedPositions] = useState<Position[]>([]);
  const [activePosition, setActivePosition] = useState<Position | null>(null);
  const [justVoted, setJustVoted] = useState<Position | null>(null);
  const [loadingVotes, setLoadingVotes] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!voterCode) {
        setVotedPositions([]);
        return;
      }
      setLoadingVotes(true);
      const positions = await SupabaseVotes.getUserVotedPositions(voterCode);
      setVotedPositions(positions);
      setLoadingVotes(false);
    };
    load();
  }, [voterCode]);

  const handleVoteSuccess = async () => {
    if (activePosition) {
      setJustVoted(activePosition);
      if (voterCode) {
        const positions = await SupabaseVotes.getUserVotedPositions(voterCode);
        setVotedPositions(positions);
      }
      setActivePosition(null);
      setTimeout(() => setJustVoted(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
       {!voterCode ? (
          <VoterRequired onRequireVoter={onRequireVoter} />
       ) : (
       <AnimatePresence mode='wait'>
          {activePosition ? (
              <BallotPaper 
                 key="ballot"
                 position={activePosition}
                 onBack={() => setActivePosition(null)}
                 onSuccess={handleVoteSuccess}
                 candidates={candidates}
                 setCandidates={setCandidates}
                 isAdmin={isAdmin}
                 onRequireAdmin={onRequireAdmin}
                 voterCode={voterCode}
             />
          ) : (
             <ElectionMenu 
                key="menu"
                votedPositions={votedPositions}
                onSelect={setActivePosition}
                justVoted={justVoted}
             />
          )}
       </AnimatePresence>
       )}
    </div>
  );
};

// 2a. Election Menu Component
interface ElectionMenuProps {
  votedPositions: Position[];
  onSelect: (p: Position) => void;
  justVoted: Position | null;
}

const ElectionMenu: React.FC<ElectionMenuProps> = ({ votedPositions, onSelect, justVoted }) => {
  const positions = [Position.KETUA, Position.SEKRETARIS, Position.BENDAHARA];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-10"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Dashboard Pemilihan</h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Silakan pilih kategori kepengurusan yang ingin Anda pilih. Anda dapat melakukan pemilihan secara terpisah untuk setiap posisi.
        </p>
      </div>

      {justVoted && (
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-green-500/20 border border-green-500/40 text-green-200 p-4 rounded-xl flex items-center justify-center gap-2"
        >
           <CheckCircle size={20} />
           <span>Suara untuk <strong>{justVoted}</strong> berhasil disimpan!</span>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {positions.map((position, idx) => {
           const isVoted = votedPositions.includes(position);
           return (
              <GlassCard 
                 key={position}
                 className={`
                   relative p-8 flex flex-col items-center gap-6 transition-all duration-300
                   ${isVoted ? 'opacity-70' : 'cursor-pointer hover:border-cyan-400/50'}
                 `}
                 onClick={() => !isVoted && onSelect(position)}
                 hoverEffect={!isVoted}
              >
                 {isVoted && (
                    <div className="absolute inset-0 bg-slate-900/50 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                       <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transform -rotate-12 border border-white/20">
                          <CheckCircle size={18} /> SUDAH MEMILIH
                       </div>
                    </div>
                 )}

                 <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2
                    ${isVoted ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white'}
                 `}>
                    {idx + 1}
                 </div>
                 
                 <div className="text-center">
                    <h3 className="text-2xl font-bold mb-1">{position}</h3>
                    <p className="text-sm text-white/50">Periode 2026-2027</p>
                 </div>

                 <div className={`
                    mt-auto px-6 py-2 rounded-full text-sm font-semibold border transition-colors
                    ${isVoted 
                       ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                       : 'border-white/10 bg-white/5 text-white group-hover:bg-white/10'}
                 `}>
                    {isVoted ? 'Terkirim' : 'Buka Kertas Suara'}
                 </div>
              </GlassCard>
           );
        })}
      </div>
    </motion.div>
  );
};

// 2b. Ballot Paper Component (Voting Interface)
interface BallotPaperProps {
  position: Position;
  onBack: () => void;
  onSuccess: () => void;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  isAdmin: boolean;
  onRequireAdmin: (after?: () => void) => void;
  voterCode: string;
  reloadCandidates: () => Promise<void>;
}

const BallotPaper: React.FC<BallotPaperProps> = ({ position, onBack, onSuccess, candidates, setCandidates, isAdmin, onRequireAdmin, voterCode, reloadCandidates }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const candidatesForPosition = candidates.filter(c => c.position === position);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newName, setNewName] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isAdmin && showAdminPanel) {
      setShowAdminPanel(false);
    }
  }, [isAdmin, showAdminPanel]);

  const handleSubmit = async () => {
    if (!selectedId) return;
    if (!voterCode) {
      setSubmitError('Kode pemilih tidak ditemukan. Silakan login kode terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    const result = await SupabaseVotes.submitVote(position, selectedId, voterCode);
    if (!result.ok) {
      setSubmitError(result.error || 'Gagal mengirim suara.');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    onSuccess();
  };

  const handleNameUpdate = async (id: string, name: string) => {
    const updated = candidates.map(c => c.id === id ? { ...c, name } : c);
    setCandidates(updated);
    const res = await SupabaseCandidates.upsertCandidate(updated.find(c => c.id === id)!);
    if (!res.ok) {
      setSubmitError(res.error || 'Gagal menyimpan kandidat.');
      await reloadCandidates();
    }
  };

  const handleDelete = async (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
    const res = await SupabaseCandidates.deleteCandidate(id);
    if (!res.ok) {
      setSubmitError(res.error || 'Gagal menghapus kandidat.');
      await reloadCandidates();
    }
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const newCandidate: Candidate = {
      id: `${position[0].toLowerCase()}-${Date.now()}`,
      name,
      position,
      photoUrl: '',
      vision: '',
      mission: []
    };
    setCandidates(prev => [...prev, newCandidate]);
    setNewName('');
    const res = await SupabaseCandidates.upsertCandidate(newCandidate);
    if (!res.ok) {
      setSubmitError(res.error || 'Gagal menambah kandidat.');
      await reloadCandidates();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="flex items-center gap-4 mb-8">
         <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
         >
            <ChevronLeft size={24} />
         </button>
         <div>
            <h2 className="text-2xl font-bold">Surat Suara: {position}</h2>
            <p className="text-white/50 text-sm">Pilih salah satu kandidat di bawah ini</p>
         </div>
         <div className="ml-auto flex items-center gap-3">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowAdminPanel(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Wrench size={16} />
                  {showAdminPanel ? 'Tutup Mode Admin' : 'Mode Admin'}
                </button>
              </>
            ) : (
              <button
                onClick={() => onRequireAdmin(() => setShowAdminPanel(true))}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Shield size={16} />
                Masuk Admin
              </button>
            )}
         </div>
      </div>

      {isAdmin && showAdminPanel && (
        <GlassCard className="p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-white/60">Kelola kandidat untuk posisi ini.</p>
            </div>
          </div>

          <div className="space-y-3">
            {candidatesForPosition.map(c => (
              <div key={c.id} className="flex flex-col sm:flex-row gap-3 items-center bg-white/5 rounded-xl p-3">
                <input
                  className="w-full bg-slate-900/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  value={c.name}
                  onChange={(e) => handleNameUpdate(c.id, e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNameUpdate(c.id, c.name.trim())}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold"
                  >
                    <Save size={14} />
                    Simpan
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-sm font-semibold"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 items-center bg-white/5 rounded-xl p-3">
              <input
                className="w-full bg-slate-900/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                placeholder="Nama kandidat baru"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 font-semibold text-sm"
              >
                <Plus size={16} />
                Tambah Kandidat
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 justify-center">
        {candidatesForPosition.map(candidate => (
          <CandidateCard 
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedId === candidate.id}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      <div className="fixed bottom-8 left-0 w-full px-4 flex justify-center pointer-events-none z-40">
         <button
            onClick={handleSubmit}
            disabled={!selectedId || isSubmitting}
            className={`
               pointer-events-auto shadow-2xl shadow-black/50
               flex items-center gap-3 px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 transform
               ${selectedId 
                 ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white translate-y-0 opacity-100 hover:scale-105' 
                 : 'bg-slate-700 text-slate-500 translate-y-20 opacity-0'}
            `}
         >
            {isSubmitting ? (
               <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim Suara...
               </>
            ) : (
               <>
                  <Vote size={20} />
                  Kirim Suara Pilihan Saya
               </>
            )}
         </button>
      </div>
    </motion.div>
  );
};

// 3. Results Dashboard Component (Quick Count)
const ResultsDashboard: React.FC<{ candidates: Candidate[]; isAdmin: boolean }> = ({ candidates, isAdmin }) => {
  const [trigger, setTrigger] = useState(0);
  const positions = [Position.KETUA, Position.SEKRETARIS, Position.BENDAHARA];
  const [selectedPosition, setSelectedPosition] = useState<Position>(positions[0]);
  const [counts, setCounts] = useState<VoteCount[]>([]);
  const [totalPositionVotes, setTotalPositionVotes] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [countError, setCountError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(t => t + 1);
    }, 2000);

    const handleStorage = () => setTrigger(t => t + 1);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setCountError('');
      try {
        const res = await SupabaseVotes.getVoteCountsByPosition(selectedPosition);
        const totalPos = res.reduce((sum, v) => sum + v.count, 0);
        const totalAll = await SupabaseVotes.getTotalVotes();
        if (!active) return;
        setCounts(res);
        setTotalPositionVotes(totalPos);
        setTotalVotes(totalAll);
      } catch (err: any) {
        if (!active) return;
        setCountError(err?.message || 'Gagal memuat data.');
      }
    };
    load();
    return () => { active = false; };
  }, [selectedPosition, trigger]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-bold animate-pulse mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full" /> LIVE UPDATE
        </div>
        <h2 className="text-4xl font-bold">Hasil Quick Count</h2>
        <p className="text-white/60 mt-2">Pilih posisi untuk melihat persentase suara.</p>
        <div className="flex items-center justify-center gap-2 mt-4 text-blue-200">
          <Users size={18} />
          <span className="font-semibold">{totalVotes} suara (total)</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => setSelectedPosition(pos)}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
              selectedPosition === pos
                ? 'bg-cyan-600 text-white border-cyan-500'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
          >
            {pos}
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={async () => {
              setResetError('');
              setResetting(true);
              const res = await SupabaseVotes.resetVotesByPosition(selectedPosition);
              if (!res.ok) {
                setResetError(res.error || 'Gagal reset suara.');
              } else {
                setTrigger(t => t + 1);
              }
              setResetting(false);
            }}
            className="ml-2 px-4 py-2 rounded-full border text-sm font-semibold bg-red-600 hover:bg-red-500 border-red-400/50"
            disabled={resetting}
          >
            {resetting ? 'Mereset...' : `Reset ${selectedPosition}`}
          </button>
        )}
      </div>

      <GlassCard className="p-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <Award className="text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Posisi {selectedPosition}</h3>
              <p className="text-white/60 text-sm">Persentase suara per kandidat.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-200">
            <Users size={18} />
            <span className="font-semibold">{totalPositionVotes} suara masuk</span>
          </div>
        </div>

        {countError && <p className="text-sm text-red-400 mb-3">{countError}</p>}

        {resetError && <p className="text-sm text-red-400 mb-2">{resetError}</p>}

        <div className="space-y-3">
          {counts.map((item) => {
            const candidate = candidates.find(c => c.id === item.candidateId);
            const percent = totalPositionVotes > 0 ? Math.round((item.count / totalPositionVotes) * 100) : 0;
            return (
              <div key={item.candidateId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-semibold">{candidate?.name || 'Unknown'}</div>
                  <div className="text-cyan-300 font-bold">{percent}%</div>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-xs text-white/60">{item.count} suara</div>
              </div>
            );
          })}

          {counts.length === 0 && !countError && (
            <div className="text-center text-white/60 py-6">Belum ada kandidat untuk posisi ini.</div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

const VoterRequired: React.FC<{ onRequireVoter: () => void }> = ({ onRequireVoter }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center flex-grow text-center gap-6"
  >
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-xl w-full">
      <div className="flex items-center justify-center gap-3 mb-4 text-cyan-300">
        <KeyRound />
        <h3 className="text-2xl font-bold text-white">Kode Pemilih Diperlukan</h3>
      </div>
      <p className="text-white/60 mb-6">Masukkan kode unik Anda untuk membuka surat suara.</p>
      <button
        onClick={onRequireVoter}
        className="px-6 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 font-semibold"
      >
        Masukkan Kode
      </button>
    </div>
  </motion.div>
);

const AdminRequired: React.FC<{ onRequireAdmin: () => void }> = ({ onRequireAdmin }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center flex-grow text-center gap-6"
  >
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-xl w-full">
      <div className="flex items-center justify-center gap-3 mb-4 text-cyan-300">
        <Shield />
        <h3 className="text-2xl font-bold text-white">Akses Admin Diperlukan</h3>
      </div>
      <p className="text-white/60 mb-6">Masukkan kredensial admin untuk membuka fitur ini.</p>
      <button
        onClick={onRequireAdmin}
        className="px-6 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 font-semibold"
      >
        Masuk sebagai Admin
      </button>
    </div>
  </motion.div>
);

export default App;
