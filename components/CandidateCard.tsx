import React from 'react';
import { Candidate } from '../types';
import { GlassCard } from './GlassCard';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isSelected, onSelect }) => {
  return (
    <GlassCard 
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'ring-4 ring-cyan-400 bg-white/20' : 'hover:bg-white/5'}`}
      onClick={() => onSelect(candidate.id)}
      hoverEffect={!isSelected}
    >
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-4 right-4 z-20 bg-cyan-500 rounded-full p-1"
          >
            <CheckCircle className="w-6 h-6 text-white fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 flex flex-col items-center text-center gap-3">
        <h3 className="text-xl font-bold text-white">{candidate.name}</h3>
        <p className="text-sm text-white/60">Klik untuk memilih kandidat ini.</p>
      </div>
    </GlassCard>
  );
};
