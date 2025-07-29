import React from 'react';

// A reusable Select (dropdown) component with Tailwind CSS styling
const Select = ({
  label,            // Optional label for the select field
  id,               // Unique ID for the select and its label (for accessibility)
  name,             // Name attribute for form submission
  value,            // Current selected value
  onChange,         // Handler function for select changes
  options,          // Array of { value: string | number, label: string } objects
  placeholder = "Select an option", // Placeholder text for the default/first option
  required = false, // Boolean to indicate if the field is required
  disabled = false, // Boolean to disable the select
  error,            // String for displaying validation error messages
  className = '',   // Additional custom classes for the select element
  labelClassName = '', // Additional custom classes for the label element
  containerClassName = '', // Additional custom classes for the wrapping div
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}> {/* Container for label, select, and error */}
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>} {/* Red asterisk for required fields */}
        </label>
      )}
      <div className="relative"> {/* Wrapper for custom arrow styling */}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`block w-full p-3 border rounded-md shadow-sm appearance-none pr-10
            focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900'}
            ${className}
          `}
        >
          {/* Placeholder option (if value is empty or null) */}
          {!value && <option value="" disabled>{placeholder}</option>}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom arrow icon for a cleaner look (iPhone style doesn't show default arrow) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
