import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'; // Import useNavigate
import AppRoutes from './routes/AppRoutes'; // Your routing configuration

// Import all context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { RiderProvider, useRider } from './context/RiderContext';
import { VehicleProvider, useVehicle } from './context/VehicleContext';
import { TripProvider, useTrip } from './context/TripContext';
import { NotificationProvider, useNotification } from './context/NotificationContext'; // New Notification Context

// Import global UI components
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage'; // For specific error messages
import Modal from './components/Modal'; // For global confirmation/alert modals
import Button from './components/Button'; // For modal buttons

/**
 * @file src/App.jsx
 * @description The main application component. It serves as the root for the entire React app,
 * setting up global context providers, a robust error boundary, a dynamic loading overlay,
 * a human-centric notification system, and the routing system. This file orchestrates the
 * overall application state and user experience with a focus on vivid and emotional feedback.
 */

// =========================================================================
// 1. Global Error Boundary Component
//    - Catches JavaScript errors anywhere in its child component tree.
//    - Logs the errors and displays a fallback UI with an empathetic tone.
// =========================================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("A critical error occurred in the application:", error, errorInfo);
    this.setState({ errorInfo });
    // In a real app, send error to Sentry, Bugsnag, etc.
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-red-200 text-red-900 p-8 rounded-xl shadow-2xl animate-fade-in">
          <div className="text-6xl mb-6 animate-bounce-slow">💔</div>
          <h1 className="text-4xl font-extrabold text-center mb-4 leading-tight">
            Oh no! Our adventure hit a snag...
          </h1>
          <p className="text-xl text-center mb-8 max-w-lg">
            It looks like something unexpected went wrong on our journey.
            Don't worry, we're working to get things back on track!
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            className="px-8 py-4 text-lg font-semibold bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Let's Try Again (Refresh Page)
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-12 p-6 bg-red-50 rounded-lg text-sm text-red-800 max-w-2xl overflow-auto border border-red-300 shadow-inner">
              <summary className="font-bold text-lg cursor-pointer text-red-700 hover:text-red-900 transition-colors">
                Developer Insights: What went wrong? (Click to expand)
              </summary>
              <pre className="whitespace-pre-wrap break-words mt-4 p-3 bg-red-100 rounded-md border border-red-200 text-red-800 font-mono">
                {this.state.error && `Error: ${this.state.error.toString()}\n\n`}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// =========================================================================
// 2. Global Notification (Toast) Component
//    - Displays dynamic, emotional toast messages based on type.
// =========================================================================
const GlobalNotificationDisplay = () => {
  const { notification, showNotification } = useNotification();

  if (!notification || !notification.message) return null;

  let bgColorClass = '';
  let icon = '';
  let title = '';

  switch (notification.type) {
    case 'success':
      bgColorClass = 'bg-green-600';
      icon = '✅';
      title = 'Success!';
      break;
    case 'error':
      bgColorClass = 'bg-red-600';
      icon = '❌';
      title = 'Oh no!';
      break;
    case 'warning':
      bgColorClass = 'bg-orange-500';
      icon = '⚠️';
      title = 'Heads Up!';
      break;
    case 'info':
    default:
      bgColorClass = 'bg-blue-500';
      icon = '💡';
      title = 'Just So You Know...';
      break;
    case 'critical': // For very serious, persistent alerts
      bgColorClass = 'bg-purple-700';
      icon = '🚨';
      title = 'Critical Alert!';
      break;
    case 'emotional': // For more personal, vivid messages
      bgColorClass = 'bg-pink-600';
      icon = '💖';
      title = 'A Little Note...';
      break;
  }

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl z-50 text-white
                    flex items-start space-x-3 transform transition-all duration-500 ease-out animate-fade-in-up ${bgColorClass}`}
         style={{ minWidth: '280px', maxWidth: '90%', animationFillMode: 'forwards' }}>
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div className="flex-grow">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm leading-snug">{notification.message}</p>
      </div>
      <button
        onClick={() => showNotification(null)} // Clear notification
        className="ml-4 text-white hover:text-gray-200 transition-colors duration-200 text-xl font-bold leading-none"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

// =========================================================================
// 3. Global Loading Overlay
//    - Displays a full-screen loading spinner with empathetic messages
//      reflecting the current operation.
// =========================================================================
const GlobalLoadingOverlay = () => {
  const { isLoadingAuth } = useAuth();
  const { isLoadingRider } = useRider();
  const { isLoadingVehicle } = useVehicle();
  const { isLoadingTrips } = useTrip();

  const isGlobalLoading = isLoadingAuth || isLoadingRider || isLoadingVehicle || isLoadingTrips;

  // Determine a more specific, human-like loading message
  const getLoadingMessage = () => {
    if (isLoadingAuth) return "Securing your ride... just a moment!";
    if (isLoadingRider) return "Fine-tuning your rider profile... almost there!";
    if (isLoadingVehicle) return "Inspecting your magnificent machine... patience, my friend!";
    if (isLoadingTrips) return "Charting your next grand adventure... maps are loading!";
    return "Preparing your journey... the open road awaits!"; // Fallback
  };

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-opacity-95 flex flex-col items-center justify-center z-[100] animate-fade-in">
      <LoadingSpinner size="lg" color="white" />
      <p className="text-white text-2xl font-semibold mt-6 text-center animate-pulse">
        {getLoadingMessage()}
      </p>
      <p className="text-gray-300 text-lg mt-2">
        We're working hard behind the scenes to bring you the best experience.
      </p>
    </div>
  );
};

// =========================================================================
// 4. Main App Component
//    - Wraps the entire application with necessary providers and global UI.
//    - Orchestrates the main application flow.
// =========================================================================
function App() {
  // `useNavigate` must be called inside a component that is a descendant of <Router>.
  // Since App is not directly wrapped by Router (it's wrapped by Router in index.js),
  // we need a wrapper component or to put Router directly in App.
  // For this detailed App.jsx, we'll put Router directly here.
  return (
    // ErrorBoundary should be the outermost wrapper to catch errors from anywhere inside.
    <ErrorBoundary>
      {/* BrowserRouter is now placed directly here to allow useNavigate within its children */}
      <Router>
        {/*
          NotificationProvider is placed high in the tree so `useNotification`
          can be accessed by any component below it.
        */}
        <NotificationProvider>
          {/*
            AuthContext now expects the `navigate` function to handle redirects.
            This ensures proper routing behavior for login/logout.
            We create a wrapper component to pass `useNavigate` result.
          */}
          <AuthWrapper />
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

// Helper component to provide `navigate` to AuthProvider
// This pattern is necessary because `useNavigate` must be called inside a <Router> context.
const AuthWrapper = () => {
  const navigate = useNavigate(); // Get the navigate function from react-router-dom

  return (
    <AuthProvider navigate={navigate}> {/* Pass navigate to AuthProvider */}
      <RiderProvider>
        <VehicleProvider>
          <TripProvider>
            {/* Global Loading Overlay is rendered here, consuming context loading states */}
            <GlobalLoadingOverlay />

            {/* Global Notification system display */}
            <GlobalNotificationDisplay />

            {/* AppRoutes defines the navigation structure */}
            <AppRoutes />
          </TripProvider>
        </VehicleProvider>
      </RiderProvider>
    </AuthProvider>
  );
};

export default App;
