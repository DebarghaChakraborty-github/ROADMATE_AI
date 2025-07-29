import axios from 'axios';

/**
 * @file src/services/axios.js
 * @description Configures and exports a pre-configured Axios instance for API requests.
 * This centralizes API call settings, making it easier to manage base URLs,
 * headers, and interceptors across the application, especially for different environments.
 */

// =========================================================================
// 1. Base URL Configuration
// =========================================================================
// It's crucial to use environment variables for the API base URL.
// This allows you to easily switch between development, staging, and production APIs
// without changing code.
//
// For Create React App (CRA) or Vite (with a slight prefix change),
// environment variables starting with REACT_APP_ (CRA) or VITE_ (Vite)
// are exposed to the browser.
//
// IMPORTANT: You MUST create a .env file in your project's root directory.
// For example:
// .env
// REACT_APP_API_BASE_URL=http://localhost:5000/api
//
// .env.production
// REACT_APP_API_BASE_URL=https://api.yourproductiondomain.com/api
//
// Make sure to restart your development server after creating/modifying .env files.

// Using your provided local backend URL as the default fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

if (!API_BASE_URL || API_BASE_URL === 'http://localhost:5000/api') {
  console.warn(
    "WARNING: REACT_APP_API_BASE_URL is not set in your environment variables " +
    "or is still using the default local backend URL. Please set it in your .env file " +
    "to your actual backend API URL (e.g., 'http://localhost:5000/api' for local dev, " +
    "or your deployed backend URL for production)."
  );
}

// =========================================================================
// 2. Create Custom Axios Instance
// =========================================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Explicitly request JSON responses
  },
  timeout: 15000, // Request timeout in milliseconds (increased slightly for potentially slower mobile networks)
  withCredentials: true, // If your backend uses cookies/sessions (e.g., for CSRF protection)
});

// =========================================================================
// 3. Request Interceptors (Outgoing Requests)
// =========================================================================
api.interceptors.request.use(
  (config) => {
    // This function runs BEFORE a request is sent.
    // It's ideal for adding authentication tokens (e.g., JWT) to the request headers.

    // How to get the token:
    // 1. From localStorage:
    const authToken = localStorage.getItem('authToken'); // Assuming you store your token here
    // 2. From a global state manager (e.g., Redux, Zustand, Context API):
    // const authToken = store.getState().auth.token; // Example for Redux-like store
    // 3. From a React Context (e.g., your AuthContext):
    // This would typically be handled within the component/hook making the request,
    // or by making the AuthContext globally accessible to this interceptor if designed that way.

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // You can also add other headers or modify the request config here.
    // e.g., config.headers['X-Custom-Header'] = 'SomeValue';

    return config;
  },
  (error) => {
    // Handle request errors here (e.g., network issues before sending)
    console.error('Axios Request Error:', error);
    return Promise.reject(error);
  }
);

// =========================================================================
// 4. Response Interceptors (Incoming Responses)
// =========================================================================
api.interceptors.response.use(
  (response) => {
    // This function runs for successful responses (status 2xx).
    // You can transform response data here if needed.
    return response;
  },
  (error) => {
    // This function runs for response errors (status outside 2xx).
    // It's ideal for global error handling, like authentication failures.

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Axios Response Error Status:', error.response.status);
      console.error('Axios Response Error Data:', error.response.data);
      console.error('Axios Response Error Headers:', error.response.headers);

      switch (error.response.status) {
        case 401:
          // Unauthorized: Token invalid or expired, or not provided.
          // You should typically clear the invalid token and redirect to login.
          console.log('Authentication required or token expired. Redirecting to login...');
          localStorage.removeItem('authToken'); // Clear invalid token
          // IMPORTANT: Redirecting here directly (e.g., window.location.href)
          // can cause issues with React Router. It's often better to dispatch
          // an action (if using state management) or use a history object
          // to trigger navigation in your main App component or AuthContext.
          // For now, we'll log it.
          // Example for React Router v6: navigate('/login');
          break;
        case 403:
          // Forbidden: User authenticated but doesn't have permissions.
          console.log('Access forbidden. You do not have permission for this resource.');
          // Maybe show a specific error message or redirect to an access denied page.
          break;
        case 404:
          // Not Found: API endpoint doesn't exist.
          console.error('API endpoint not found:', error.config.url);
          break;
        case 500:
          // Server Error: Generic server-side issue.
          console.error('Server error. Please try again later.');
          break;
        default:
          // Handle other HTTP errors
          console.error(`Unhandled HTTP error: ${error.response.status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Axios No Response Error: The request was made but no response was received.', error.request);
      console.error('Possible network issue or CORS problem.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Axios Request Setup Error:', error.message);
    }

    return Promise.reject(error); // Re-throw the error so downstream code can also catch it
  }
);

export default api;
