/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Iron Man Color System
        stark: {
          bg:       '#050508',       // Deep space black
          surface:  '#0a0a10',       // Dark surface
          panel:    '#0d0d15',       // Card/panel bg
          border:   '#1a1a2e',       // Default border
          red:      '#c0392b',       // Iron Man Red
          'red-bright': '#e74c3c',   // Bright red accent
          gold:     '#d4a017',       // Stark Gold
          'gold-bright': '#f1c40f',  // Bright gold
          cyan:     '#00d4ff',       // Arc Reactor Cyan
          'cyan-dim': '#0099bb',     // Dim cyan
          text:     '#e8eaed',       // Near white text
          muted:    '#7a8ba5',       // Muted HUD gray
          dim:      '#3d4a5c',       // Very dim
        },
        // Keep primary alias pointing to stark red for compatibility
        primary: {
          50:  '#fff0f0',
          100: '#ffd6d6',
          200: '#ffadad',
          300: '#ff7b7b',
          400: '#f04040',
          500: '#c0392b',
          600: '#a93226',
          700: '#922b21',
          800: '#7b241c',
          900: '#641e16',
          950: '#4d1610',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        hud:     ['Orbitron', 'monospace'],     // HUD titles
        display: ['Rajdhani', 'sans-serif'],    // UI labels / readouts
      },
      backgroundImage: {
        'circuit-grid': `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
        'arc-glow':   'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
        'red-glow':   'radial-gradient(ellipse at center, rgba(192, 57, 43, 0.2) 0%, transparent 70%)',
        'gold-glow':  'radial-gradient(ellipse at center, rgba(212, 160, 23, 0.2) 0%, transparent 70%)',
        'stark-gradient': 'linear-gradient(135deg, #c0392b 0%, #d4a017 100%)',
        'hud-panel': 'linear-gradient(135deg, rgba(13,13,21,0.95) 0%, rgba(10,10,16,0.98) 100%)',
      },
      backgroundSize: {
        'circuit': '60px 60px',
      },
      boxShadow: {
        'arc':        '0 0 20px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.15)',
        'arc-sm':     '0 0 10px rgba(0, 212, 255, 0.3)',
        'red-glow':   '0 0 20px rgba(192, 57, 43, 0.5), 0 0 60px rgba(192, 57, 43, 0.2)',
        'red-sm':     '0 0 10px rgba(192, 57, 43, 0.4)',
        'gold-glow':  '0 0 20px rgba(212, 160, 23, 0.5), 0 0 60px rgba(212, 160, 23, 0.2)',
        'gold-sm':    '0 0 10px rgba(212, 160, 23, 0.4)',
        'hud-card':   '0 4px 24px rgba(0,0,0,0.6), 0 0 1px rgba(0, 212, 255, 0.1)',
        'hud-active': '0 4px 32px rgba(192, 57, 43, 0.3), inset 0 0 20px rgba(192, 57, 43, 0.05)',
      },
      animation: {
        // Core Animations
        'fade-in':       'fadeIn 0.3s ease-out forwards',
        'slide-up':      'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        // Iron Man Specific
        'arc-pulse':     'arcPulse 3s ease-in-out infinite',
        'arc-spin':      'arcSpin 8s linear infinite',
        'arc-spin-rev':  'arcSpinRev 12s linear infinite',
        'scan-line':     'scanLine 3s linear infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'hud-boot':      'hudBoot 0.6s ease-out forwards',
        'text-flicker':  'textFlicker 0.15s ease-in-out infinite',
        'border-glow':   'borderGlow 2s ease-in-out infinite',
        'data-stream':   'dataStream 20s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'red-pulse':     'redPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        arcPulse: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
        arcSpin: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        arcSpinRev: {
          '0%':   { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.2)' },
        },
        hudBoot: {
          '0%':   { opacity: '0', transform: 'scaleX(0)' },
          '60%':  { opacity: '1', transform: 'scaleX(1.02)' },
          '100%': { opacity: '1', transform: 'scaleX(1)' },
        },
        textFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.8' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(192, 57, 43, 0.5)' },
          '50%':      { borderColor: 'rgba(192, 57, 43, 1)' },
        },
        dataStream: {
          '0%':   { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        redPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(192, 57, 43, 0.4)' },
          '50%':      { boxShadow: '0 0 30px rgba(192, 57, 43, 0.8), 0 0 60px rgba(192, 57, 43, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
