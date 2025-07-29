import React from 'react';

// A reusable component for displaying error messages
const ErrorMessage = ({ message, type = 'error', onClose = null }) => {
  // Determine styling based on the type of message
  const typeClasses = {
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  // Default message if none is provided
  const displayMessage = message || 'An unexpected error occurred. Please try again.';

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${typeClasses[type]} mb-4 flex items-center justify-between shadow-md`}
      role="alert" // Accessibility role for an alert
    >
      <div className="flex items-center">
        {/* You could add an icon here based on type, e.g., 🚨 for error */}
        <span className="text-xl mr-3">
          {type === 'error' && '🚨'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </span>
        <p className="font-medium text-sm sm:text-base">
          {displayMessage}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
          // Adjust button color based on type for better contrast
          style={{
            backgroundColor: type === 'error' ? 'rgba(255, 0, 0, 0.2)' :
                           type === 'warning' ? 'rgba(255, 165, 0, 0.2)' :
                           'rgba(0, 0, 255, 0.2)',
            color: type === 'error' ? 'rgb(153, 27, 27)' :
                   type === 'warning' ? 'rgb(146, 64, 14)' :
                   'rgb(29, 78, 216)'
          }}
          aria-label="Close alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
