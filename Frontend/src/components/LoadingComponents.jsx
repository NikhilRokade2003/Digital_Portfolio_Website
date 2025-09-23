import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );
};

const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/20 rounded skeleton w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/20 rounded skeleton"></div>
          <div className="h-3 bg-white/20 rounded skeleton w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-6 w-16 bg-white/20 rounded-full skeleton"></div>
          <div className="h-6 w-20 bg-white/20 rounded-full skeleton"></div>
        </div>
      </div>
    </div>
  );
};

const LoadingDots = ({ className = '' }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

const ProgressBar = ({ progress = 0, className = '' }) => {
  return (
    <div className={`w-full bg-white/10 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  );
};

const PulseCard = ({ children, className = '' }) => {
  return (
    <div className={`glass-card hover-lift hover-glow transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export { LoadingSpinner, SkeletonCard, LoadingDots, ProgressBar, PulseCard };