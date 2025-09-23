import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const linkClasses = "relative text-gray-500 hover-blue-600 transition-colors duration-200 py-2";
  const activeLinkClasses = "text-blue-600 font-semibold";

  return (
    <header className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm-6 lg-8">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">PortfolioForge</span>
          </NavLink>
          <nav className="hidden md-center space-x-8 text-md">
            <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>{({ isActive }) => <>Home{isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"/>}</>}</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>{({ isActive }) => <>Dashboard{isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"/>}</>}</NavLink>
            <NavLink to="/view" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>{({ isActive }) => <>My Portfolio{isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"/>}</>}</NavLink>
            <NavLink to="/showcase" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>{({ isActive }) => <>Showcase{isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"/>}</>}</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;