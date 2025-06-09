import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Add animation classes when component mounts
    const number = document.querySelector('.error-number');
    const ghost = document.querySelector('.ghost');
    
    if (number && ghost) {
      number.classList.add('animate-bounce');
      ghost.classList.add('animate-float');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-blue-50 to-green-100">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-10 max-w-2xl mx-auto transform transition-all hover:shadow-2xl">
          <div className="relative">
            {/* Ghost SVG with floating animation */}
            <svg
              className="ghost w-40 h-40 mx-auto mb-6 text-transparent bg-clip-text fill-current"
              style={{ color: 'url(#gradient-fill)' }}
              viewBox="0 0 24 24"
              stroke="url(#gradient-stroke)"
            >
              <defs>
                <linearGradient id="gradient-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            
            {/* 404 Number with bounce animation */}
            <div className="error-number text-9xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 mb-6">404</div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-700 text-xl mb-8">
            Oops! The page you're looking for seems to have vanished into thin air.
          </p>
          
          <Link
            to="/"
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-medium hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition transform hover:-translate-y-1 shadow-md inline-flex items-center"
          >
            Return Home
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(0deg); }
          75% { transform: translateY(-15px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}