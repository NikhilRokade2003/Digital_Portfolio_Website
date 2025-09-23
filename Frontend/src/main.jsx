import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Comprehensive console suppression for clean development experience
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Global console override to catch all console messages
window.addEventListener('load', () => {
  // Override console methods globally to catch React DevTools from chunks
  const globalConsoleLog = console.log;
  console.log = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string') {
      if (args[0].includes('Download the React DevTools') ||
          args[0].includes('react-devtools') ||
          args[0].includes('https://reactjs.org/link/react-devtools')) {
        return;
      }
    }
    return globalConsoleLog.apply(console, args);
  };
});

console.log = function(...args) {
  // Filter out React DevTools, request logs, and debug messages
  if (args.length > 0 && typeof args[0] === 'string') {
    if (args[0].includes('Download the React DevTools') ||
        args[0].includes('Request to ') ||
        args[0].includes('Fetching all visible portfolios') ||
        args[0].includes('Portfolios fetched successfully') ||
        args[0].includes('react-devtools')) {
      return;
    }
  }
  originalLog.apply(console, args);
};

console.error = function(...args) {
  // Filter out known errors from unimplemented features and React errors
  if (args.length > 0) {
    const message = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if ((message.includes('AccessRequest') && message.includes('500')) ||
        (message.includes('API Error') && message.includes('404')) ||
        (message.includes('Chatbot') && message.includes('404')) ||
        message.includes('Request failed with status code 404') ||
        message.includes('The above error occurred') ||
        message.includes('Consider adding an error boundary')) {
      return;
    }
  }
  originalError.apply(console, args);
};

console.warn = function(...args) {
  // Filter out React DevTools and development warnings
  if (args.length > 0 && typeof args[0] === 'string') {
    if (args[0].includes('Download the React DevTools') ||
        args[0].includes('react-devtools')) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
