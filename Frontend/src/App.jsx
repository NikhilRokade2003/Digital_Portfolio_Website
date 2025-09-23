
import HomePage from './pages/HomePage.jsx';
import React from 'react';
import Register from './register.jsx';
import EditPage from './pages/EditPage.jsx';
import ViewPage from './pages/ViewPage.jsx';
import ShowcasePage from './pages/ShowcasePage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import LiveWallpaperWelcome from './pages/LiveWallpaperWelcome.jsx';
import Login from './pages/Login.jsx';
import PortfolioCreate from './pages/PortfolioCreate.jsx';
import PortfolioEdit from './pages/PortfolioEdit.jsx';
import PortfolioView from './pages/PortfolioView.jsx';
import PortfolioManager from './pages/PortfolioManager.jsx';
import PublicPortfolios from './pages/PublicPortfolios.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotificationCenter from './pages/NotificationCenter.jsx';
import ChatbotInterface from './pages/ChatbotInterface.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './contexts/PortfolioContext.jsx';


function App() {
  return (
    <PortfolioProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<LiveWallpaperWelcome />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/live" element={<LiveWallpaperWelcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portfolio/create" element={<PortfolioCreate />} />
          <Route path="/portfolio/edit/:id" element={<PortfolioEdit />} />
          <Route path="/portfolio/view/:id" element={<PortfolioView />} />
          <Route path="/portfolio/manager" element={<PortfolioManager />} />
          <Route path="/portfolios" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          {/* New Feature Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/chatbot" element={<ChatbotInterface />} />
        </Routes>
      </Router>
    </PortfolioProvider>
  );
}

export default App;