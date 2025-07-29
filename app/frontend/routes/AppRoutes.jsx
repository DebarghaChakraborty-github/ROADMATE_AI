import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your page components
import RiderSetupPage from '../pages/RiderSetupPage';
import VehicleSetupPage from '../pages/VehicleSetupPage';
import AIItineraryPage from '../pages/AIItineraryPage';
import RidesPage from '../pages/RidesPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ProfilePage from '../pages/ProfilePage';
import MarketplacePage from '../pages/MarketplacePage';
import SocialFeedPage from '../pages/SocialFeedPage';

// Placeholder for a Home or Dashboard page (if not AIItineraryPage)
// You might want a simple landing page or a combined dashboard later
const HomePage = () => (
  <AIItineraryPage /> // For now, AI Itinerary acts as the primary landing page
);

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Core Application Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/rider-setup" element={<RiderSetupPage />} />
        <Route path="/vehicle-setup" element={<VehicleSetupPage />} />
        <Route path="/ai-itinerary" element={<AIItineraryPage />} />
        <Route path="/rides" element={<RidesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/social-feed" element={<SocialFeedPage />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Add a forgot password page if needed later */}
        <Route path="/forgot-password" element={<LoginPage />} /> {/* Placeholder, redirect to login for now */}

        {/* Catch-all for undefined routes (optional) */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-lg mb-6 text-center">
              Oops! The page you're looking for doesn't exist.
            </p>
            <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200">
              Go to Home
            </Link>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
