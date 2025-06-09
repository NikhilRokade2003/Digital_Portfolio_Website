import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import JadeLogo from '../assets/Jade-logo.svg';

const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current page is Dashboard to show Browse Portfolios link
  const isDashboardPage = location.pathname === '/dashboard';
  
  // Check if we should show the Dashboard link (not on homepage, login, or register pages)
  const shouldShowDashboardLink = isAuthenticated && 
    location.pathname !== '/' && 
    location.pathname !== '/login' && 
    location.pathname !== '/register' &&
    location.pathname !== '/dashboard';

  useEffect(() => {
    // Check if user is authenticated using the session endpoint
    const checkAuth = async () => {
      try {
        const authenticated = await authAPI.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        // If authenticated, get the user's name
        if (authenticated) {
          try {
            const userData = await authAPI.getCurrentUser();
            if (userData?.data?.fullName) {
              setUserName(userData.data.fullName);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [location.pathname]); // Re-check when path changes

  const handleLogout = async () => {
    // Call the logout endpoint to clear the session cookie
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Active link style
  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "text-white font-medium border-b-2 border-accent-300" 
      : "text-white hover:text-white/80 font-medium transition-colors duration-300 border-b-2 border-transparent hover:border-gray-400";
  };

  return (
    <nav className="bg-gray-800 text-white shadow-medium sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white rounded-lg p-1.5 shadow-sm">
              <img src={JadeLogo} alt="Jade Logo" className="h-6 w-20" />
            </div>
            <span className="text-xl font-bold">Digital Portfolio Builder</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-white hover:text-accent-200 focus:outline-none bg-gray-700 p-1.5 rounded-md"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path fillRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <Link to="/" className={getLinkStyle('/')}>
                Home
              </Link>
              
              {isDashboardPage && (
                <Link to="/portfolios" className={getLinkStyle('/portfolios')}>
                  Browse Portfolios
                </Link>
              )}
              
              {shouldShowDashboardLink && (
                <Link to="/dashboard" className={getLinkStyle('/dashboard')}>
                  Dashboard
                </Link>
              )}
            </div>
            
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors duration-300"
                >
                  <div className="bg-gray-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-medium shadow-soft">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="font-medium hidden sm:block">{userName || "Account"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-medium overflow-hidden z-20">
                    <div className="py-1">
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/portfolio/create" 
                        className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Create Portfolio
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-secondary-700 hover:bg-red-50 hover:text-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-white hover:text-white/90 font-medium transition-colors px-4 py-1.5 rounded-md border border-white/30 hover:border-white/60">
                  Login
                </Link>
                <Link to="/register" className="text-primary-700 bg-white hover:bg-accent-100 font-medium transition-colors px-4 py-1.5 rounded-md shadow-soft">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-3 border-t border-gray-700">
            <div className="flex flex-col space-y-3 mt-4">
              <Link 
                to="/" 
                className={`block px-2 py-1.5 rounded-md ${location.pathname === '/' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {isDashboardPage && (
                <Link 
                  to="/portfolios" 
                  className={`block px-2 py-1.5 rounded-md ${location.pathname === '/portfolios' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse Portfolios
                </Link>
              )}
              
              {shouldShowDashboardLink && (
                <Link 
                  to="/dashboard" 
                  className={`block px-2 py-1.5 rounded-md ${location.pathname === '/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    {userName && (
                      <div className="px-2 py-1.5 text-gray-300 font-medium flex items-center">
                        <div className="bg-gray-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-medium shadow-soft mr-2">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <span>{userName}</span>
                      </div>
                    )}
                    
                    <Link 
                      to="/dashboard" 
                      className="block px-2 py-1.5 hover:bg-gray-700 rounded-md mt-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/portfolio/create" 
                      className="block px-2 py-1.5 hover:bg-gray-700 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Portfolio
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-red-200 hover:bg-gray-900 hover:text-red-100 rounded-md mt-2"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-700 pt-2 mt-2 space-y-3">
                  <Link 
                    to="/login" 
                    className="block text-center px-3 py-2 border border-gray-600 hover:border-white rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block text-center text-gray-800 font-medium bg-white hover:bg-gray-200 px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;