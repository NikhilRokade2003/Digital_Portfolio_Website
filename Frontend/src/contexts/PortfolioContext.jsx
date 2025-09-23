import React, { createContext, useContext, useState } from 'react';

// Example initial portfolio data structure
const initialPortfolio = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    profilePicture: '',
    summary: '',
    linkedin: '',
    github: '',
  },
  skills: [],
  projects: [],
  experience: [],
  education: [],
};

const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const resetPortfolio = () => setPortfolio(initialPortfolio);

  return (
    <PortfolioContext.Provider value={{ portfolio, setPortfolio, resetPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
