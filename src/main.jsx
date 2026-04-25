import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'

if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_LOGS !== 'true') {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
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
