import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import './i18n';
import './index.css';

/**
 * App Component
 * 
 * The entry point of the pblsheba-admin portal. 
 * Managed with a Mega Modular architecture for extreme maintainability.
 */
function App() {
  return (
    <Router>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </Router>
  );
}

export default App;
