import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SignOut } from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';
import LangToggle from '../components/layout/LangToggle';
import { ALL_SIDEBAR_NAV, EMPLOYEE_PRIMARY, EMPLOYEE_MORE } from './navigation';

const Sidebar = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  
  const navItems = user?.role === 'owner' 
    ? ALL_SIDEBAR_NAV 
    : [...EMPLOYEE_PRIMARY, ...EMPLOYEE_MORE];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <div className="sidebar-icon-wrap">
            <img src="/logo.png" alt="PBL Sheba" style={{ width: 24, height: 24, borderRadius: 4 }} />
          </div>
          <div>
            <h2>{t('brand_name')}</h2>
            <p>{t('brand_tagline')}</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, key }) => (
          <NavLink 
            key={to} 
            to={to} 
            end={to === '/'} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} weight="duotone" />
            {t(key)}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <LangToggle />
        <div style={{ height: 12 }} />
        <button className="btn btn-outline btn-full btn-sm" onClick={logout}>
          <SignOut size={16} /> {t('sign_out')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
