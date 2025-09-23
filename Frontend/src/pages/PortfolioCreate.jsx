import React, { useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import PortfolioCreateModern from '../components/PortfolioCreateModern';

const PortfolioCreate = () => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Initialize Vanta.js NET effect
  useEffect(() => {
    if (vantaRef.current && window.VANTA) {
      vantaEffect.current = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x3b82f6,
        backgroundColor: 0x0f172a,
        points: 15.00,
        maxDistance: 25.00,
        spacing: 18.00
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" ref={vantaRef}>
      <Navigation />
      
      <div className="relative z-10 main-content">
        <PortfolioCreateModern />
      </div>
    </div>
  );
};

export default PortfolioCreate;