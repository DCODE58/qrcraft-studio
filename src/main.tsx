import { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mobile-first error handling
const showError = (error: Error) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: system-ui, sans-serif;">
        <div style="text-align: center; max-width: 400px;">
          <h2 style="color: #ef4444; margin-bottom: 16px;">App Loading Error</h2>
          <p style="color: #6b7280; margin-bottom: 20px;">Please refresh the page or try again.</p>
          <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
};

// Enhanced service worker registration with error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered successfully');
      })
      .catch((error) => {
        console.warn('SW registration failed, continuing without offline support');
      });
  });
}

// Mobile loading optimization
const initApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Show loading state immediately
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: hsl(220 18% 99%);">
        <div style="text-align: center;">
          <div style="width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top: 3px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
          <p style="color: #6b7280; font-family: system-ui, sans-serif;">Loading QR Studio...</p>
        </div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;

    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError(error as Error);
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
