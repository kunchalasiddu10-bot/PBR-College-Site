import React from 'react';

/**
 * IronManBackground
 * Uses a realistic Iron Man armor image as the full-page background,
 * with animated overlays: scan lines, arc reactor pulse, hex grid,
 * particles and corner glows on top.
 */
const IronManBackground: React.FC = () => {
  return (
    <div aria-hidden="true" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <style>{`
        /* ── The actual Iron Man image layer ── */
        .im-photo {
          position: absolute;
          inset: 0;
          background-image: url('/ironman-bg.png');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          opacity: 0.55;
          animation: imFloat 7s ease-in-out infinite;
        }
        @keyframes imFloat {
          0%,100% { transform: scale(1.00) translateY(0px); }
          50%      { transform: scale(1.02) translateY(-8px); }
        }

        /* ── Dark overlay so text stays readable ── */
        .im-dark-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right,  rgba(5,5,8,0.88) 0%,  rgba(5,5,8,0.4) 45%, rgba(5,5,8,0.15) 100%),
            linear-gradient(to bottom, rgba(5,5,8,0.6)  0%,  rgba(5,5,8,0.0) 40%, rgba(5,5,8,0.7)  100%);
        }

        /* ── Colour tint to blend Iron Man colours ── */
        .im-tint {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 70% 50%, rgba(140,15,15,0.30) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(0,100,160,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 85% 10%, rgba(180,130,0,0.14) 0%, transparent 55%);
        }

        /* ── Hex grid overlay ── */
        .im-hex {
          position: absolute;
          inset: -5%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52'%3E%3Cpath d='M30 2 L58 17 L58 37 L30 50 L2 37 L2 17 Z' fill='none' stroke='rgba(192,57,43,0.13)' stroke-width='0.8'/%3E%3C/svg%3E");
          background-size: 60px 52px;
          opacity: 0.7;
          animation: hexBreath 8s ease-in-out infinite;
        }
        @keyframes hexBreath { 0%,100%{opacity:0.5;} 50%{opacity:0.9;} }

        /* ── Fine circuit grid ── */
        .im-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* ── Arc reactor pulsing ring (over the suit's reactor position) ── */
        .im-reactor-ring {
          position: absolute;
          right: 26%;
          top: 44%;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid rgba(0,212,255,0.7);
          animation: reactorRing 2s ease-in-out infinite;
          transform: translate(50%, -50%);
        }
        .im-reactor-ring-2 {
          position: absolute;
          right: 26%;
          top: 44%;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          border: 1.5px solid rgba(0,212,255,0.5);
          transform: translate(50%, -50%);
          animation: reactorRing 2s ease-in-out infinite 0.3s;
        }
        .im-reactor-core {
          position: absolute;
          right: 26%;
          top: 44%;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, #00d4ff 50%, rgba(0,180,220,0) 100%);
          box-shadow: 0 0 20px 8px rgba(0,212,255,0.8), 0 0 60px 20px rgba(0,212,255,0.4);
          transform: translate(50%, -50%);
          animation: reactorCore 2s ease-in-out infinite;
        }
        @keyframes reactorRing {
          0%,100%{ box-shadow:0 0 10px rgba(0,212,255,0.4); opacity:0.8; }
          50%    { box-shadow:0 0 30px rgba(0,212,255,0.9); opacity:1; }
        }
        @keyframes reactorCore {
          0%,100%{ transform:translate(50%,-50%) scale(1); }
          50%    { transform:translate(50%,-50%) scale(1.4); }
        }

        /* ── Eye glow (approx helmet position) ── */
        .im-eye-l, .im-eye-r {
          position: absolute;
          width: 28px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 12px 6px rgba(0,212,255,0.8), 0 0 30px 10px rgba(0,212,255,0.5);
          animation: eyeGlow 3s ease-in-out infinite;
        }
        /* These are approximate — they sit on top of the suit image eyes */
        .im-eye-l { right: 29.5%; top: 16.5%; }
        .im-eye-r { right: 27.2%; top: 16.5%; }
        @keyframes eyeGlow {
          0%,100%{ opacity:0.8; box-shadow:0 0 12px 4px rgba(0,212,255,0.7); }
          50%    { opacity:1;   box-shadow:0 0 25px 10px rgba(255,255,255,0.9), 0 0 50px 15px rgba(0,212,255,0.6); }
        }

        /* ── Spinning arc reactor rings (left side of screen) ── */
        .im-rings {
          position: absolute;
          left: 6%;
          top: 50%;
          transform: translateY(-50%);
          width: min(300px, 28vw);
          height: min(300px, 28vw);
        }
        .imr {
          position:absolute; border-radius:50%; border-style:solid;
          top:50%; left:50%; transform:translate(-50%,-50%);
        }
        .imr1{ width:100%;height:100%; border-width:1.5px; border-color:rgba(192,57,43,0.55); animation:rCW 30s linear infinite; }
        .imr2{ width:82%;height:82%;   border-width:1px;   border-color:rgba(0,212,255,0.45);  animation:rCCW 20s linear infinite; border-style:dashed; }
        .imr3{ width:64%;height:64%;   border-width:1.5px; border-color:rgba(212,160,23,0.50); animation:rCW 14s linear infinite; }
        .imr4{ width:46%;height:46%;   border-width:1px;   border-color:rgba(192,57,43,0.65);  animation:rCCW 9s linear infinite; border-style:dashed; }
        .imr5{ width:28%;height:28%;   border-width:2px;   border-color:rgba(0,212,255,0.70);  animation:rCW 5s linear infinite; }
        .imr-core{
          position:absolute; width:10%;height:10%; border-radius:50%;
          top:50%;left:50%; transform:translate(-50%,-50%);
          background:radial-gradient(circle,#fff 0%,#00d4ff 40%,rgba(0,212,255,0) 80%);
          box-shadow:0 0 25px 6px rgba(0,212,255,0.6), 0 0 60px 15px rgba(0,212,255,0.25);
          animation:cPulse 3s ease-in-out infinite;
        }
        @keyframes rCW  { from{transform:translate(-50%,-50%) rotate(0deg);}   to{transform:translate(-50%,-50%) rotate(360deg);} }
        @keyframes rCCW { from{transform:translate(-50%,-50%) rotate(360deg);} to{transform:translate(-50%,-50%) rotate(0deg);} }
        @keyframes cPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);} 50%{transform:translate(-50%,-50%) scale(1.5);} }

        /* ── Pulse waves from reactor ── */
        .imPulse {
          position:absolute; border-radius:50%;
          top:50%;left:50%; transform:translate(-50%,-50%);
          border:1.5px solid rgba(0,212,255,0.6);
          width:5%;height:5%; opacity:0;
          animation:pExpand 4s ease-out infinite;
        }
        .imPulse2{ animation-delay:1.3s; border-color:rgba(192,57,43,0.5); }
        .imPulse3{ animation-delay:2.6s; border-color:rgba(212,160,23,0.4); }
        @keyframes pExpand{ 0%{width:5%;height:5%;opacity:.8;} 100%{width:110%;height:110%;opacity:0;} }

        /* ── Floating particles ── */
        .imp{ position:absolute; border-radius:50%; animation:fpUp linear infinite; }
        .fp1{ width:3px;height:3px;left:8%; top:30%;background:rgba(231,76,60,.9); animation-duration:13s; }
        .fp2{ width:2px;height:2px;left:20%;top:68%;background:rgba(0,212,255,.8); animation-duration:19s;animation-delay:-4s; }
        .fp3{ width:4px;height:4px;left:5%; top:55%;background:rgba(212,160,23,.9);animation-duration:11s;animation-delay:-7s; }
        .fp4{ width:2px;height:2px;left:15%;top:80%;background:rgba(231,76,60,.7); animation-duration:22s;animation-delay:-2s; }
        .fp5{ width:3px;height:3px;left:88%;top:20%;background:rgba(0,212,255,.7); animation-duration:16s;animation-delay:-9s; }
        .fp6{ width:2px;height:2px;left:92%;top:65%;background:rgba(212,160,23,.8);animation-duration:14s;animation-delay:-3s; }
        .fp7{ width:4px;height:4px;left:45%;top:5%; background:rgba(231,76,60,.8); animation-duration:10s;animation-delay:-6s; }
        .fp8{ width:2px;height:2px;left:78%;top:75%;background:rgba(0,212,255,.9); animation-duration:18s;animation-delay:-1s; }
        @keyframes fpUp{
          0%  {transform:translateY(0);opacity:0;}
          10% {opacity:1;}
          90% {opacity:0.8;}
          100%{transform:translateY(-90px);opacity:0;}
        }

        /* ── Corner glows ── */
        .imG-tl{position:absolute;top:-150px;left:-150px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(192,57,43,.25) 0%,transparent 70%);animation:gPulse 7s ease-in-out infinite;}
        .imG-br{position:absolute;bottom:-120px;right:-120px;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,.20) 0%,transparent 70%);animation:gPulse 9s ease-in-out infinite reverse;}
        @keyframes gPulse{0%,100%{opacity:.5;transform:scale(1);}50%{opacity:1;transform:scale(1.12);}}

        /* ── HUD scan sweep ── */
        .im-sweep{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,212,255,.55),transparent);animation:sweep 7s linear infinite;opacity:.65;}
        @keyframes sweep{0%{top:-2px;opacity:0;}5%{opacity:.65;}95%{opacity:.65;}100%{top:100%;opacity:0;}}

        /* ── Scan lines ── */
        .im-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,212,255,.012) 3px,rgba(0,212,255,.012) 4px);}

        /* ── HUD corner brackets (decorative) ── */
        .im-bracket-tl,.im-bracket-tr,.im-bracket-bl,.im-bracket-br{
          position:absolute; width:50px; height:50px;
          border-color:rgba(192,57,43,0.5); border-style:solid; border-width:0;
        }
        .im-bracket-tl{top:12px;left:12px; border-top-width:2px; border-left-width:2px;}
        .im-bracket-tr{top:12px;right:12px;border-top-width:2px; border-right-width:2px;}
        .im-bracket-bl{bottom:12px;left:12px;border-bottom-width:2px;border-left-width:2px;}
        .im-bracket-br{bottom:12px;right:12px;border-bottom-width:2px;border-right-width:2px;}
      `}</style>

      {/* 1. Real Iron Man photo */}
      <div className="im-photo" />

      {/* 2. Dark overlay (keeps UI readable) */}
      <div className="im-dark-overlay" />

      {/* 3. Colour tint */}
      <div className="im-tint" />

      {/* 4. Hex + circuit grids */}
      <div className="im-hex" />
      <div className="im-grid" />

      {/* 5. Arc reactor glow over the suit image */}
      <div className="im-reactor-ring" />
      <div className="im-reactor-ring-2" />
      <div className="im-reactor-core" />

      {/* 6. Eye glows */}
      <div className="im-eye-l" />
      <div className="im-eye-r" />

      {/* 7. Spinning rings (left) */}
      <div className="im-rings">
        <div className="imr imr1" />
        <div className="imr imr2" />
        <div className="imr imr3" />
        <div className="imr imr4" />
        <div className="imr imr5" />
        <div className="imr-core" />
        <div className="imPulse" />
        <div className="imPulse imPulse2" />
        <div className="imPulse imPulse3" />
      </div>

      {/* 8. Particles */}
      {['fp1','fp2','fp3','fp4','fp5','fp6','fp7','fp8'].map(c => (
        <div key={c} className={`imp ${c}`} />
      ))}

      {/* 9. Corner glows */}
      <div className="imG-tl" />
      <div className="imG-br" />

      {/* 10. HUD decorations */}
      <div className="im-sweep" />
      <div className="im-scanlines" />
      <div className="im-bracket-tl" />
      <div className="im-bracket-tr" />
      <div className="im-bracket-bl" />
      <div className="im-bracket-br" />
    </div>
  );
};

export default IronManBackground;
