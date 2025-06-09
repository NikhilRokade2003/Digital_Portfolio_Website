import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authAPI } from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (await authAPI.isAuthenticated()) {
          console.log('User is already authenticated, navigating to dashboard');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    };
    
    checkAuthentication();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login...');
      const response = await authAPI.login(formData);
      console.log('Login response received:', response.data.message);
      
      // With cookie-based auth, we don't need to store tokens
      console.log('Authentication successful, redirecting to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          {/* Login card header with logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-medium mb-4">
              <div className="bg-primary-600 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900">Welcome back</h2>
            <p className="text-secondary-600 mt-2">Sign in to manage your professional portfolio</p>
          </div>
          
          {/* Login card */}
          <div className="bg-white rounded-xl shadow-medium overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-secondary-800 text-sm font-medium mb-2 text-left">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="appearance-none border border-secondary-200 rounded-lg w-full py-3 px-4 pl-10 text-secondary-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <label htmlFor="password" className="block text-secondary-800 text-sm font-medium text-left">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="appearance-none border border-secondary-200 rounded-lg w-full py-3 px-4 pl-10 text-secondary-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-soft flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      'Sign In to Account'
                    )}
                  </button>
                  
                  <div className="text-center">
                    <span className="text-secondary-600">Don't have an account? </span>
                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300">
                      Create account
                    </Link>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Footer section */}
            <div className="px-8 py-4 bg-secondary-50 border-t border-secondary-100">
              {/* Terms and privacy text removed as requested */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;