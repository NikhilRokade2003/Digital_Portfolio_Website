import React, { useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';

const AdminDashboard = () => {
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

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="glass-card p-6 hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="text-4xl opacity-60">{icon}</div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="System Health" value="99.9%" icon="⚡" trend={0.1} />
        <StatCard title="Active Deployments" value="42" icon="🚀" trend={15} />
        <StatCard title="Server Uptime" value="30d" icon="�" trend={5} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/80 text-sm">New portfolio created by John Doe</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/80 text-sm">Portfolio created: Professional Template</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-white/80 text-sm">Portfolio updated: Mike Johnson</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white/80">Database</span>
              <span className="text-green-400">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white/80">API Response Time</span>
              <span className="text-green-400">~150ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white/80">Storage Used</span>
              <span className="text-yellow-400">68%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden" ref={vantaRef}>
      <Navigation />
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        <div className="live-wallpaper-shape live-wallpaper-1 opacity-20"></div>
        <div className="live-wallpaper-shape live-wallpaper-2 opacity-15"></div>
        <div className="live-wallpaper-shape live-wallpaper-3 opacity-20"></div>
        <div className="floating-particles opacity-30">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="aurora opacity-25"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 main-content">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-white/70">Monitor system status and analytics</p>
        </div>

        <OverviewTab />
      </div>
    </div>
  );
};

export default AdminDashboard;