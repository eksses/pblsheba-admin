import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import DebugPanel from './components/DebugPanel';
import ErrorBoundary from './components/common/ErrorBoundary';
import './i18n';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AppRoutes />
          <DebugPanel />
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
