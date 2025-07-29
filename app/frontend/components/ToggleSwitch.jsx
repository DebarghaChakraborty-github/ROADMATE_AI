import React from 'react';

// A reusable Toggle Switch component with iPhone-style aesthetics using Tailwind CSS
const ToggleSwitch = ({
  label,            // Optional label for the switch
  id,               // Unique ID for the input and its label (for accessibility)
  name,             // Name attribute for form submission
  checked,          // Boolean indicating if the switch is on (checked)
  onChange,         // Handler function for switch changes
  disabled = false, // Boolean to disable the switch
  className = '',   // Additional custom classes for the container div
  labelClassName = '', // Additional custom classes for the label text
}) => {
  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-base font-medium text-gray-700 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer" // sr-only hides the actual checkbox visually but keeps it accessible
        />
        {/* The visual toggle switch track */}
        <div
          className={`w-11 h-6 rounded-full peer
            ${checked ? 'bg-blue-600' : 'bg-gray-200'}
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm
            ${checked ? 'after:translate-x-full after:border-white' : ''}
          `}
        ></div>
      </label>
    </div>
  );
};

export default ToggleSwitch;
