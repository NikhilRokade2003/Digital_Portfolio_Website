import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-secondary-900">
            Welcome to Digital Portfolio Builder
          </h1>
          <p className="text-xl text-secondary-700 mb-10 leading-relaxed">
            Create, customize, and share your professional portfolio with the world
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Link 
              to="/register" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-md font-medium transition-colors duration-300 shadow-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Get Started
            </Link>
          </div>
          
          {/* Subtle decorative element */}
          <div className="flex justify-center">
            <div className="w-16 h-1 bg-primary-500 rounded-full opacity-75"></div>
          </div>
        </div>
        
        {/* Features with hover effects */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-medium hover:shadow-hard transition-all duration-300 border-t-4 border-primary-500">
            <div className="rounded-full bg-primary-50 w-14 h-14 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-secondary-900">Create Your Portfolio</h2>
            <p className="text-secondary-700">Build your professional portfolio to showcase your skills, projects, and experience.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-medium hover:shadow-hard transition-all duration-300 border-t-4 border-accent-500">
            <div className="rounded-full bg-accent-50 w-14 h-14 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-secondary-900">Customize Everything</h2>
            <p className="text-secondary-700">Add projects, education history, work experience, and skills to your portfolio.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-medium hover:shadow-hard transition-all duration-300 border-t-4 border-secondary-500">
            <div className="rounded-full bg-secondary-50 w-14 h-14 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-secondary-900">Share With Anyone</h2>
            <p className="text-secondary-700">Choose between public and private portfolios, and share your work with potential employers.</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Footer */}
      <footer className="bg-secondary-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center text-center">
            <div>
              <h3 className="font-bold text-2xl mb-2">Digital Portfolio Builder</h3>
              <p className="text-secondary-300">&copy; {new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;