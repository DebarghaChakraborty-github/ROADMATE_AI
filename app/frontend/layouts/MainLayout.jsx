import React from 'react';
import BottomNav from '../components/BottomNav'; // Import the BottomNav component

// MainLayout component provides a consistent structure for all pages
const MainLayout = ({ children, pageTitle = 'RideMate AI' }) => {
  return (
    // Main container for the entire layout.
    // Uses flexbox to arrange header, main content, and bottom nav vertically.
    // min-h-screen ensures it takes at least the full viewport height.
    // bg-gray-50 provides a light background for the app.
    <div className="flex flex-col min-h-screen bg-gray-50 font-inter">
      {/* Optional Header for app title or branding */}
      <header className="bg-white shadow-sm p-4 text-center text-xl font-bold text-gray-800 sticky top-0 z-40">
        {pageTitle}
      </header>

      {/* Main content area.
          flex-grow allows it to take up available space.
          overflow-y-auto enables vertical scrolling for content.
          pb-16 adds padding at the bottom to prevent content from being
          obscured by the fixed BottomNav.
          px-4 py-6 adds horizontal and vertical padding for content.
      */}
      <main className="flex-grow overflow-y-auto px-4 py-6 pb-20"> {/* Increased pb to 20 for more clearance */}
        {children} {/* This is where the actual page content will be rendered */}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
