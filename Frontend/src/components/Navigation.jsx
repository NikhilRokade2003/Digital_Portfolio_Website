import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { authAPI } from '../../services/api';

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

    // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleResize = () => {
      if (dropdownOpen) {
        calculateDropdownPosition();
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [dropdownOpen]);

  // Calculate dropdown position when opened
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 8, // 8px gap
        left: rect.right + scrollX - 224 // 224px = w-56 (14rem * 16px)
      });
    }
  };

  const toggleDropdown = () => {
    if (!dropdownOpen) {
      calculateDropdownPosition();
    }
    setDropdownOpen(!dropdownOpen);
  };

  const checkAuthStatus = async () => {
    try {
      const isAuth = await authAPI.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Starting logout process...');
      
      // Call the logout API endpoint
      await authAPI.logout();
      console.log('API logout successful');
      
      // Clear local state immediately
      setIsAuthenticated(false);
      setUser(null);
      setDropdownOpen(false);
      
      // Clear any storage items
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('isAuthenticated');
      
      console.log('Local state cleared, navigating to home...');
      
      // Navigate to home page and reload to ensure complete cleanup
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error logging out:', error);
      
      // Even if API call fails, clear local state and redirect
      setIsAuthenticated(false);
      setUser(null);
      setDropdownOpen(false);
      localStorage.clear();
      sessionStorage.clear();
      
      // Force navigation to home
      window.location.href = '/';
    }
  };

  const publicLinks = [
    { path: '/', label: 'Home', active: location.pathname === '/' },
    { path: '/dashboard', label: 'Browse Portfolios', active: location.pathname === '/dashboard' || location.pathname === '/portfolios' || location.pathname === '/browse' }
  ];

  const authenticatedLinks = [
    { path: '/dashboard', label: 'Browse Portfolios', active: location.pathname === '/dashboard' || location.pathname === '/portfolios' || location.pathname === '/browse' },
    { path: '/portfolio/manager', label: 'My Portfolios', active: location.pathname === '/portfolio/manager', icon: '💼' },
    { path: '/notifications', label: 'Notifications', active: location.pathname === '/notifications', icon: '🔔' },
    { path: '/chatbot', label: 'AI Assistant', active: location.pathname === '/chatbot', icon: '🤖' }
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Panel', active: location.pathname === '/admin', icon: '👑' }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">DP</span>
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                Digital Portfolio
              </span>
            </Link>
          </div>

          {/* Navigation Links - Right Side */}
          <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 ml-auto">
            {!isAuthenticated ? (
              <>
                {publicLinks.map(link => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      link.active
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="hidden sm:inline">{link.label}</span>
                    <span className="sm:hidden text-lg">🏠</span>
                  </Link>
                ))}
                <Link 
                  to="/login" 
                  className="px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 text-sm font-medium"
                >
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden text-lg">👤</span>
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg text-sm font-semibold hover:from-primary-600 hover:to-accent-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">+</span>
                </Link>
              </>
            ) : (
              <>
                {/* Authenticated Navigation */}
                {authenticatedLinks.map(link => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                      link.active
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.icon && <span className="text-base">{link.icon}</span>}
                    <span className="hidden lg:inline text-xs">{link.label}</span>
                  </Link>
                ))}

                {/* Admin Links (if user is admin) */}
                {user?.role === 'Admin' && adminLinks.map(link => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                      link.active
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.icon && <span className="text-base">{link.icon}</span>}
                    <span className="hidden lg:inline text-xs">{link.label}</span>
                  </Link>
                ))}

                {/* User Dropdown */}
                <div className="relative user-dropdown z-[99998]">
                  <button
                    ref={buttonRef}
                    onClick={toggleDropdown}
                    className="flex items-center space-x-1 px-2 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-7 h-7 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm max-w-20 truncate">{user?.fullName || 'User'}</span>
                    <span className="text-xs hidden sm:inline">▼</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      </nav>

      {/* Portal-based Dropdown */}
      {dropdownOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-slate-800/95 border border-white/20 rounded-xl py-2 shadow-2xl backdrop-blur-md w-56"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 2147483647 // Maximum z-index
          }}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-medium text-sm truncate">{user?.fullName}</p>
            <p className="text-white/70 text-xs break-all">{user?.email}</p>
            {user?.role && (
              <p className="text-white/50 text-xs mt-1">Role: {user.role}</p>
            )}
          </div>
          
          <Link
            to="/profile"
            className="flex items-center space-x-2 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            onClick={() => setDropdownOpen(false)}
          >
            <span>👤</span>
            <span>Profile Settings</span>
          </Link>
          
          <div className="border-t border-white/10 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navigation;