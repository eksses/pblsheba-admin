import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Warning, ShieldCheck } from '@phosphor-icons/react';
import './Toast.css';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, removing: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 200);
  }, []);

  const add = useCallback((type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => remove(id), type === 'error' ? 6000 : 3500);
  }, [remove]);

  const value = useMemo(() => ({
    success: (m) => add('success', m),
    error: (m) => add('error', m),
    info: (m) => add('info', m)
  }), [add]);

  // For legacy window hook if needed
  window.__pbl_toast = value;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-container" aria-live="polite">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`toast toast-${t.type} ${t.removing ? 'removing' : ''}`} 
              onClick={() => remove(t.id)}
            >
              <div className="toast-icon">
                {t.type === 'success' && <CheckCircle weight="bold" />}
                {t.type === 'error' && <Warning weight="bold" />}
                {t.type === 'info' && <ShieldCheck weight="bold" />}
              </div>
              <div className="toast-content">{t.message}</div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
