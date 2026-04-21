import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DotsThree, House } from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';
import { OWNER_PRIMARY, OWNER_MORE, EMPLOYEE_PRIMARY, EMPLOYEE_MORE } from './navigation';

const BottomNav = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const drawerRef = useRef(null);
  const isOwner = user?.role === 'owner';

  const primaryItems = isOwner ? OWNER_PRIMARY : EMPLOYEE_PRIMARY;
  const moreItems    = isOwner ? OWNER_MORE    : EMPLOYEE_MORE;

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  return (
    <>
      {/* More Items Drawer */}
      {moreOpen && (
        <>
          <div
            onClick={() => setMoreOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.25)' }}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            className="bottom-drawer"
            style={{
              position: 'fixed',
              bottom: `calc(61px + env(safe-area-inset-bottom))`,
              left: 0, right: 0,
              background: 'white',
              borderRadius: '20px 20px 0 0',
              borderTop: '1px solid var(--border)',
              padding: '8px 12px 12px',
              zIndex: 99,
              boxShadow: '0 -6px 32px rgba(0,0,0,0.12)',
              animation: 'sheetUp 0.22s cubic-bezier(0.32,0.72,0,1) both',
            }}
          >
            <div style={{ width: 32, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 12px' }} />
            {moreItems.map(({ to, icon: Icon, key }) => (
              <NavLink
                key={to} to={to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ borderRadius: 'var(--radius-md)', marginBottom: 2 }}
              >
                <Icon size={20} weight="duotone" />
                {t(key)}
              </NavLink>
            ))}
          </div>
        </>
      )}

      {/* Main Bar */}
      <nav className="bottom-nav">
        {primaryItems.map(({ to, icon: Icon, key }) => (
          <NavLink 
            key={to} to={to} end={to === '/'} 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} weight="duotone" />
            <span>{t(key)}</span>
          </NavLink>
        ))}
        <button 
          className={`bottom-nav-item ${moreOpen ? 'active' : ''}`} 
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
        >
          <DotsThree size={24} weight="duotone" />
          <span>{t('more')}</span>
        </button>
      </nav>
    </>
  );
};

export default BottomNav;
