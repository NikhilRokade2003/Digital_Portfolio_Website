import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { portfolioAPI, authAPI, accessRequestAPI } from '../../services/api';

function Dashboard() {
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const isLoggedIn = await authAPI.isAuthenticated();
      setIsAuthenticated(isLoggedIn);
    } catch (err) {
      console.error('Error checking authentication:', err);
      setIsAuthenticated(false);
    }
  };

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

  const searchInSkills = (portfolio, term) => {
    return portfolio.skills?.some(skill => 
      skill.name?.toLowerCase().includes(term)
    ) || false;
  };
  
  const searchInEducation = (portfolio, term) => {
    return portfolio.educations?.some(education => 
      education.institution?.toLowerCase().includes(term) ||
      education.degree?.toLowerCase().includes(term) ||
      education.field?.toLowerCase().includes(term) ||
      education.description?.toLowerCase().includes(term)
    ) || false;
  };
  
  const searchInExperience = (portfolio, term) => {
    return portfolio.experiences?.some(experience => 
      experience.company?.toLowerCase().includes(term) ||
      experience.position?.toLowerCase().includes(term) ||
      experience.location?.toLowerCase().includes(term) ||
      experience.description?.toLowerCase().includes(term)
    ) || false;
  };
  
  const searchInProjects = (portfolio, term) => {
    return portfolio.projects?.some(project => 
      project.title?.toLowerCase().includes(term) ||
      project.description?.toLowerCase().includes(term)
    ) || false;
  };

  const fetchPortfolios = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await portfolioAPI.getAllVisiblePortfolios();
      setPortfolios(response.data);
      setFilteredPortfolios(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError('Failed to load portfolios. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchPortfolios();
  }, [fetchPortfolios]);

  useEffect(() => {
    // Filter portfolios based on search term and category
    if (searchTerm.trim() === '') {
      setFilteredPortfolios(portfolios);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      
      const filtered = portfolios.filter(portfolio => {
        // Basic search fields always included
        const basicMatch = 
          portfolio.title?.toLowerCase().includes(lowercasedSearch) ||
          portfolio.userFullName?.toLowerCase().includes(lowercasedSearch) ||
          portfolio.description?.toLowerCase().includes(lowercasedSearch);
          
        if (searchCategory === 'all') {
          return basicMatch || 
            searchInSkills(portfolio, lowercasedSearch) ||
            searchInEducation(portfolio, lowercasedSearch) ||
            searchInExperience(portfolio, lowercasedSearch) ||
            searchInProjects(portfolio, lowercasedSearch);
        }
        
        switch(searchCategory) {
          case 'title':
            return portfolio.title?.toLowerCase().includes(lowercasedSearch);
          case 'name':
            return portfolio.userFullName?.toLowerCase().includes(lowercasedSearch);
          case 'description':
            return portfolio.description?.toLowerCase().includes(lowercasedSearch);
          case 'skills':
            return searchInSkills(portfolio, lowercasedSearch);
          case 'education':
            return searchInEducation(portfolio, lowercasedSearch);
          case 'experience':
            return searchInExperience(portfolio, lowercasedSearch);
          case 'projects':
            return searchInProjects(portfolio, lowercasedSearch);
          default:
            return basicMatch;
        }
      });
      
      setFilteredPortfolios(filtered);
    }
  }, [searchTerm, searchCategory, portfolios]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSearchCategory(e.target.value);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  const handleRequestAccess = async (portfolioId, portfolioTitle) => {
    if (!isAuthenticated) {
      alert('Please log in to request access to portfolios.');
      return;
    }

    // Double-check authentication before sending request
    try {
      const authCheck = await authAPI.isAuthenticated();
      if (!authCheck) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }
    } catch (authError) {
      console.error('Auth check failed:', authError);
      alert('Authentication error. Please log in again.');
      window.location.href = '/login';
      return;
    }

    try {
      const message = `I would like to request access to view your portfolio: ${portfolioTitle}`;
      console.log('Sending access request for portfolio:', portfolioId);
      console.log('Message:', message);
      
      await accessRequestAPI.create(portfolioId, message);
      alert('Access request sent successfully! The portfolio owner will be notified.');
      
      // Trigger notification refresh for all users
      if (window.refreshNotifications) {
        window.refreshNotifications();
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('You must be logged in to request portfolio access. Please log in and try again.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || error.response.data || 'Bad request';
        alert(errorMsg.includes('already') ? 
          'You have already requested access to this portfolio or already have access.' :
          errorMsg);
      } else if (error.response?.status === 404) {
        alert('Portfolio not found. It may have been deleted or made private.');
      } else {
        alert(`Failed to send access request: ${error.response?.data?.message || error.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" ref={vantaRef}>
      <Navigation />
      
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        {/* Live wallpaper shapes */}
        <div className="live-wallpaper-shape live-wallpaper-1 opacity-20"></div>
        <div className="live-wallpaper-shape live-wallpaper-2 opacity-15"></div>
        <div className="live-wallpaper-shape live-wallpaper-3 opacity-20"></div>
        
        {/* Floating particles */}
        <div className="floating-particles opacity-30">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        
        {/* Aurora effect */}
        <div className="aurora opacity-25"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-8 main-content">
        {/* Header Section */}
        <div className="mb-8">
          <div className="glass-card p-6 border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">Explore Portfolios</h1>
                <p className="text-white/70 text-lg">Discover amazing work from professionals across various fields</p>
                
                {portfolios.length > 0 && (
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-white/60 text-sm">
                        {portfolios.filter(p => p.isPublic).length} Public
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      <span className="text-white/60 text-sm">
                        {portfolios.filter(p => !p.isPublic).length} Private
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {isAuthenticated && (
                  <Link 
                    to="/portfolio/create" 
                    className="btn-primary flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Portfolio</span>
                  </Link>
                )}
                
                <button 
                  onClick={fetchPortfolios}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="glass-card p-6 border border-white/10">
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder={`Search ${searchCategory === 'all' ? 'portfolios' : searchCategory}...`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <button 
                  onClick={toggleAdvancedSearch} 
                  className="text-sm text-primary-300 hover:text-primary-200 transition-colors focus:outline-none font-medium"
                >
                  {showAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}
                </button>
              </div>
              
              {showAdvancedSearch && (
                <div className="glass-card p-4 border border-white/20">
                  <div className="text-left mb-2">
                    <label className="text-white/80 text-sm font-medium mb-2 block">Search in:</label>
                    <select
                      value={searchCategory}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      style={{ 
                        backgroundColor: '#1e293b',
                        color: 'white'
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#1e293b', color: 'white' }}>All fields</option>
                      <option value="title" style={{ backgroundColor: '#1e293b', color: 'white' }}>Portfolio Title</option>
                      <option value="name" style={{ backgroundColor: '#1e293b', color: 'white' }}>Author Name</option>
                      <option value="description" style={{ backgroundColor: '#1e293b', color: 'white' }}>Description</option>
                      <option value="skills" style={{ backgroundColor: '#1e293b', color: 'white' }}>Skills</option>
                      <option value="education" style={{ backgroundColor: '#1e293b', color: 'white' }}>Education</option>
                      <option value="experience" style={{ backgroundColor: '#1e293b', color: 'white' }}>Experience</option>
                      <option value="projects" style={{ backgroundColor: '#1e293b', color: 'white' }}>Projects</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 animate-slide-in-bottom">
            <div className="glass-card border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-300 font-medium">{error}</p>
                  <button 
                    onClick={fetchPortfolios} 
                    className="text-red-400 hover:text-red-300 underline text-sm mt-1 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 animate-pulse">
              <div className="spinner"></div>
            </div>
            <p className="text-white/70 text-lg">Loading portfolios...</p>
          </div>
        ) : filteredPortfolios.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="glass-card p-12 border border-white/10 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No portfolios match your search' : 'No portfolios available'}
              </h3>
              <p className="text-white/60 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create and share a portfolio!'}
              </p>
              {isAuthenticated && (
                <Link 
                  to="/portfolio/create" 
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Portfolio</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          // Portfolio Grid
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/70">
                Showing {filteredPortfolios.length} of {portfolios.length} portfolios
                {searchTerm && <span className="text-primary-300"> for "{searchTerm}"</span>}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPortfolios.map(portfolio => (
                <div key={portfolio.id} className="group card-hover animate-scale-in" style={{animationDelay: `${Math.random() * 0.3}s`}}>
                  <div className="glass-card border border-white/10 relative overflow-hidden h-full">
                    {/* Gradient Border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-pink-500/20 p-px rounded-2xl">
                      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl h-full"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                            {portfolio.title}
                          </h3>
                          <p className="text-primary-300 text-sm font-medium mb-2">
                            by {portfolio.userFullName}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              portfolio.isPublic 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-1.5 ${
                                portfolio.isPublic ? 'bg-green-400' : 'bg-orange-400'
                              }`}></div>
                              {portfolio.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Portfolio Description */}
                      <div className="flex-1 mb-4">
                        <p className="text-white/70 text-sm line-clamp-3">
                          {portfolio.description || 'No description provided'}
                        </p>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center flex-wrap gap-4 mb-4 text-white/60 text-xs">
                        {portfolio.projects && portfolio.projects.length > 0 && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {portfolio.projects.length} Projects
                          </div>
                        )}
                        {portfolio.skills && portfolio.skills.length > 0 && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            {portfolio.skills.length} Skills
                          </div>
                        )}
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Updated {formatDate(portfolio.updatedAt)}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {portfolio.isPublic ? (
                          <Link 
                            to={`/portfolio/view/${portfolio.id}`}
                            className="flex-1 bg-primary-500/80 hover:bg-primary-500 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Portfolio
                          </Link>
                        ) : (
                          <button 
                            onClick={() => handleRequestAccess(portfolio.id, portfolio.title)}
                            className="flex-1 bg-orange-500/80 hover:bg-orange-500 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Request Access
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;