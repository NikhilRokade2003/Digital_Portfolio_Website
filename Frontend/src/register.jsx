import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Removed Navigation import for clean UI
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
  const [emailError, setEmailError] = useState('');
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const navigate = useNavigate();

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
    
    // Validate email format when email field changes
    if (name === 'email') {
      if (!value) {
        setEmailError('');
      } else if (!isValidEmail(value)) {
        setEmailError('Enter a valid email with @ and a domain like .com');
      } else {
        setEmailError('');
      }
    }
    
    // Calculate password strength when password field changes
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };
  
  // Email validator: requires one @ and a domain with extension (e.g., .com)
  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    return emailPattern.test(email);
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

    // Validate email format
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address (e.g., name@example.com).');
      setIsLoading(false);
      return;
    }

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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" ref={vantaRef}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        {/* Live wallpaper shapes */}
        <div className="live-wallpaper-shape live-wallpaper-1 opacity-20"></div>
        <div className="live-wallpaper-shape live-wallpaper-2 opacity-15"></div>
        <div className="live-wallpaper-shape live-wallpaper-3 opacity-20"></div>
        
        {/* Floating particles */}
        <div className="floating-particles opacity-30">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        
        {/* Aurora effect */}
        <div className="aurora opacity-25"></div>
      </div>
      
      <div className="relative z-10 glass-card p-12 m-16 flex flex-col items-center w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-white/30 rounded-full shadow-lg mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-primary-800">Create your account</h2>
          <p className="text-primary-700 mt-2">Start building your professional portfolio today</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && (
            <div className="bg-red-200/30 border border-red-400/40 text-red-900 p-4 mb-2 rounded-lg text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-primary-800 text-sm font-semibold mb-2 text-left" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="appearance-none bg-white/60 border-none rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 shadow-inner"
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-primary-800 text-sm font-semibold mb-2 text-left" htmlFor="email">
              Email Address
            </label>
            <input
              className="appearance-none bg-white/60 border-none rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 shadow-inner"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600">{emailError}</p>
            )}
          </div>
          <div>
            <label className="block text-primary-800 text-sm font-semibold mb-2 text-left" htmlFor="password">
              Password
            </label>
            <input
              className="appearance-none bg-white/60 border-none rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 shadow-inner"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              required
              minLength="8"
            />
            {/* Password strength meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex space-x-1 w-full">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1/5 rounded-full ${i < passwordStrength ? getPasswordStrengthColor() : 'bg-white/30'}`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-xs font-medium ml-2 min-w-[80px] text-right text-primary-700">
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <p className="text-xs text-primary-600">
                  Use at least 8 characters with uppercase, lowercase, numbers, and symbols
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-primary-800 text-sm font-semibold mb-2 text-left" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="appearance-none bg-white/60 border-none rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 shadow-inner"
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-200">
                Passwords don't match
              </p>
            )}
          </div>
          <button
            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading || !!emailError || !formData.email}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <div className="text-center">
            <span className="text-primary-700">Already have an account? </span>
            <Link to="/login" className="text-blue-200 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
