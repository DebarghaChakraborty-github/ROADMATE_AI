import React from 'react';

// A simple loading spinner component
const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  // Determine spinner size based on prop
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  // Determine spinner color based on prop (using Tailwind CSS color classes)
  const colorClasses = {
    blue: 'border-blue-500 border-t-blue-200',
    gray: 'border-gray-500 border-t-gray-200',
    white: 'border-white border-t-gray-300',
    // Add more colors as needed
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} border-solid`}
        role="status" // Accessibility role
        aria-label="Loading" // Accessibility label
      >
        <span className="sr-only">Loading...</span> {/* Screen reader only text */}
      </div>
    </div>
  );
};

export default LoadingSpinner;
