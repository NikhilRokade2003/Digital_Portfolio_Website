import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authAPI } from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [portfolioStats] = useState({
    totalPortfolios: 3,
    totalViews: 1250,
    totalProjects: 12,
    joinedDate: '2024-01-01'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const isAuth = await authAPI.checkSession();
        if (!isAuth) {
          navigate('/login');
          return;
        }

        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          bio: userData.bio || '',
          phone: userData.phone || '',
          location: userData.location || '',
          website: userData.website || '',
          linkedin: userData.linkedin || '',
          github: userData.github || '',
          twitter: userData.twitter || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate password change if provided
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError('Current password is required to change password');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters');
          return;
        }
      }

      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter
      };

      // Add password fields if provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const updatedUser = await authAPI.updateProfile(updateData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 px-4">
          <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-center h-96">
              <div className="rotating-cube">
                <div className="rotating-cube-face cube-face-front"></div>
                <div className="rotating-cube-face cube-face-back"></div>
                <div className="rotating-cube-face cube-face-right"></div>
                <div className="rotating-cube-face cube-face-left"></div>
                <div className="rotating-cube-face cube-face-top"></div>
                <div className="rotating-cube-face cube-face-bottom"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 px-4">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4 animated-underline-always">
              My Profile
            </h1>
            <p className="text-white/70 text-lg">
              Manage your account information and portfolio settings
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="holographic-card bg-red-500/20 border-red-500/50 p-4 text-red-200 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="holographic-card bg-green-500/20 border-green-500/50 p-4 text-green-200 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="holographic-card p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              {['profile', 'social', 'stats'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[120px] py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'profile' && '👤 Profile'}
                  {tab === 'social' && '🔗 Social Links'}
                  {tab === 'stats' && '📊 Statistics'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Avatar Section */}
            <div className="lg:col-span-1">
              <div className="holographic-card p-6 sticky top-24">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl holographic-card">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 animated-underline">
                    {user?.fullName || 'User'}
                  </h3>
                  <p className="text-purple-300 mb-4">{user?.email}</p>
                  
                  {user?.role && (
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Member Since</span>
                        <span className="text-white">
                          {new Date(portfolioStats.joinedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Status</span>
                        <span className="text-green-400 flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="holographic-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white animated-underline">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                        isEditing
                          ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30'
                      }`}
                    >
                      {isEditing ? '✕ Cancel Edit' : '✏️ Edit Profile'}
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field h-32 resize-none"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="holographic-btn flex-1"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="glass-button flex-1"
                        >
                          ↶ Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Social Links Tab */}
              {activeTab === 'social' && (
                <div className="holographic-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white animated-underline">
                      Social Links
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="holographic-btn"
                    >
                      {isEditing ? '💾 Save Links' : '✏️ Edit Links'}
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span>LinkedIn Profile</span>
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 text-sm font-medium mb-2 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>GitHub Profile</span>
                      </label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <span>Twitter Profile</span>
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="https://twitter.com/username"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="holographic-btn flex-1"
                        >
                          💾 Save Social Links
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="glass-button flex-1"
                        >
                          ↶ Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="holographic-card p-6 text-center">
                      <div className="text-4xl mb-3">📁</div>
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {portfolioStats.totalPortfolios}
                      </div>
                      <div className="text-white/60 text-sm">Total Portfolios</div>
                    </div>
                    
                    <div className="holographic-card p-6 text-center">
                      <div className="text-4xl mb-3">👁️</div>
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {portfolioStats.totalViews.toLocaleString()}
                      </div>
                      <div className="text-white/60 text-sm">Profile Views</div>
                    </div>
                    
                    <div className="holographic-card p-6 text-center">
                      <div className="text-4xl mb-3">🚀</div>
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {portfolioStats.totalProjects}
                      </div>
                      <div className="text-white/60 text-sm">Projects</div>
                    </div>
                    
                    <div className="holographic-card p-6 text-center">
                      <div className="text-4xl mb-3">⭐</div>
                      <div className="text-3xl font-bold text-yellow-400 mb-2">
                        95%
                      </div>
                      <div className="text-white/60 text-sm">Completion</div>
                    </div>
                  </div>

                  {/* Activity Chart Placeholder */}
                  <div className="holographic-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 animated-underline">
                      📈 Activity Overview
                    </h3>
                    <div className="h-64 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-white/10">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-white/60 text-lg">Activity chart will be displayed here</p>
                        <p className="text-white/40 text-sm">Integration with analytics coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="holographic-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 animated-underline">
                      🕒 Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {[
                        { action: 'Updated portfolio "Web Developer"', time: '2 hours ago', icon: '✏️', color: 'text-blue-400' },
                        { action: 'Created new project "E-commerce App"', time: '1 day ago', icon: '🆕', color: 'text-green-400' },
                        { action: 'Profile viewed by recruiter', time: '2 days ago', icon: '👁️', color: 'text-purple-400' },
                        { action: 'Exported portfolio as PDF', time: '3 days ago', icon: '📄', color: 'text-yellow-400' },
                        { action: 'Updated social media links', time: '5 days ago', icon: '🔗', color: 'text-cyan-400' },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300">
                          <div className={`text-2xl ${activity.color}`}>{activity.icon}</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.action}</p>
                            <p className="text-white/60 text-sm">{activity.time}</p>
                          </div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full opacity-50"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;