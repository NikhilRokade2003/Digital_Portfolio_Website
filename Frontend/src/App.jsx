import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './register';
import Dashboard from './pages/Dashboard';
import PublicPortfolios from './pages/PublicPortfolios';
import PortfolioCreate from './pages/PortfolioCreate';
import PortfolioEdit from './pages/PortfolioEdit';
import PortfolioView from './pages/PortfolioView';
import { authAPI } from '../services/api';

// AuthGuard component for protected routes with proper async handling
const AuthGuard = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use await to properly resolve the Promise
        const authStatus = await authAPI.isAuthenticated();
        console.log('AuthGuard check: User is authenticated?', authStatus);
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show nothing while checking authentication
  if (isChecking) {
    return <div>Checking authentication...</div>;
  }
  
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/portfolios" element={<PublicPortfolios />} />
        <Route path="/portfolio/view/:id" element={<PortfolioView />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/portfolio/create" 
          element={
            <AuthGuard>
              <PortfolioCreate />
            </AuthGuard>
          } 
        />
        <Route 
          path="/portfolio/edit/:id" 
          element={
            <AuthGuard>
              <PortfolioEdit />
            </AuthGuard>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
