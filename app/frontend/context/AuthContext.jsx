// ... (previous imports and code for AuthContext.jsx)

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/axios'; // Import your configured axios instance
import { useNotification } from './NotificationContext'; // Import the new notification context

// Create Auth Context
const AuthContext = createContext();

// Initial state for authentication
const initialAuthState = {
  user: null, // User object { id, username, email, roles }
  isAuthenticated: false,
  isLoadingAuth: true, // true by default while checking auth status
  authError: null,
};

// Auth Provider Component
// It now accepts a 'navigate' prop from React Router
export const AuthProvider = ({ children, navigate }) => { // Added navigate prop
  const [authState, setAuthState] = useState(initialAuthState);
  const { showNotification } = useNotification(); // Use the notification hook

  // Simulate user login
  const login = useCallback(async (username, password) => {
    setAuthState(prev => ({ ...prev, isLoadingAuth: true, authError: null }));
    try {
      // Simulate API call to backend /api/auth/login
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;

      // Store token (e.g., in localStorage, or secure HTTP-only cookie)
      localStorage.setItem('authToken', token); // For simplicity, using localStorage

      setAuthState({
        user: user,
        isAuthenticated: true,
        isLoadingAuth: false,
        authError: null,
      });
      showNotification('Login successful! Welcome back, Rider!', 'success');
      // Redirect to dashboard or previous page after successful login
      navigate('/'); // Use the passed navigate function
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthState(prev => ({ ...prev, isLoadingAuth: false, authError: errorMessage }));
      showNotification(errorMessage, 'error');
    }
  }, [navigate, showNotification]); // Add navigate and showNotification to dependencies

  // Simulate user signup
  const signup = useCallback(async (username, email, password) => {
    setAuthState(prev => ({ ...prev, isLoadingAuth: true, authError: null }));
    try {
      // Simulate API call to backend /api/auth/signup
      const response = await api.post('/auth/signup', { username, email, password });
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);

      setAuthState({
        user: user,
        isAuthenticated: true,
        isLoadingAuth: false,
        authError: null,
      });
      showNotification('Account created successfully! Welcome to RideIndia!', 'success');
      navigate('/rider-setup'); // Redirect to rider setup after signup
    } catch (err) {
      console.error('Signup failed:', err);
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setAuthState(prev => ({ ...prev, isLoadingAuth: false, authError: errorMessage }));
      showNotification(errorMessage, 'error');
    }
  }, [navigate, showNotification]);

  // Simulate user logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken'); // Clear token
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoadingAuth: false,
      authError: null,
    });
    showNotification('You have been logged out. See you on the road!', 'info');
    navigate('/login'); // Redirect to login page after logout
  }, [navigate, showNotification]);

  // Effect to check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // In a real app, you'd send this token to your backend to validate it
          // and fetch user details. For now, we'll simulate success.
          // await api.get('/auth/validate-token'); // Example validation call
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate validation delay

          // Dummy user data if validation succeeds
          setAuthState({
            user: { id: 'dummy-user-id', username: 'AuthRider', email: 'auth@example.com' },
            isAuthenticated: true,
            isLoadingAuth: false,
            authError: null,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoadingAuth: false }));
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        localStorage.removeItem('authToken'); // Ensure token is cleared if validation fails
        setAuthState(prev => ({ ...prev, isAuthenticated: false, isLoadingAuth: false, authError: 'Session expired or invalid.' }));
        showNotification('Your session has expired. Please log in again.', 'warning');
      }
    };

    checkAuthStatus();
  }, [showNotification]); // showNotification is a dependency

  // Context value to be provided to consumers
  const contextValue = {
    ...authState,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for consuming the AuthContext
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
