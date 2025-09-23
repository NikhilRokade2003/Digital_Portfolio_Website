import React from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import PortfolioView from '../components/PortfolioView';
import { Link } from 'react-router-dom';

const ViewPage = () => {
  const { portfolio } = usePortfolio();
  
  // A simple check to see if the portfolio is still the default template
  const isDefault = portfolio.personalInfo.name === 'Alex Doe';

  return (
    <div>
        {isDefault && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg mb-8" role="alert">
                <div className="flex">
                    <div className="py-1">
                        <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-bold">You're viewing the default template!</p>
                        <p className="text-sm">Head over to the <Link to="/dashboard" className="font-semibold underline hover-yellow-900">Dashboard</Link> to build your own personalized portfolio.</p>
                    </div>
                </div>
            </div>
        )}
      <PortfolioView data={portfolio} />
    </div>
  );
};

export default ViewPage;

// Add gradient background to ViewPage (handled globally in App.jsx)