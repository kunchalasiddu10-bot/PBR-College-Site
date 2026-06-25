import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import IronManBackground from '../components/ui/IronManBackground';

export const AuthLayout: React.FC = () => {
  const [bootText, setBootText] = useState('');
  const bootSequence = [
    'INITIALIZING STARK PROTOCOL...',
    'LOADING CAMPUSVERSE AI v7.0...',
    'JARVIS ONLINE. AWAITING INPUT.',
  ];
  const [bootLine, setBootLine] = useState(0);

  useEffect(() => {
    // Always force dark mode for Iron Man theme
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // Typing boot sequence animation
  useEffect(() => {
    if (bootLine >= bootSequence.length) return;
    const target = bootSequence[bootLine];
    let i = 0;
    setBootText('');
    const interval = setInterval(() => {
      i++;
      setBootText(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(interval);
        setTimeout(() => setBootLine(prev => prev + 1), 600);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [bootLine]);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden" style={{ background: '#050508' }}>
      <IronManBackground />



      {/* ══ LEFT PANEL — Iron Man Graphic ══ */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden items-center justify-center p-12 z-10" style={{ background: 'rgba(5,5,8,0.5)' }}>
        {/* Red vertical accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, #e74c3c, transparent)', opacity: 0.6 }} />

        <div className="relative z-10 max-w-lg flex flex-col gap-8 animate-fade-in">

          {/* Logo */}
          <Logo size="lg" />

          {/* Boot sequence */}
          <div className="font-hud text-[12px] tracking-widest min-h-[20px]" style={{ color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.8)' }}>
            {bootText}
            <span className="animate-text-flicker">█</span>
          </div>

          {/* Main headline — dark backdrop for readability */}
          <div className="rounded-xl p-5" style={{ background: 'rgba(3,3,8,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(192,57,43,0.25)' }}>
            <h1 className="font-hud text-4xl lg:text-5xl font-bold leading-tight mb-3" style={{ color: '#ffffff', textShadow: '0 0 30px rgba(192,57,43,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}>
              THE <span style={{ color: '#ff4444', textShadow: '0 0 20px rgba(255,68,68,1), 0 0 40px rgba(192,57,43,0.6)' }}>IRON</span>{' '}
              CAMPUS
            </h1>
            <h2 className="font-hud text-2xl font-bold mb-4" style={{ color: '#f5c842', textShadow: '0 0 20px rgba(245,200,66,0.9), 0 0 40px rgba(212,160,23,0.5)' }}>
              JARVIS-POWERED ERP
            </h2>
            <p className="font-display text-base leading-relaxed max-w-sm" style={{ color: '#dde4ee', lineHeight: '1.8', fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              Centralized academics, AI intelligence, and real-time operations —
              engineered with Stark-level precision for modern educational institutions.
            </p>
          </div>

          {/* HUD stat display */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'MODULES', value: '12+' },
              { label: 'AI POWERED', value: '100%' },
              { label: 'UPTIME', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 text-center rounded-lg" style={{ background: 'rgba(3,3,8,0.82)', border: '1px solid rgba(192,57,43,0.4)', backdropFilter: 'blur(6px)' }}>
                <div className="font-hud text-xl font-bold" style={{ color: '#ff5555', textShadow: '0 0 15px rgba(231,76,60,0.9)' }}>{stat.value}</div>
                <div className="font-display text-[10px] tracking-widest uppercase mt-1" style={{ color: '#8fa0b8', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Arc Reactor display */}
          <div className="flex items-center gap-6">
            {/* Arc Reactor */}
            <div className="arc-reactor h-20 w-20">
              <div className="arc-reactor-ring-outer" />
              <div className="arc-reactor-ring-mid" />
              <div className="arc-reactor-core h-8 w-8" />
            </div>

            <div>
              <div className="font-hud text-[11px] tracking-widest uppercase mb-1" style={{ color: '#f5c842', textShadow: '0 0 8px rgba(245,200,66,0.7)' }}>
                Core Status
              </div>
              <div className="font-hud text-base font-bold" style={{ color: '#00d4ff', textShadow: '0 0 15px rgba(0,212,255,0.9)' }}>ONLINE</div>
              <div className="font-display text-sm mt-1" style={{ color: '#c0ccd8', fontWeight: 500 }}>
                All systems nominal
              </div>
              {/* Mini progress bar */}
              <div className="stark-progress mt-2 w-32">
                <div className="stark-progress-bar w-full animate-pulse" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>

          {/* AI Assistant preview card */}
          <div className="p-4 flex gap-3 items-start rounded-xl" style={{ background: 'rgba(3,3,12,0.82)', border: '1px solid rgba(0,212,255,0.35)', backdropFilter: 'blur(8px)' }}>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.4)' }}>
              <span className="font-hud text-xs font-bold" style={{ color: '#00d4ff' }}>AI</span>
            </div>
            <div>
              <p className="font-hud text-[10px] tracking-widest uppercase mb-1" style={{ color: '#00d4ff', textShadow: '0 0 8px rgba(0,212,255,0.7)' }}>
                JARVIS Assistant
              </p>
              <p className="font-display text-sm" style={{ color: '#ffffff', fontWeight: 500 }}>
                "What exams do I have this week, JARVIS?"
              </p>
              <p className="font-display text-sm mt-1" style={{ color: '#8fa8c8', fontWeight: 500 }}>
                → Retrieving schedule... 3 exams found.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — Login Form ══ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 min-h-screen" style={{ background: 'rgba(5,5,8,0.3)' }}>

        {/* Top right status */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-stark-cyan animate-arc-pulse" />
          <span className="font-hud text-[9px] tracking-widest text-stark-cyan/60 uppercase">
            Secure Connection
          </span>
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden mb-8 self-center">
          <Logo size="md" />
        </div>

        {/* Form Content */}
        <div className="w-full flex justify-center">
          <Outlet />
        </div>

        {/* Bottom footer */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="font-hud text-[9px] tracking-widest text-stark-dim uppercase">
            © Stark Industries · CampusVerse AI · All Rights Reserved
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
