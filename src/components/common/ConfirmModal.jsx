import React from 'react';
import { createPortal } from 'react-dom';
import { Warning, ShieldCheck } from '@phosphor-icons/react';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!open) return null;

  return createPortal(
    <div className="confirm-modal-backdrop">
      <div className="confirm-modal-content fade-up">
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: '50%', 
            background: type === 'danger' ? 'var(--red-50)' : 'var(--blue-50)', 
            color: type === 'danger' ? 'var(--red-600)' : 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
          }}>
            {type === 'danger' ? <Warning size={32} weight="duotone" /> : <ShieldCheck size={32} weight="duotone" />}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, height: 56, fontWeight: 700 }} onClick={onCancel}>Cancel</button>
          <button className={`btn btn-${type === 'danger' ? 'danger' : 'primary'}`} style={{ flex: 1, borderRadius: 0, height: 56, fontWeight: 700 }} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
