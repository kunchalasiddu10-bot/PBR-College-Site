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
          <div className="font-hud text-[11px] tracking-widest text-stark-cyan/80 min-h-[20px]">
            {bootText}
            <span className="animate-text-flicker">█</span>
          </div>

          {/* Main headline */}
          <div>
            <h1 className="font-hud text-3xl lg:text-4xl font-bold leading-tight mb-3" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              THE <span className="text-stark-red text-glow-red">IRON</span>{' '}
              CAMPUS
            </h1>
            <h2 className="font-hud text-xl text-glow-gold" style={{ color: '#f1c40f', fontSize: '1.2rem' }}>
              JARVIS-POWERED ERP
            </h2>
            <p className="font-display text-sm mt-4 leading-relaxed max-w-sm" style={{ color: '#c0ccd8', lineHeight: '1.7' }}>
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
              <div key={stat.label} className="hud-panel p-3 text-center">
                <div className="font-hud text-lg font-bold text-stark-red">{stat.value}</div>
                <div className="font-display text-[9px] tracking-widest text-stark-muted uppercase mt-1">{stat.label}</div>
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
              <div className="font-hud text-[10px] tracking-widest text-stark-gold uppercase mb-1">
                Core Status
              </div>
              <div className="font-hud text-sm text-stark-cyan">ONLINE</div>
              <div className="font-display text-xs text-stark-muted mt-1">
                All systems nominal
              </div>
              {/* Mini progress bar */}
              <div className="stark-progress mt-2 w-32">
                <div className="stark-progress-bar w-full animate-pulse" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>

          {/* AI Assistant preview card */}
          <div className="hud-panel-cyan p-4 flex gap-3 items-start animate-float">
            <div className="h-9 w-9 rounded-lg bg-stark-cyan/10 border border-stark-cyan/30 flex items-center justify-center flex-shrink-0">
              <span className="font-hud text-stark-cyan text-xs">AI</span>
            </div>
            <div>
              <p className="font-hud text-[9px] tracking-widest text-stark-cyan/70 uppercase mb-1">
                JARVIS Assistant
              </p>
              <p className="font-display text-sm text-stark-text">
                "What exams do I have this week, JARVIS?"
              </p>
              <p className="font-display text-xs text-stark-muted mt-1">
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
