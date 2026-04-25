import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      console.log('Service Worker registered successfully:', reg.scope);
      await navigator.serviceWorker.ready;
      window.dispatchEvent(new CustomEvent('sw-ready'));
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  });
}
