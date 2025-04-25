import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("Step -1: Loading main.jsx...");

try {
  console.log("Step 0: Starting React app rendering...");
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Root element not found!");
  } else {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
} catch (error) {
  console.error("Failed to render React app:", error);
}

// Регистрация сервис-воркера
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log("Registering service worker...");
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}