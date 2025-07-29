import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Assuming react-router-dom for navigation

// Component for the mobile-first bottom navigation bar
const BottomNav = () => {
  const location = useLocation(); // Hook to get the current URL location

  // Define navigation items with their paths and icons
  // You would typically use actual SVG icons or icon library components here (e.g., Font Awesome, Lucide React)
  // For simplicity, we'll use placeholder text/emojis for icons.
  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' }, // Or a dashboard/overview page
    { name: 'Rider', path: '/rider-setup', icon: '👤' },
    { name: 'Vehicle', path: '/vehicle-setup', icon: '🏍️' },
    { name: 'Plan', path: '/ai-itinerary', icon: '🗺️' },
    { name: 'Rides', path: '/rides', icon: '🛣️' }, // For logged/past rides
    { name: 'Market', path: '/market', icon: '🛒' }, // For marketplace stub
    { name: 'Profile', path: '/profile', icon: '⚙️' }, // For user settings/history
  ];

  return (
    // Tailwind CSS classes for a fixed bottom navigation bar
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-full overflow-x-auto px-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            // Apply active styles if the current path matches the item's path
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out
              ${location.pathname === item.path ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
              flex-shrink-0 w-20 sm:w-24 md:w-28 lg:w-32 xl:w-36 // Responsive width for items
            `}
          >
            <span className="text-xl mb-1">{item.icon}</span> {/* Icon */}
            <span className="whitespace-nowrap">{item.name}</span> {/* Name */}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
