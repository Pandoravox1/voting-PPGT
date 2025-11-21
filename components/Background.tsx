import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
      {/* Blurry Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/30 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[130px] animate-pulse mix-blend-screen" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-cyan-500/20 rounded-full blur-[100px] mix-blend-screen" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
    </div>
  );
};