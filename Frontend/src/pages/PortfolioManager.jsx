import React, { useState, useEffect, useRef } from 'react';
import { portfolioAPI, accessRequestAPI, imageUploadAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const PortfolioManager = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-portfolios');
  const [uploadingId, setUploadingId] = useState(null);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const navigate = useNavigate();

  // Function to calculate total experience in months
  const calculateTotalExperience = (experiences) => {
    if (!experiences || experiences.length === 0) return '0 months';
    
    let totalMonths = 0;
    
    experiences.forEach(exp => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
      
      const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
      const monthsDiff = endDate.getMonth() - startDate.getMonth();
      
      totalMonths += (yearsDiff * 12) + monthsDiff;
    });
    
    if (totalMonths === 0) return '0 months';
    
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (years > 0 && months > 0) {
      return `${years}y ${months}m`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
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

  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        setLoading(true);
        let response;
        
        switch (activeTab) {
          case 'my-portfolios':
            response = await portfolioAPI.getMyPortfolios();
            break;
          case 'public':
            response = await portfolioAPI.getPublicPortfolios();
            break;
          case 'all-visible':
            response = await portfolioAPI.getAllVisiblePortfolios();
            break;
          default:
            response = await portfolioAPI.getMyPortfolios();
        }
        
        setPortfolios(response.data || []);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolios();
  }, [activeTab]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (activeTab) {
        case 'my-portfolios':
          response = await portfolioAPI.getMyPortfolios();
          break;
        case 'public':
          response = await portfolioAPI.getPublicPortfolios();
          break;
        case 'all-visible':
          response = await portfolioAPI.getAllVisiblePortfolios();
          break;
        default:
          response = await portfolioAPI.getMyPortfolios();
      }
      
      setPortfolios(response.data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (portfolioId) => {
    try {
      const message = prompt('Enter a message for the portfolio owner (optional):');
      if (message !== null) { // User didn't cancel
        await accessRequestAPI.create(portfolioId, message);
        alert('Access request sent successfully!');
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Failed to send access request. Please try again.');
    }
  };

  const handleDownloadPDF = async (portfolioId, title) => {
    try {
      const response = await portfolioAPI.downloadPDF(portfolioId);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}_portfolio.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleImageUpload = async (portfolioId, file, type = 'profile') => {
    try {
      setUploadingId(portfolioId);
      const formData = new FormData();
      formData.append('image', file);
      
      let response;
      if (type === 'profile') {
        response = await imageUploadAPI.uploadProfile(formData);
      } else {
        response = await imageUploadAPI.uploadProject(formData);
      }
      
      // Update the portfolio with the new image URL
      await portfolioAPI.updatePortfolio(portfolioId, {
        profilePicture: response.data.imageUrl
      });
      
      fetchPortfolios(); // Refresh the list
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeletePortfolio = async (portfolioId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await portfolioAPI.deletePortfolio(portfolioId);
        fetchPortfolios();
        alert('Portfolio deleted successfully!');
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('Failed to delete portfolio. Please try again.');
      }
    }
  };

  const tabs = [
    { id: 'my-portfolios', label: 'My Portfolios', icon: '👤' },
    { id: 'public', label: 'Public Portfolios', icon: '🌐' },
    { id: 'all-visible', label: 'All Visible', icon: '👁️' }
  ];

  if (loading) {
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
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  const PortfolioCard = ({ portfolio, isOwner }) => (
    <div className="holographic-card p-6">
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-glow">
            {portfolio.profilePicture ? (
              <img 
                src={portfolio.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              portfolio.title?.charAt(0) || 'P'
            )}
          </div>
          
          {isOwner && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(portfolio.id, e.target.files[0])}
                className="hidden"
                id={`upload-${portfolio.id}`}
              />
              <label
                htmlFor={`upload-${portfolio.id}`}
                className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer hover:bg-primary-600 transition-colors floating-cube"
              >
                {uploadingId === portfolio.id ? (
                  <div className="rotating-cube">
                    <div className="rotating-cube-face cube-face-front"></div>
                    <div className="rotating-cube-face cube-face-back"></div>
                    <div className="rotating-cube-face cube-face-right"></div>
                    <div className="rotating-cube-face cube-face-left"></div>
                    <div className="rotating-cube-face cube-face-top"></div>
                    <div className="rotating-cube-face cube-face-bottom"></div>
                  </div>
                ) : '📷'}
              </label>
            </>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 animated-underline">{portfolio.title}</h3>
          <p className="text-white/70 text-sm mb-2 line-clamp-2">
            {portfolio.description || 'No description available'}
          </p>
          
          <div className="flex items-center space-x-4 text-white/60 text-xs">
            <span className={`px-2 py-1 rounded-full ${
              portfolio.isPublic ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
            }`}>
              {portfolio.isPublic ? '🌐 Public' : '🔒 Private'}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-white/5 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{portfolio.projects?.length || 0}</div>
          <div className="text-white/60 text-xs">Projects</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {calculateTotalExperience(portfolio.experience || [])}
          </div>
          <div className="text-white/60 text-xs">Experience</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/portfolio/view/${portfolio.id}`)}
          className="flex-1 holographic-btn text-sm"
        >
          👁️ View
        </button>
        
        {isOwner ? (
          <>
            <button
              onClick={() => navigate(`/portfolio/edit/${portfolio.id}`)}
              className="flex-1 holographic-btn text-sm"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDownloadPDF(portfolio.id, portfolio.title)}
              className="flex-1 holographic-btn text-sm"
            >
              📄 PDF
            </button>
            <button
              onClick={() => handleDeletePortfolio(portfolio.id, portfolio.title)}
              className="holographic-btn text-sm bg-red-500/20 border-red-500/30"
            >
              🗑️
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleRequestAccess(portfolio.id)}
              className="flex-1 holographic-btn text-sm bg-yellow-500/20 border-yellow-500/30"
            >
              🔑 Request Access
            </button>
            <button
              onClick={() => handleDownloadPDF(portfolio.id, portfolio.title)}
              className="flex-1 holographic-btn text-sm"
            >
              📄 PDF
            </button>
          </>
        )}
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
          {[...Array(10)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="aurora opacity-25"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 main-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 animated-underline-always">Portfolio Manager</h1>
            <p className="text-white/70">Create, manage, and discover amazing portfolios</p>
          </div>
          
          <button
            onClick={() => navigate('/portfolio/create')}
            className="holographic-btn hover-lift"
          >
            <div className="flex items-center">
              <div className="rotating-cube mr-3">
                <div className="rotating-cube-face cube-face-front"></div>
                <div className="rotating-cube-face cube-face-back"></div>
                <div className="rotating-cube-face cube-face-right"></div>
                <div className="rotating-cube-face cube-face-left"></div>
                <div className="rotating-cube-face cube-face-top"></div>
                <div className="rotating-cube-face cube-face-bottom"></div>
              </div>
              <span>Create Portfolio</span>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 animated-underline ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        {portfolios.length === 0 ? (
          <div className="holographic-card p-12 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-2xl font-bold text-white mb-2 animated-underline-always">No Portfolios Found</h3>
            <p className="text-white/60 mb-6">
              {activeTab === 'my-portfolios' 
                ? "You haven't created any portfolios yet. Start building your digital presence!"
                : "No portfolios available in this category."
              }
            </p>
            {activeTab === 'my-portfolios' && (
              <button
                onClick={() => navigate('/portfolio/create')}
                className="holographic-btn"
              >
                Create Your First Portfolio
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                isOwner={activeTab === 'my-portfolios'}
              />
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="holographic-card p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">{portfolios.length}</div>
            <div className="text-white/60">Total Portfolios</div>
          </div>
          
          <div className="holographic-card p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {portfolios.filter(p => p.isPublic).length}
            </div>
            <div className="text-white/60">Public</div>
          </div>
          
          <div className="holographic-card p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {portfolios.filter(p => !p.isPublic).length}
            </div>
            <div className="text-white/60">Private</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioManager;