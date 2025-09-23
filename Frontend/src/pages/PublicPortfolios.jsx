import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { portfolioAPI, authAPI, accessRequestAPI } from '../../services/api';

const PublicPortfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchPortfolios();
  }, []);

  const checkAuth = async () => {
    try {
      const isLoggedIn = await authAPI.isAuthenticated();
      setIsAuthenticated(isLoggedIn);
    } catch (err) {
      console.error('Error checking authentication:', err);
      setIsAuthenticated(false);
    }
  };

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

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const response = await portfolioAPI.getAllVisiblePortfolios();
      setPortfolios(response.data);
      setFilteredPortfolios(response.data);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError('Failed to load portfolios. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      const message = `I would like to request access to view your portfolio: ${portfolioTitle}`;
      await accessRequestAPI.create(portfolioId, message);
      alert('Access request sent successfully! The portfolio owner will be notified.');
      
      // Trigger notification refresh for all users
      if (window.refreshNotifications) {
        window.refreshNotifications();
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      if (error.response?.status === 400) {
        alert(error.response.data || 'You may have already requested access to this portfolio.');
      } else {
        alert('Failed to send access request. Please try again.');
      }
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 via-white via-purple-100 via-neutral-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-secondary-900 bg-clip-text text-transparent bg-gradient-to-r from-primary-700 via-accent-600 to-secondary-700 inline-block">
            Explore Portfolios
          </h1>
          <p className="text-lg text-secondary-700 max-w-2xl mx-auto mb-8">
            Discover amazing work from professionals across various fields
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-2">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${searchCategory === 'all' ? 'portfolios' : searchCategory}...`}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full py-3 px-5 pr-12 rounded-md border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-soft transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            
            <div className="text-right mt-2">
              <button 
                onClick={toggleAdvancedSearch} 
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors focus:outline-none font-medium"
              >
                {showAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}
              </button>
            </div>
            
            {showAdvancedSearch && (
              <div className="bg-white rounded-md p-4 mt-2 shadow-soft border border-secondary-100">
                <div className="text-left mb-2">
                  <label htmlFor="searchCategory" className="block text-sm font-medium text-secondary-700 mb-1">
                    Search in:
                  </label>
                  <select
                    id="searchCategory"
                    value={searchCategory}
                    onChange={handleCategoryChange}
                    className="w-full rounded-md border border-secondary-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-soft transition-all text-secondary-800"
                  >
                    <option value="all">All Fields</option>
                    <option value="title">Portfolio Title</option>
                    <option value="name">User Name</option>
                    <option value="description">Description</option>
                    <option value="skills">Skills</option>
                    <option value="education">Education</option>
                    <option value="experience">Work Experience</option>
                    <option value="projects">Projects</option>
                  </select>
                </div>
                
                <div className="text-xs text-secondary-500 mt-3 bg-secondary-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Search tips:</p>
                  <ul className="list-disc pl-5">
                    <li>Use the dropdown to narrow your search to specific parts of portfolios</li>
                    <li>Search for skills like "React", "Python", or "UX Design"</li>
                    <li>Find people with experience at specific companies</li>
                    <li>Look for graduates from particular institutions</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Subtle decorative element */}
          <div className="flex justify-center mt-4 mb-6">
            <div className="w-16 h-1 bg-primary-500 rounded-full opacity-75"></div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r shadow-soft">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-secondary-700 font-medium">Loading amazing portfolios...</p>
          </div>
        ) : filteredPortfolios.length === 0 ? (
          <div className="bg-white rounded-lg shadow-medium p-8 text-center max-w-2xl mx-auto">
            {searchTerm ? (
              <>
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-lg text-secondary-700 mb-2">No portfolios match your search criteria.</p>
                <p className="text-secondary-600">Try different keywords or clear your search.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSearchCategory('all');
                  }}
                  className="mt-4 bg-primary-50 border border-primary-100 text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors font-medium"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-lg text-secondary-700 mb-2">No portfolios available yet.</p>
                <p className="text-secondary-600">Be the first to share your work with the world!</p>
              </>
            )}
          </div>
        ) : (
          <>
            {searchTerm && (
              <div className="mb-6 text-center">
                <p className="text-secondary-700">
                  Found <span className="font-bold text-primary-600">{filteredPortfolios.length}</span> 
                  {filteredPortfolios.length === 1 ? ' portfolio ' : ' portfolios '} 
                  matching your search
                  {searchCategory !== 'all' ? ` in ${searchCategory}` : ''}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolios.map(portfolio => (
                <div key={portfolio.id} className={`bg-white rounded-lg shadow-medium overflow-hidden transition-all hover:shadow-hard border ${portfolio.isPublic ? 'border-secondary-100' : 'border-red-100'}`}>
                  <div className={`border-t-4 ${portfolio.isPublic ? 'border-primary-500' : 'border-red-400'} p-6`}>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-secondary-900">{portfolio.title}</h2>
                      
                      {/* Show public/private badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        portfolio.isPublic 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {portfolio.isPublic ? (
                          <>
                            <svg className="mr-1 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                            </svg>
                            Public
                          </>
                        ) : (
                          <>
                            <svg className="mr-1 h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M4 8V6a2 2 0 114 0v2h1a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1V9a1 1 0 011-1h1zm2-3a1 1 0 00-1 1v2h2V6a1 1 0 00-1-1z" />
                            </svg>
                            Private
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-secondary-200 bg-secondary-100 flex items-center justify-center">
                        {portfolio.profileImage ? (
                          <img 
                            src={portfolio.profileImage} 
                            alt={portfolio.userFullName || "User"} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-secondary-500">
                            {portfolio.userFullName ? portfolio.userFullName.charAt(0) : "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-secondary-800 font-medium">{portfolio.userFullName || "Anonymous User"}</p>
                        <p className="text-secondary-500 text-xs">Portfolio Creator</p>
                      </div>
                    </div>
                    
                    <p className="text-secondary-600 mb-4 line-clamp-2 text-sm">{portfolio.description || 'No description provided.'}</p>
                    
                    {/* Show top skills if any exist */}
                    {portfolio.skills && portfolio.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-secondary-500 mb-2">Top skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {portfolio.skills.slice(0, 3).map(skill => (
                            <span 
                              key={skill.id} 
                              className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-md border border-primary-100"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {portfolio.skills.length > 3 && (
                            <span className="text-xs text-primary-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                              {portfolio.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-secondary-500 text-xs mb-5 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m-6 0v10a2 2 0 002 2h2a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" />
                      </svg>
                      Updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                    </p>
                    
                    {portfolio.isPublic ? (
                      <Link 
                        to={`/portfolio/view/${portfolio.id}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-md font-medium transition-colors duration-300 shadow-soft inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Portfolio
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleRequestAccess(portfolio.id, portfolio.title)}
                        className="bg-secondary-600 hover:bg-secondary-700 text-white py-2 px-6 rounded-md font-medium transition-colors duration-300 shadow-soft inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Request Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicPortfolios;