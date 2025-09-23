import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authAPI, statisticsAPI } from '../../services/api';

const LiveWallpaperWelcome = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState({
    users: '10K+',
    portfolios: '50K+',
    uptime: '99.9%',
    support: '24/7'
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
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

    const fetchStatistics = async () => {
      try {
        setIsLoadingStats(true);
        const response = await statisticsAPI.getStatistics();
        const data = response.data;
        
        setStatistics({
          users: data.formattedStats.users || '0',
          portfolios: data.formattedStats.portfolios || '0',
          uptime: data.uptime || '99.9%',
          support: data.support || '24/7'
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Keep default values on error
      } finally {
        setIsLoadingStats(false);
      }
    };

    checkAuth();
    fetchStatistics();
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
        backgroundColor: 0x0f0f23,
        maxDistance: 25.00,
        spacing: 18.00,
        showDots: true,
        points: 15.00
      });
    }

    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
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
      <div className="absolute inset-0 z-1 pointer-events-none">
        {/* Animated Background Shapes */}
        <div className="live-wallpaper-shape live-wallpaper-1 opacity-30"></div>
        <div className="live-wallpaper-shape live-wallpaper-2 opacity-20"></div>
        <div className="live-wallpaper-shape live-wallpaper-3 opacity-25"></div>
        
        {/* Floating Particles */}
        <div className="floating-particles opacity-40">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        
        {/* Aurora Effect */}
        <div className="aurora opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center p-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/20 mb-8">
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">3D Network Portfolio Platform</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Create.
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Showcase.
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                Succeed.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your career with AI-powered portfolio creation.
              <br className="hidden md:block" />
              <span className="text-purple-300">Interactive.</span>{' '}
              <span className="text-blue-300">Professional.</span>{' '}
              <span className="text-green-300">Stunning.</span>
            </p>
          </div>

          {/* Interactive Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '🤖', title: 'AI Assistant', desc: 'Smart content generation' },
              { icon: '🎨', title: 'Live Design', desc: 'Real-time visual effects' },
              { icon: '📱', title: 'Responsive', desc: 'Works on all devices' },
              { icon: '⚡', title: 'Fast Export', desc: 'Instant PDF & sharing' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 holographic-card">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-white font-bold mb-2 animated-underline">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <button
              onClick={handleGetStarted}
              className="group relative px-12 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Creating'}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-8 py-4 text-lg font-medium text-white bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* User Welcome */}
          {isAuthenticated && user && (
            <div className="mb-8">
              <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <span className="text-white">
                  Welcome back, <span className="font-semibold text-purple-300">{user.fullName}</span>!
                </span>
              </div>
            </div>
          )}

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: statistics.users, label: 'Users', loading: isLoadingStats },
              { value: statistics.portfolios, label: 'Portfolios', loading: isLoadingStats },
              { value: statistics.uptime, label: 'Uptime', loading: isLoadingStats },
              { value: statistics.support, label: 'Support', loading: isLoadingStats }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                  {stat.loading ? (
                    <div className="animate-pulse bg-white/20 rounded h-8 w-16 mx-auto"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-white/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWallpaperWelcome;