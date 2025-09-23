import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { portfolioAPI, authAPI } from '../../services/api';

function Dashboard() {
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOption, setSortOption] = useState('updatedAt');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const isAuthenticated = await authAPI.isAuthenticated();
        if (!isAuthenticated) {
          console.log('Not authenticated, redirecting to login from Dashboard');
          navigate('/login');
          return;
        }
        fetchPortfolios();
      } catch (err) {
        console.error('Error checking authentication:', err);
        navigate('/login');
      }
    };
    checkAuthAndFetchData();
  }, [navigate]);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const response = await portfolioAPI.getMyPortfolios();
      setPortfolios(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError('Failed to load portfolios. Please try again.');
      
      if (err.response?.status === 401) {
        console.log('Unauthorized response when fetching portfolios');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    try {
      await portfolioAPI.delete(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      setError('Failed to delete portfolio. Please try again.');
    }
  };

  // Filter and sort portfolios
  const filteredPortfolios = portfolios.filter(p => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'public') return p.isPublic;
    if (filterStatus === 'private') return !p.isPublic;
    return true;
  });

  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    switch (sortOption) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'updatedAt':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen relative">
      <Navigation />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float-up"></div>
        <div className="absolute top-1/3 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float-up" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float-up" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="glass-card p-6 border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">My Portfolios</h1>
                <p className="text-white/70 text-lg">Manage and showcase your digital presence</p>
                
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
                <Link 
                  to="/portfolio/create" 
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Portfolio</span>
                </Link>
                
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

        {/* Filters and Sorting */}
        <div className="mb-8">
          <div className="glass-card p-4 border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-white/70 font-medium text-sm">Filter:</span>
                <div className="flex bg-white/5 rounded-xl p-1">
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      filterStatus === 'all' 
                        ? 'bg-primary-500 text-white shadow-glow' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterStatus('public')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      filterStatus === 'public' 
                        ? 'bg-primary-500 text-white shadow-glow' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Public
                  </button>
                  <button 
                    onClick={() => setFilterStatus('private')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      filterStatus === 'private' 
                        ? 'bg-primary-500 text-white shadow-glow' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-white/70 font-medium text-sm">Sort by:</span>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="input-field py-2 px-3 text-sm min-w-0"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Date Created</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 animate-pulse">
              <div className="spinner"></div>
            </div>
            <p className="text-white/70 text-lg">Loading your portfolios...</p>
          </div>
        ) : sortedPortfolios.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="glass-card p-12 border border-white/10 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No portfolios yet</h3>
              <p className="text-white/60 mb-6">Create your first portfolio to get started showcasing your work</p>
              <Link 
                to="/portfolio/create" 
                className="btn-primary inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Portfolio</span>
              </Link>
            </div>
          </div>
        ) : (
          // Portfolio Grid
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedPortfolios.map(portfolio => (
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
                      
                      {/* Actions Menu */}
                      <div className="relative">
                        <button 
                          onClick={() => setDeleteConfirmId(deleteConfirmId === portfolio.id ? null : portfolio.id)}
                          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                        
                        {/* Delete Confirmation */}
                        {deleteConfirmId === portfolio.id && (
                          <div className="absolute right-0 top-12 w-64 glass-card border border-white/10 p-4 animate-scale-in z-20">
                            <p className="text-white text-sm font-medium mb-3">
                              Delete this portfolio?
                            </p>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleDeletePortfolio(portfolio.id)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Portfolio Description */}
                    <div className="flex-1 mb-4">
                      <p className="text-white/70 text-sm line-clamp-3">
                        {portfolio.description || 'No description provided'}
                      </p>
                    </div>
                    
                    {/* Metadata */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-white/60 text-xs">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Updated {formatDate(portfolio.updatedAt)}
                      </div>
                      {portfolio.createdAt !== portfolio.updatedAt && (
                        <div className="flex items-center text-white/60 text-xs">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Created {formatDate(portfolio.createdAt)}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link 
                        to={`/portfolio/view/${portfolio.id}`}
                        className="flex-1 bg-primary-500/80 hover:bg-primary-500 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      <Link 
                        to={`/portfolio/edit/${portfolio.id}`}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;