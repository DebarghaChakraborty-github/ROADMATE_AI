import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot from react-dom/client
import App from './App'; // Import your main App component
import './index.css'; // Assuming you have a global CSS file for basic styles or Tailwind directives

/**
 * @file src/index.js
 * @description The entry point of the RideIndia React application.
 * This file is responsible for rendering the root `App` component into the DOM.
 * It uses React 18's `createRoot` API for improved performance and concurrent rendering.
 */

// Find the root DOM element where your React app will be mounted.
// This typically corresponds to <div id="root"></div> in your public/index.html.
const rootElement = document.getElementById('root');

// Create a React root and render the App component.
// React.StrictMode is a tool for highlighting potential problems in an application.
// It activates additional checks and warnings for its descendants during development mode.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// You can also add code here for performance measurement if needed, e.g.:
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();
