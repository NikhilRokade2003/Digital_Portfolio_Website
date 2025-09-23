import React, { useState } from 'react';
import { examplePortfolios } from '../data/examplePortfolios';
import PortfolioView from '../components/PortfolioView';

const ShowcasePage = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(examplePortfolios[0]);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Portfolio Showcase</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Get inspired by these professional portfolio examples.
        </p>
      </div>

      <div className="flex justify-center border-b border-gray-200 mb-10">
        <div className="flex -mb-px space-x-6">
          {examplePortfolios.map((portfolio, index) => (
            <button
              key={index}
              onClick={() => setSelectedPortfolio(portfolio)}
              className={`px-1 py-3 text-md font-semibold transition-colors duration-200 border-b-2
                ${
                  selectedPortfolio.personalInfo.name === portfolio.personalInfo.name
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-300'
                }`
              }
            >
              {portfolio.personalInfo.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {selectedPortfolio && <PortfolioView data={selectedPortfolio} />}
      </div>
    </div>
  );
};

export default ShowcasePage;

// Add gradient background to ShowcasePage (handled globally in App.jsx)