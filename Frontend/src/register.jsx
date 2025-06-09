import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from './components/Navigation';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Calculate password strength when password field changes
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };
  
  // Simple password strength calculator
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety check
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5); // Max strength is 5
  };
  
  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Very weak";
    if (passwordStrength === 2) return "Weak";
    if (passwordStrength === 3) return "Moderate";
    if (passwordStrength === 4) return "Strong";
    return "Very strong";
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-secondary-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-green-500";
    return "bg-emerald-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    // Validate password strength
    if (passwordStrength < 3) {
      setError('Please use a stronger password (at least 8 characters with uppercase, lowercase, numbers, and special characters)');
      setIsLoading(false);
      return;
    }

    try {
      // Send registration data without confirmPassword
      const { confirmPassword, ...registrationData } = formData;
      
      console.log('Sending registration request with data:', {
        email: registrationData.email,
        fullName: registrationData.fullName,
        password: '[REDACTED]' // Don't log actual password
      });
      
      // Register and immediately log in (server creates session cookie)
      const response = await authAPI.register(registrationData);
      console.log('Registration successful:', response.data.message);
      
      // With cookie-based auth, we're already logged in after registration
      // so redirect straight to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Server response:', err.response.data);
        console.error('Status code:', err.response.status);
        setError(err.response?.data?.message || `Registration failed (${err.response.status})`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response from server');
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError('Failed to register. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          {/* Register card header with logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-medium mb-4">
              <div className="bg-primary-600 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900">Create your account</h2>
            <p className="text-secondary-600 mt-2">Start building your professional portfolio today</p>
          </div>
          
          {/* Register card */}
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
                  <label className="block text-secondary-800 text-sm font-medium mb-2 text-left" htmlFor="fullName">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      className="appearance-none border border-secondary-200 rounded-lg w-full py-3 px-4 pl-10 text-secondary-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                  
                <div className="mb-6">
                  <label className="block text-secondary-800 text-sm font-medium mb-2 text-left" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      className="appearance-none border border-secondary-200 rounded-lg w-full py-3 px-4 pl-10 text-secondary-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                  
                <div className="mb-6">
                  <label className="block text-secondary-800 text-sm font-medium mb-2 text-left" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      className="appearance-none border border-secondary-200 rounded-lg w-full py-3 px-4 pl-10 text-secondary-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a secure password"
                      required
                      minLength="8"
                    />
                  </div>
                  
                  {/* Password strength meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex space-x-1 w-full">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-1.5 w-1/5 rounded-full ${i < passwordStrength ? getPasswordStrengthColor() : 'bg-secondary-200'}`}
                            ></div>
                          ))}
                        </div>
                        <span className="text-xs font-medium ml-2 min-w-[80px] text-right text-secondary-600">
                          {getPasswordStrengthLabel()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-secondary-500">
                        Use at least 8 characters with uppercase letters, lowercase letters, numbers, and symbols
                      </p>
                    </div>
                  )}
                </div>
                  
                <div className="mb-8">
                  <label className="block text-secondary-800 text-sm font-medium mb-2 text-left" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      className="appearance-none border border-secondary-200 rounded-lg w-full py-3 px-4 pl-10 text-secondary-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  
                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      Passwords don't match
                    </p>
                  )}
                </div>
                  
                <div className="flex flex-col gap-4">
                  <button
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-soft flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                  
                  <div className="text-center">
                    <span className="text-secondary-600">Already have an account? </span>
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300">
                      Sign in
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

export default Register;
