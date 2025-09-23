import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 sm-6 lg-8 py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} PortfolioForge. Built to showcase your talent.</p>
      </div>
    </footer>
  );
};

export default Footer;