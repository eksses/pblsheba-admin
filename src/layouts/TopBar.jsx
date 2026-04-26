import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SignOut } from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';
import LangToggle from '../components/layout/LangToggle';
import { haptic } from '../utils/haptic';

const TopBar = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="top-bar">
      <div 
        className="top-bar-brand" 
        onClick={() => {
          haptic('light');
          navigate('/');
        }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      >
        <img src="/logo.png" alt="Logo" style={{ width: 26, height: 26, borderRadius: 6 }} />
        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t('brand_name')}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <LangToggle />
        <button 
          className="btn btn-ghost btn-sm btn-icon" 
          onClick={() => {
            haptic('medium');
            logout();
          }} 
          title={t('sign_out')}
          aria-label="Sign out"
        >
          <SignOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
