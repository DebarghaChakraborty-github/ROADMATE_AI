import React from 'react';

// A reusable input field component with Tailwind CSS styling
const Input = ({
  label,            // Optional label for the input field
  id,               // Unique ID for the input and its label (for accessibility)
  name,             // Name attribute for form submission
  type = 'text',    // Type of input (text, number, email, password, date, etc.)
  value,            // Current value of the input
  onChange,         // Handler function for input changes
  placeholder,      // Placeholder text
  required = false, // Boolean to indicate if the field is required
  disabled = false, // Boolean to disable the input
  error,            // String for displaying validation error messages
  className = '',   // Additional custom classes for the input element
  labelClassName = '', // Additional custom classes for the label element
  containerClassName = '', // Additional custom classes for the wrapping div
  min,              // Minimum value for number inputs
  max,              // Maximum value for number inputs
  step,             // Step for number inputs
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}> {/* Container for label, input, and error */}
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>} {/* Red asterisk for required fields */}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
