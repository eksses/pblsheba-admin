import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'

// Global Logger for iOS Debugging
if (typeof window !== 'undefined') {
  const DB_NAME = 'push_debug_db';
  const LOG_STORE = 'console_logs';

  const logToDB = (type, args) => {
    try {
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LOG_STORE)) {
          db.createObjectStore(LOG_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(LOG_STORE)) return;
        const tx = db.transaction(LOG_STORE, 'readwrite');
        tx.objectStore(LOG_STORE).add({ timestamp: Date.now(), type, msg });
      };
    } catch (e) {}
  };

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => { originalLog(...args); logToDB('log', args); };
  console.error = (...args) => { originalError(...args); logToDB('error', args); };
  console.warn = (...args) => { originalWarn(...args); logToDB('warn', args); };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for Push Notifications
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      if (reg) {
        console.log('Service Worker registered successfully:', reg.scope);
        // On some iOS versions, .ready can hang or fail
        const readyReg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('SW Ready Timeout')), 5000))
        ]).catch(() => null);
        
        if (readyReg) {
          window.dispatchEvent(new CustomEvent('sw-ready'));
        }
      }
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  });
}
