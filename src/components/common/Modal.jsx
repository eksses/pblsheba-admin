import React from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

/**
 * Modular Modal component with side-panel layout.
 */
const Modal = ({ open, onClose, title, panelIcon, panelTitle, panelDesc, children, footer }) => {
  if (!open) return null;

  return createPortal(
    <div className="m-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="m-dialog">
        {/* Left Side Panel */}
        <div className="m-panel">
          {panelIcon && <div className="m-panel-icon">{panelIcon}</div>}
          {panelTitle && <h3>{panelTitle}</h3>}
          {panelDesc && <p>{panelDesc}</p>}
        </div>

        {/* Right Content Area */}
        <div className="m-right">
          <div className="m-handle" />
          <div className="m-header">
            <h2>{title}</h2>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close modal">
              <X size={20} weight="bold" />
            </button>
          </div>
          <div className="m-body">
            {children}
          </div>
          {footer && (
            <div className="m-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
