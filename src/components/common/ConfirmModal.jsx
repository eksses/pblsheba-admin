import React from 'react';
import { createPortal } from 'react-dom';
import { Warning, ShieldCheck } from '@phosphor-icons/react';
import { haptic } from '../../utils/haptic';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!open) return null;

  return createPortal(
    <div className="m-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="m-dialog" style={{ padding: '0 0 env(safe-area-inset-bottom)', height: 'auto' }}>
        <div className="m-handle" />
        <div style={{ padding: '24px 24px 12px', textAlign: 'center' }}>
          <div style={{ 
            width: 64, height: 64, borderRadius: '20px', 
            background: type === 'danger' ? 'var(--red-50)' : 'var(--blue-50)', 
            color: type === 'danger' ? 'var(--red-600)' : 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            transform: 'rotate(-5deg)'
          }}>
            {type === 'danger' ? <Warning size={36} weight="duotone" /> : <ShieldCheck size={36} weight="duotone" />}
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-heading)', marginBottom: 12 }}>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5, padding: '0 10px' }}>{message}</p>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button 
            className={`btn btn-${type === 'danger' ? 'danger' : 'primary'}`} 
            style={{ width: '100%', height: 54, fontSize: '1rem', fontWeight: 800 }} 
            onClick={() => {
              haptic('medium');
              onConfirm();
            }}
          >
            {type === 'danger' ? 'Delete Permanently' : 'Confirm Action'}
          </button>
          <button 
            className="btn btn-ghost" 
            style={{ width: '100%', height: 50, fontSize: '0.95rem', fontWeight: 700 }} 
            onClick={() => {
              haptic('light');
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
