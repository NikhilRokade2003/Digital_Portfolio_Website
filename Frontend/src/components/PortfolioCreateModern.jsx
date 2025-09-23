import React, { useState, useEffect } from 'react';
import { portfolioAPI, authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PortfolioCreateModern = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profileImage: '',
    isPublic: true,
    isProjectsPublic: true,
    isEducationPublic: true,
    isExperiencePublic: true,
    isSkillsPublic: true,
    isSocialMediaPublic: true,
    email: '',
    phone: '',
    city: '',
    country: '',
    socialMediaLinks: []
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuth = await authAPI.checkSession();
        if (!isAuth) {
          navigate('/login?redirect=/portfolio/create');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login?redirect=/portfolio/create');
        return;
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await portfolioAPI.createPortfolio(formData);
      console.log('Portfolio created successfully:', response.data);
      // Navigate to the newly created portfolio or dashboard
      navigate(`/dashboard`);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      if (error.response?.status === 401) {
        navigate('/login?redirect=/portfolio/create');
      } else {
        setError(error.response?.data?.message || error.response?.data || 'Failed to create portfolio. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg flex items-center space-x-4">
          <div className="rotating-cube">
            <div className="rotating-cube-face cube-face-front"></div>
            <div className="rotating-cube-face cube-face-back"></div>
            <div className="rotating-cube-face cube-face-right"></div>
            <div className="rotating-cube-face cube-face-left"></div>
            <div className="rotating-cube-face cube-face-top"></div>
            <div className="rotating-cube-face cube-face-bottom"></div>
          </div>
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="holographic-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-4 animated-underline-always">
              Create Your Portfolio
            </h1>
            <p className="text-white/70">
              Build a stunning portfolio to showcase your work
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="holographic-card bg-red-500/20 border-red-500/50 p-4 text-red-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="form-label animated-underline">
                Portfolio Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your portfolio title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="form-label animated-underline">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Describe your portfolio"
                required
              />
            </div>

            <div>
              <label htmlFor="profileImage" className="form-label animated-underline">
                Profile Image URL *
              </label>
              <input
                type="url"
                id="profileImage"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/your-image.jpg"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="form-label animated-underline">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="form-label animated-underline">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="form-label animated-underline">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your city"
                />
              </div>

              <div>
                <label htmlFor="country" className="form-label animated-underline">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your country"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-medium text-lg animated-underline-always">Privacy Settings</h3>
              
              <div className="holographic-card p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isPublic" className="text-white font-medium animated-underline">
                    Make portfolio public
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isProjectsPublic"
                      name="isProjectsPublic"
                      checked={formData.isProjectsPublic}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isProjectsPublic" className="text-white text-sm animated-underline">
                      Show projects
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isEducationPublic"
                      name="isEducationPublic"
                      checked={formData.isEducationPublic}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isEducationPublic" className="text-white text-sm animated-underline">
                      Show education
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isExperiencePublic"
                      name="isExperiencePublic"
                      checked={formData.isExperiencePublic}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isExperiencePublic" className="text-white text-sm animated-underline">
                      Show experience
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isSkillsPublic"
                      name="isSkillsPublic"
                      checked={formData.isSkillsPublic}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isSkillsPublic" className="text-white text-sm animated-underline">
                      Show skills
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 md:col-span-2">
                    <input
                      type="checkbox"
                      id="isSocialMediaPublic"
                      name="isSocialMediaPublic"
                      checked={formData.isSocialMediaPublic}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isSocialMediaPublic" className="text-white text-sm animated-underline">
                      Show social media links
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`holographic-btn flex-1 flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="rotating-cube mr-2">
                      <div className="rotating-cube-face cube-face-front"></div>
                      <div className="rotating-cube-face cube-face-back"></div>
                      <div className="rotating-cube-face cube-face-right"></div>
                      <div className="rotating-cube-face cube-face-left"></div>
                      <div className="rotating-cube-face cube-face-top"></div>
                      <div className="rotating-cube-face cube-face-bottom"></div>
                    </div>
                    <span>Creating Portfolio...</span>
                  </>
                ) : (
                  <span>Create Portfolio</span>
                )}
              </button>
              <button
                type="button"
                className="glass-button flex-1"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCreateModern;