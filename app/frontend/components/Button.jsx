import React from 'react';

// A versatile Button component with iPhone-style aesthetics using Tailwind CSS
const Button = ({
  children,           // Content inside the button (text, icon, etc.)
  onClick,            // Click handler function
  type = 'button',    // Type of button: 'submit', 'button', 'reset'
  disabled = false,   // Boolean to disable the button
  variant = 'primary',// 'primary', 'secondary', 'danger', 'ghost'
  size = 'md',        // 'sm', 'md', 'lg'
  className = '',     // Additional custom Tailwind classes
}) => {
  // Base styles for all buttons (iPhone-like rounded corners, transitions, focus)
  const baseStyles = 'flex items-center justify-center font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Size-specific styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  // Variant-specific styles (colors, backgrounds, borders)
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500', // Text-only button
  };

  // Disabled state styles
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? disabledStyles : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
