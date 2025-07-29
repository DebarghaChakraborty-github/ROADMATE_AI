import React from 'react';

// A reusable Card component for displaying grouped information with a clean design
const Card = ({
  children,        // Content to be rendered inside the card
  title,           // Optional title for the card
  className = '',  // Additional custom classes for the card container
  headerClassName = '', // Additional custom classes for the card header
  bodyClassName = '',   // Additional custom classes for the card body
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-4 mb-4 ${className}`}>
      {title && (
        <div className={`pb-3 mb-3 border-b border-gray-200 ${headerClassName}`}>
          <h2 className="text-lg font-semibold text-gray-800">
            {title}
          </h2>
        </div>
      )}
      <div className={`text-gray-700 ${bodyClassName}`}>
        {children} {/* This is where the card's content will be rendered */}
      </div>
    </div>
  );
};

export default Card;
