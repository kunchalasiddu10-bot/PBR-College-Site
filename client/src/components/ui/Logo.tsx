import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { reactor: 'h-8 w-8',  text: 'text-base', ring: 'h-8 w-8', core: 'h-3 w-3' },
    md: { reactor: 'h-10 w-10', text: 'text-xl',  ring: 'h-10 w-10', core: 'h-4 w-4' },
    lg: { reactor: 'h-16 w-16', text: 'text-3xl', ring: 'h-16 w-16', core: 'h-6 w-6' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Arc Reactor Icon */}
      <div className={`relative flex items-center justify-center ${s.reactor}`}>
        {/* Outer ring - spinning */}
        <div
          className="absolute inset-0 rounded-full border-2 border-stark-cyan/40 animate-arc-spin"
          style={{ borderStyle: 'dashed' }}
        />
        {/* Mid ring - counter-spinning */}
        <div
          className="absolute rounded-full border border-stark-red/60 animate-arc-spin-rev"
          style={{ inset: '20%' }}
        />
        {/* Core glow */}
        <div
          className={`relative z-10 rounded-full bg-stark-cyan ${s.core} animate-arc-pulse`}
          style={{
            boxShadow: '0 0 8px rgba(0, 212, 255, 0.9), 0 0 20px rgba(0, 212, 255, 0.4)',
          }}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-hud font-bold tracking-widest uppercase text-stark-text ${s.text}`}
          style={{ letterSpacing: '0.15em' }}
        >
          Campus<span className="text-stark-red">Verse</span>
        </span>
        {size !== 'sm' && (
          <span className="font-display text-[10px] tracking-[0.4em] text-stark-cyan uppercase mt-0.5">
            AI · Stark Protocol
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
