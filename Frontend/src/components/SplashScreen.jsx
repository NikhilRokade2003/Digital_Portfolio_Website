import React from "react";
import DigitalPortfolioLogo from '../assets/digital portfolio logo.png';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-br from-blue-100 via-sky-200 via-pink-200 via-yellow-100 via-emerald-100 to-indigo-200 animate-splash-wave bg-[length:300%_300%]">
      {/* Logo at top left */}
      <div className="absolute top-8 left-8 z-20 flex items-center">
        <img src={DigitalPortfolioLogo} alt="Digital Portfolio Logo" className="h-24 w-24 rounded-full bg-white/80 p-2" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-black text-blue-900 animate-bounce font-mono tracking-wide">Digital Portfolio</h1>
        <p className="mt-4 text-xl text-blue-800 font-bold animate-pulse font-mono tracking-wide">Unleash your creativity. Your journey starts here!</p>
      </div>
      {/* Animated SVG Wave at the bottom */}
      <div className="w-full overflow-hidden leading-none z-10" style={{marginBottom: '-2px', height: '50vh'}}>
        <svg className="w-[300vw] h-full block" viewBox="0 0 11520 1200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradientLightBlue" x1="0" y1="0" x2="3840" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7dd3fc" />
              <stop offset="0.3" stopColor="#bae6fd" />
              <stop offset="0.7" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <path d="M0,960 Q2880,1200 5760,960 T11520,960 V1200 H0 Z" fill="url(#waveGradientLightBlue)" opacity="0.85">
            <animate attributeName="d" dur="2.5s" repeatCount="indefinite" begin="0.01s"
              values="M0,960 Q2880,1200 5760,960 T11520,960 V1200 H0 Z;
                      M0,960 Q2880,600 5760,1100 T11520,960 V1200 H0 Z;
                      M0,960 Q2880,1200 5760,960 T11520,960 V1200 H0 Z" />
          </path>
        </svg>
      </div>
    </div>
  );
}
