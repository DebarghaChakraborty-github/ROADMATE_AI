import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

/**
 * @file src/context/NotificationContext.jsx
 * @description Provides a global notification (toast) system for the application.
 * Components can use the `useNotification` hook to display various types of
 * messages (success, error, info, warning) to the user in a non-intrusive way.
 */

// Create the Notification Context
const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // { message, type, duration }
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * Displays a notification toast message.
   * @param {string} message - The message to display.
   * @param {'success' | 'error' | 'info' | 'warning'} type - The type of notification.
   * @param {number} [duration=3000] - How long the notification should be visible in milliseconds.
   */
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    // Clear any existing timeout to prevent multiple toasts overlapping or conflicting
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setNotification({ message, type });

    if (duration > 0) {
      const id = setTimeout(() => {
        setNotification(null); // Hide notification after duration
      }, duration);
      setTimeoutId(id);
    }
  }, [timeoutId]);

  // Clean up timeout on unmount or when a new notification is shown
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const contextValue = {
    notification,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook for consuming the NotificationContext
export const useNotification = () => useContext(NotificationContext);

export default NotificationContext;
