import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'INITIALIZING CAMPUSVERSE SYSTEMS...',
}) => {
  const [progress, setProgress] = useState(0);
  const [statusLine, setStatusLine] = useState(0);
  const statusLines = [
    'LOADING STARK PROTOCOL',
    'AUTHENTICATING NEURAL LINK',
    'SYNCING CAMPUS DATABASE',
    'JARVIS ONLINE',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusLine(prev => Math.min(prev + 1, statusLines.length - 1));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center gap-10 bg-stark-bg circuit-bg scan-overlay relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Arc Reactor */}
      <div className="arc-reactor h-36 w-36 animate-float">
        {/* Outer decorative ring */}
        <div className="absolute inset-0 rounded-full border-2 border-stark-cyan/20 animate-arc-spin"
          style={{ borderStyle: 'dashed' }} />
        {/* Ring 1 */}
        <div className="absolute rounded-full border-2 border-stark-cyan/40 animate-arc-spin"
          style={{ inset: '8%' }} />
        {/* Ring 2 counter */}
        <div className="absolute rounded-full border border-stark-red/50 animate-arc-spin-rev"
          style={{ inset: '22%' }} />
        {/* Ring 3 */}
        <div className="absolute rounded-full border-2 border-stark-gold/30 animate-arc-spin"
          style={{ inset: '35%', animationDuration: '5s' }} />
        {/* Core */}
        <div className="relative z-10 h-14 w-14 rounded-full bg-stark-cyan animate-arc-pulse"
          style={{ boxShadow: '0 0 30px rgba(0,212,255,1), 0 0 80px rgba(0,212,255,0.5), 0 0 140px rgba(0,212,255,0.2)' }}>
          <div className="absolute inset-2 rounded-full bg-white/90" />
        </div>
      </div>

      {/* Text block */}
      <div className="flex flex-col items-center gap-3 z-10">
        <h1 className="font-hud text-xl font-bold tracking-widest text-stark-text text-glow-red">
          CAMPUSVERSE AI
        </h1>
        <div className="font-hud text-[10px] tracking-[0.4em] text-stark-cyan uppercase animate-arc-pulse">
          {statusLines[statusLine]}
        </div>
        <div className="font-display text-xs text-stark-muted mt-1 tracking-wider">
          {message}
        </div>
      </div>

      {/* Progress bar */}
      <div className="z-10 w-64 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-hud text-[9px] tracking-widest text-stark-dim uppercase">Loading</span>
          <span className="font-hud text-[9px] text-stark-red">{progress}%</span>
        </div>
        <div className="stark-progress">
          <div
            className="stark-progress-bar transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-1 mt-1">
          {statusLines.map((_, i) => (
            <div key={i}
              className={`h-0.5 rounded-full transition-all duration-500 ${
                i <= statusLine ? 'bg-stark-red' : 'bg-stark-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom brand */}
      <div className="absolute bottom-8 font-hud text-[9px] tracking-[0.4em] text-stark-dim uppercase">
        STARK INDUSTRIES · AUTHORIZED ACCESS ONLY
      </div>
    </div>
  );
};

export default LoadingScreen;
