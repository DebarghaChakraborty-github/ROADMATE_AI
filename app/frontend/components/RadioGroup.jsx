import React from 'react';

// A reusable Radio Group component with iPhone-style aesthetics using Tailwind CSS
const RadioGroup = ({
  label,            // Optional main label for the group
  name,             // Name attribute for the radio inputs (important for group functionality)
  options,          // Array of { value: string | number, label: string } objects
  selectedValue,    // The currently selected value
  onChange,         // Handler function for when a radio option is selected
  disabled = false, // Boolean to disable all radios in the group
  error,            // String for displaying validation error messages
  className = '',   // Additional custom classes for the container div
  labelClassName = '', // Additional custom classes for the main group label
  optionLabelClassName = '', // Additional custom classes for individual option labels
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div className="space-y-2"> {/* Vertical spacing between radio options */}
        {options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${name}-${option.value}`} // Unique ID for each radio input
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors duration-200
              ${selectedValue === option.value
                ? 'bg-blue-100 border-blue-500 text-blue-700 border-2' // Selected style
                : 'bg-white border-gray-300 text-gray-800 border hover:bg-gray-50'} // Default/hover style
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${optionLabelClassName}
            `}
          >
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={onChange}
              disabled={disabled}
              className="sr-only peer" // Visually hide native radio, keep accessible
            />
            {/* Custom Radio Button Indicator */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-3
              ${selectedValue === option.value ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'}
              peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300
            `}>
              {selectedValue === option.value && (
                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                </svg>
              )}
            </div>
            <span className="text-base">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;
