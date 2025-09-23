import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioAPI } from '../../services/api';

const PortfolioCreateModern = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profileImage: '',
    isPublic: false,
    isProjectsPublic: true,
    isEducationPublic: true,
    isExperiencePublic: true,
    isSkillsPublic: true,
    isSocialMediaPublic: true,
    email: '',
    phone: '',
    city: '',
    country: ''
  });

  // Profile image handling
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setProfileImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const uploadProfileImage = useCallback(async () => {
    if (!profileImageFile) return null;
    
    try {
      const imageFormData = new FormData();
      imageFormData.append('file', profileImageFile);
      
      const response = await fetch('http://localhost:5163/api/ImageUpload/profile', {
        method: 'POST',
        body: imageFormData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
      
      const result = await response.text();
      return result;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }, [profileImageFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    
    try {
      // Upload profile image if selected
      let profileImageUrl = '';
      if (profileImageFile) {
        profileImageUrl = await uploadProfileImage();
      }

      // Create portfolio
      const portfolioData = {
        ...formData,
        profileImage: profileImageUrl
      };

      await portfolioAPI.create(portfolioData);
      
      setSuccessMessage('Portfolio created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error creating portfolio:', error);
      setError(error.message || 'Failed to create portfolio. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'Portfolio Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'privacy', label: 'Privacy Settings', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'contact', label: 'Contact Info', icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="glass-card p-8 border border-white/10 mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            Create New Portfolio
            <span className="px-3 py-1 text-xs font-semibold text-white bg-primary-500/80 rounded-full shadow-glow">New</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">Build your digital presence with our modern portfolio builder. Showcase your skills, projects, and experience in a professional way.</p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-8">
          <div className="glass-card border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-8">
          <div className="glass-card border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-300 font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Tab Navigation */}
      <div className="mb-8">
        <div className="glass-card p-2 border border-white/10">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl flex items-center justify-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-primary-500 text-white shadow-glow' 
                    : 'text-white/70'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Portfolio Details Tab */}
        {activeTab === 'details' && (
          <div className="glass-card p-8 border border-white/10">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Portfolio Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Portfolio Title */}
              <div className="md:col-span-2">
                <label className="form-label">Portfolio Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your portfolio title..."
                  required
                />
              </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input-field resize-none"
                      rows="4"
                      placeholder="Describe your portfolio..."
                    />
                  </div>

                  {/* Profile Image */}
                  <div className="md:col-span-2">
                    <label className="form-label">Profile Image</label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500/20 file:text-primary-300 cursor-pointer"
                        />
                        <p className="text-white/50 text-sm mt-1">Max file size: 5MB. Formats: JPEG, PNG, GIF</p>
                      </div>
                      {previewImage && (
                        <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Public Toggle */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div>
                        <label className="text-white font-medium">Make Portfolio Public</label>
                        <p className="text-white/60 text-sm">Allow others to discover and view your portfolio</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPublic"
                          checked={formData.isPublic}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings Tab */}
            {activeTab === 'privacy' && (
              <div className="glass-card p-8 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  Section Visibility Settings
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'isProjectsPublic', label: 'Projects Section', desc: 'Show your projects to visitors' },
                    { key: 'isEducationPublic', label: 'Education Section', desc: 'Display your educational background' },
                    { key: 'isExperiencePublic', label: 'Experience Section', desc: 'Show your work experience' },
                    { key: 'isSkillsPublic', label: 'Skills Section', desc: 'Display your technical skills' },
                    { key: 'isSocialMediaPublic', label: 'Social Media Links', desc: 'Show your social media profiles' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div>
                        <label className="text-white font-medium">{setting.label}</label>
                        <p className="text-white/60 text-sm">{setting.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={setting.key}
                          checked={formData[setting.key]}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'contact' && (
              <div className="glass-card p-8 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Contact Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your city"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your country"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
                disabled={isCreating}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={isCreating || !formData.title.trim()}
              >
                {isCreating ? (
                  <>
                    <div className="spinner w-4 h-4"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Portfolio
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCreateModern;