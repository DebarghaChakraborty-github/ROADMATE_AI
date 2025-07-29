import React from 'react';

// A reusable ListItem component for displaying key-value pairs or simple items in a list
const ListItem = ({
  label,            // The descriptive label for the item
  value,            // The actual value or content of the item
  icon,             // Optional: An icon component or JSX to display before the label
  onClick,          // Optional: Function to call if the item is clickable
  className = '',   // Additional custom classes for the main list item div
  labelClassName = '', // Additional custom classes for the label span
  valueClassName = '', // Additional custom classes for the value span
}) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`flex items-center justify-between py-2 px-1 border-b border-gray-100 last:border-b-0
        ${isClickable ? 'cursor-pointer hover:bg-gray-50 transition-colors duration-150 rounded-md' : ''}
        ${className}
      `}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined} // Accessibility role
      tabIndex={isClickable ? 0 : undefined} // Make clickable items focusable
    >
      <div className="flex items-center flex-grow">
        {icon && <span className="mr-3 text-xl text-gray-500 flex-shrink-0">{icon}</span>}
        <span className={`text-sm font-medium text-gray-600 flex-shrink-0 mr-2 ${labelClassName}`}>
          {label}:
        </span>
        <span className={`text-base text-gray-800 flex-grow text-right ${valueClassName}`}>
          {value}
        </span>
      </div>
      {/* Optional chevron or arrow for clickable items */}
      {isClickable && (
        <svg className="ml-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      )}
    </div>
  );
};

export default ListItem;
