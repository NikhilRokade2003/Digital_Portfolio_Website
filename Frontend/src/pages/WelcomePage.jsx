import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authAPI } from '../../services/api';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [particles, setParticles] = useState([]);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authAPI.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

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
        color: 0x9e335,
        backgroundColor: 0x1a1a2e,
        maxDistance: 25.00,
        spacing: 18.00,
        showDots: true,
        points: 12.00
      });
    }

    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, []);

  useEffect(() => {
    // Generate floating particles
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 8,
          duration: 8 + Math.random() * 4,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const createNeuralNetworkPath = () => {
    const width = window.innerWidth || 1920;
    const height = window.innerHeight || 1080;
    const points = [];
    
    // Generate random points for neural network
    for (let i = 0; i < 8; i++) {
      points.push({
        x: (Math.random() * width * 0.8) + (width * 0.1),
        y: (Math.random() * height * 0.8) + (height * 0.1),
      });
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation />
      
      {/* Vanta.js NET Background */}
      <div 
        ref={vantaRef}
        className="absolute inset-0 z-0"
        style={{ minHeight: '100vh' }}
      />
      
      {/* Live Wallpaper Background - Additional Effects */}
      <div className="live-wallpaper absolute inset-0 z-1 pointer-events-none opacity-50">
        {/* Floating Shapes */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        
        {/* Aurora Effect */}
        <div className="aurora-effect"></div>
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particles"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
        
        {/* Neural Network SVG */}
        <svg className="neural-network">
          <path
            className="neural-line"
            d={createNeuralNetworkPath()}
            style={{ animationDelay: '0s' }}
          />
          <path
            className="neural-line"
            d={createNeuralNetworkPath()}
            style={{ animationDelay: '2s' }}
          />
          <path
            className="neural-line"
            d={createNeuralNetworkPath()}
            style={{ animationDelay: '4s' }}
          />
        </svg>
      </div>
      
      {/* Welcome Content */}
      <div className="welcome-hero min-h-screen flex items-center justify-center px-4 pt-16 relative z-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Title */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/20 mb-8">
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">3D Network Portfolio</span>
              </div>
            </div>
            <h1 className="welcome-title mb-6">
              Welcome to
              <br />
              <span className="gradient-text">Portfoliofy</span>
            </h1>
            <p className="welcome-subtitle mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning, professional portfolios that showcase your talents, 
              projects, and achievements. Stand out from the crowd with our 
              cutting-edge design tools and AI-powered features.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="holographic-card p-6">
              <div className="rotating-cube mx-auto mb-4">
                <div className="rotating-cube-face cube-face-front"></div>
                <div className="rotating-cube-face cube-face-back"></div>
                <div className="rotating-cube-face cube-face-right"></div>
                <div className="rotating-cube-face cube-face-left"></div>
                <div className="rotating-cube-face cube-face-top"></div>
                <div className="rotating-cube-face cube-face-bottom"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 animated-underline">
                AI-Powered Creation
              </h3>
              <p className="text-white/70">
                Let our intelligent chatbot help you build your portfolio with personalized suggestions and content optimization.
              </p>
            </div>

            <div className="holographic-card p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                🎨
              </div>
              <h3 className="text-xl font-bold text-white mb-3 animated-underline">
                Modern Design
              </h3>
              <p className="text-white/70">
                Choose from stunning templates with holographic effects, animations, and responsive layouts that work everywhere.
              </p>
            </div>

            <div className="holographic-card p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                🚀
              </div>
              <h3 className="text-xl font-bold text-white mb-3 animated-underline">
                Easy Sharing
              </h3>
              <p className="text-white/70">
                Share your portfolio instantly with custom URLs, PDF exports, and social media integration.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={handleGetStarted}
              className="welcome-cta-button px-12 py-4 rounded-2xl text-white font-semibold text-lg flex items-center space-x-3 group"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
              <svg 
                className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="glass-button px-8 py-4 rounded-2xl text-white font-medium text-lg"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* User Greeting */}
          {isAuthenticated && user && (
            <div className="mt-8">
              <div className="holographic-card p-4 max-w-md mx-auto">
                <p className="text-white/80">
                  Welcome back, <span className="text-white font-semibold animated-underline-always">{user.fullName}</span>!
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-white/60 text-sm">Portfolios Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-white/60 text-sm">Design Templates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/60 text-sm">AI Assistance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-white/60 text-sm">Responsive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default WelcomePage;