import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { portfolioAPI, authAPI } from '../../services/api';

const Dashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOption, setSortOption] = useState('updatedAt');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status using the session endpoint
    const checkAuthAndFetchData = async () => {
      try {
        const isAuthenticated = await authAPI.isAuthenticated();
        if (!isAuthenticated) {
          console.log('Not authenticated, redirecting to login from Dashboard');
          navigate('/login');
          return;
        }
        
        // Get user data for personalization
        try {
          const userResponse = await authAPI.getCurrentUser();
          setUserData(userResponse.data);
        } catch (userErr) {
          console.error('Error fetching user data:', userErr);
        }
        
        // User is authenticated, fetch portfolios
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
      console.log('Fetching portfolios for dashboard...');
      const response = await portfolioAPI.getMyPortfolios();
      console.log('Portfolios fetched successfully:', response.data.length);
      setPortfolios(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError('Failed to load portfolios. Please try again.');
      
      // If unauthorized, redirect to login
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
      await portfolioAPI.deletePortfolio(id);
      setDeleteConfirmId(null);
      // Refresh portfolios list
      fetchPortfolios();
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      setError('Failed to delete portfolio. Please try again.');
    }
  };
  
  // Filter portfolios based on status (all, public, private)
  const filteredPortfolios = portfolios.filter(portfolio => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'public') return portfolio.isPublic;
    if (filterStatus === 'private') return !portfolio.isPublic;
    return true;
  });
  
  // Sort portfolios based on selection
  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    if (sortOption === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortOption === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      // Default: updatedAt
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-xl shadow-medium p-6 mb-8 border border-secondary-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mr-3">
                  My Dashboard
                </h1>
                {userData && (
                  <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
                    {portfolios.length} {portfolios.length === 1 ? 'Portfolio' : 'Portfolios'}
                  </span>
                )}
              </div>
              {userData && (
                <p className="text-secondary-600 mt-1">
                  Welcome back, {userData.fullName || 'User'}!
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link 
                to="/portfolio/create" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-300 shadow-soft flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Portfolio
              </Link>
              
              <button 
                onClick={fetchPortfolios}
                className="bg-white hover:bg-secondary-50 text-secondary-700 border border-secondary-200 px-4 py-2.5 rounded-lg font-medium transition-colors duration-300 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg shadow-soft flex items-center">
            <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={fetchPortfolios} 
                className="text-red-700 underline text-sm mt-1 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        
        {/* Portfolio filters and sorting */}
        <div className="bg-white rounded-xl shadow-medium p-5 mb-6 border border-secondary-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-secondary-700 font-medium text-sm">View:</span>
              <div className="flex bg-secondary-100 rounded-lg p-1">
                <button 
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filterStatus === 'all' ? 'bg-white text-primary-700 shadow-soft' : 'text-secondary-600 hover:text-secondary-900'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterStatus('public')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filterStatus === 'public' ? 'bg-white text-primary-700 shadow-soft' : 'text-secondary-600 hover:text-secondary-900'}`}
                >
                  Public
                </button>
                <button 
                  onClick={() => setFilterStatus('private')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filterStatus === 'private' ? 'bg-white text-primary-700 shadow-soft' : 'text-secondary-600 hover:text-secondary-900'}`}
                >
                  Private
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-secondary-700 font-medium text-sm whitespace-nowrap">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="form-select rounded-lg border-secondary-200 focus:border-primary-500 focus:ring-primary-500 text-secondary-800 py-2 pl-3 pr-8 text-sm font-medium flex-grow"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="title">Portfolio Name</option>
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-secondary-700 font-medium">Loading your portfolios...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="bg-white rounded-xl shadow-medium p-8 text-center border border-secondary-100">
            <div className="mb-4 bg-primary-50 inline-flex p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">No portfolios yet</h2>
            <p className="mb-6 text-secondary-600 max-w-md mx-auto">Create your first portfolio to showcase your skills, experience, and projects to potential clients and employers.</p>
            
            <Link 
              to="/portfolio/create" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-soft inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Your First Portfolio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedPortfolios.map(portfolio => (
              <div key={portfolio.id} className="bg-white rounded-xl shadow-medium overflow-hidden transition-all hover:shadow-hard border border-secondary-100 flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-secondary-900 line-clamp-1">{portfolio.title}</h2>
                      <div className="flex items-center mt-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${portfolio.isPublic ? 'bg-success-100 text-success-800' : 'bg-secondary-100 text-secondary-800'}`}>
                          {portfolio.isPublic ? (
                            <>
                              <svg className="mr-1 h-3 w-3 text-success-600" fill="currentColor" viewBox="0 0 12 12">
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                              </svg>
                              Public
                            </>
                          ) : (
                            <>
                              <svg className="mr-1 h-2.5 w-2.5 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              Private
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setDeleteConfirmId(deleteConfirmId === portfolio.id ? null : portfolio.id)}
                        className="p-2 text-secondary-400 hover:text-secondary-700 hover:bg-secondary-50 rounded-md transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                      
                      {/* Delete Confirmation Dropdown */}
                      {deleteConfirmId === portfolio.id && (
                        <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-hard z-10 border border-secondary-200 overflow-hidden">
                          <div className="p-4">
                            <p className="text-sm text-secondary-800 font-medium mb-3">
                              Are you sure you want to delete this portfolio?
                            </p>
                            <div className="flex space-x-2">
                              <button 
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg font-medium transition-colors"
                                onClick={() => handleDeletePortfolio(portfolio.id)}
                              >
                                Delete
                              </button>
                              <button 
                                className="flex-1 bg-white border border-secondary-200 text-secondary-800 text-sm py-2 px-3 rounded-lg font-medium transition-colors hover:bg-secondary-50"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-secondary-600 mb-4 line-clamp-2 text-sm min-h-[40px]">
                    {portfolio.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    {portfolio.skills && portfolio.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {portfolio.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700">
                            {skill.name}
                          </span>
                        ))}
                        {portfolio.skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary-50 text-secondary-700">
                            +{portfolio.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-secondary-500">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m-6 0v10a2 2 0 002 2h2a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" />
                        </svg>
                        Updated: {formatDate(portfolio.updatedAt)}
                      </div>
                      
                      {portfolio.projects && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          {portfolio.projects.length} {portfolio.projects.length === 1 ? 'project' : 'projects'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 border-t border-secondary-100">
                  <Link 
                    to={`/portfolio/view/${portfolio.id}`}
                    className="flex items-center justify-center py-3 text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Portfolio
                  </Link>
                  <Link 
                    to={`/portfolio/edit/${portfolio.id}`}
                    className="flex items-center justify-center py-3 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50 transition-colors text-sm font-medium border-l border-secondary-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Portfolio
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;