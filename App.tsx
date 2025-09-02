
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EditPage from './pages/EditPage';
import ViewPage from './pages/ViewPage';
import ShowcasePage from './pages/ShowcasePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/showcase" element={<ShowcasePage />} />
              <Route 
                path="/edit" 
                element={
                  <ProtectedRoute>
                    <EditPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/view" 
                element={
                  <ProtectedRoute>
                    <ViewPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;
