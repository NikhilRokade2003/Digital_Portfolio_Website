import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="text-center py-20 sm-28">
      <h1 className="text-5xl md-7xl font-extrabold text-gray-900 tracking-tighter">
        Forge Your
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"> Digital Presence</span>.
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
        Effortlessly build a stunning, professional portfolio that showcases your skills, projects, and experience. Stand out and get hired.
      </p>
      <div className="mt-10 flex flex-col sm-row justify-center items-center gap-4">
        <Link 
          to="/edit"
          className="w-full sm-auto inline-flex items-center justify-center bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover-blue-700 focus-none focus-2 focus-blue-500 focus-offset-2 transition-all duration-300 transform hover:-translate-y-1"
        >
          Create Your Portfolio
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link 
          to="/showcase"
          className="w-full sm-auto inline-block bg-white text-gray-700 font-semibold px-8 py-3 rounded-lg shadow-md border border-gray-300 hover-gray-100 hover-gray-400 transition-colors duration-300"
        >
          Explore Examples
        </Link>
      </div>
       <div className="mt-20 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-4 border border-gray-200 aspect-video overflow-hidden">
            <div className="bg-gray-100 h-8 rounded-t-lg flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <img src="https://picsum.photos/seed/homepage/1200/600" alt="Portfolio example" className="w-full h-full object-cover object-top" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

// Add gradient background to HomePage (handled globally in App.jsx)