import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pbl_debug_active';

export const useDebugMode = () => {
  const [isDebug, setIsDebug] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get('debug');

    if (debugParam === 'true') {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsDebug(true);
    } else if (debugParam === 'false') {
      localStorage.setItem(STORAGE_KEY, 'false');
      setIsDebug(false);
    }
  }, []);

  // Also check VITE_SHOW_DEBUG env var
  const effectiveDebug = isDebug || import.meta.env.VITE_SHOW_DEBUG === 'true';

  return effectiveDebug;
};
