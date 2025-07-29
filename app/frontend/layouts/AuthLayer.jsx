import React from 'react';

// AuthLayout component provides a clean, centered structure for authentication pages
const AuthLayout = ({ children, title = 'Welcome to RideMate AI' }) => {
  return (
    // Main container for the auth layout.
    // Uses flexbox to center content vertically and horizontally.
    // min-h-screen ensures it takes at least the full viewport height.
    // bg-gradient-to-br from-blue-500 to-indigo-600 provides a visually appealing background.
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-inter p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md text-gray-800 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-blue-700">
          {title}
        </h1>
        <div className="space-y-4">
          {children} {/* This is where the login/signup forms will be rendered */}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

