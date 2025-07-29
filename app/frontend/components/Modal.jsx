import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

// A reusable Modal component with iPhone-style aesthetics using Tailwind CSS
const Modal = ({
  isOpen,           // Boolean to control visibility of the modal
  onClose,          // Function to call when the modal needs to be closed
  children,         // Content to be rendered inside the modal
  title,            // Optional title for the modal header
  className = '',   // Additional custom classes for the modal content area
  overlayClassName = '', // Additional custom classes for the overlay
  disableOutsideClick = false, // If true, clicking outside won't close the modal
}) => {
  // Handle escape key to close modal
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && !disableOutsideClick) {
      onClose();
    }
  }, [onClose, disableOutsideClick]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling of background content
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'unset'; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = 'unset'; // Clean up on unmount
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null; // Don't render anything if modal is not open

  // Render the modal using a Portal to ensure it's mounted directly under <body>
  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ease-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${overlayClassName}
      `}
      onClick={disableOutsideClick ? null : onClose} // Close on outside click unless disabled
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Modal content area */}
      <div
        className={`bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md z-10 transform transition-transform duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            {title || 'Information'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>,
    document.body // Render modal directly into the body
  );
};

export default Modal;
