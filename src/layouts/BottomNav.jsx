import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DotsThree, House } from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';
import { OWNER_NAVIGATION, EMPLOYEE_NAVIGATION, OWNER_PRIMARY, EMPLOYEE_PRIMARY } from './navigation';
import { haptic } from '../utils/haptic';

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
            className="m-backdrop"
            style={{ zIndex: 98 }}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            className="m-dialog"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0, right: 0,
              zIndex: 99,
              height: 'auto',
              maxHeight: '85dvh'
            }}
          >
            <div className="m-handle" />
            <div className="m-header">
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>{t('more_menu', 'Quick Access')}</h2>
              <button 
                className="btn btn-ghost btn-icon btn-sm" 
                onClick={() => {
                  haptic('light');
                  setMoreOpen(false);
                }}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="m-body" style={{ padding: '12px 16px 40px' }}>
              {OWNER_NAVIGATION.slice(1).map((section) => (
                <div key={section.category} style={{ marginBottom: 24 }}>
                  <h3 style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: 'var(--text-subtle)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    marginBottom: 10,
                    padding: '0 4px'
                  }}>
                    {t(section.category)}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {section.items.map(({ to, icon: Icon, key }) => (
                      <NavLink
                        key={to} to={to}
                        onClick={() => {
                          haptic('light');
                          setMoreOpen(false);
                        }}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={{ 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '16px 8px',
                          gap: 6,
                          background: 'var(--neutral-50)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <Icon size={24} weight="duotone" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{t(key)}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Bar */}
      <nav className="bottom-nav">
        {primaryItems.map(({ to, icon: Icon, key }) => (
          <NavLink 
            key={to} to={to} end={to === '/'} 
            onClick={() => haptic('light')}
            className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={24} weight="duotone" />
            <span>{t(key)}</span>
          </NavLink>
        ))}
        <button 
          className={`bnav-item ${moreOpen ? 'active' : ''}`} 
          onClick={() => {
            haptic('medium');
            setMoreOpen(!moreOpen);
          }}
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
