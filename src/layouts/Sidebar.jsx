import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SignOut } from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';
import LangToggle from '../components/layout/LangToggle';
import { OWNER_NAVIGATION, EMPLOYEE_NAVIGATION } from './navigation';

const Sidebar = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();

  const sections = user?.role === 'owner' ? OWNER_NAVIGATION : EMPLOYEE_NAVIGATION;

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
        {sections.map((section) => (
          <div key={section.category} className="nav-section">
            <h3 className="nav-category-title">{t(section.category)}</h3>
            <div className="nav-section-items">
              {section.items.map(({ to, icon: Icon, key }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} weight="duotone" />
                  <span>{t(key)}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="dev-info" style={{ padding: '0 0 10px 0', borderBottom: '1px solid #eee', marginBottom: 12, opacity: 0.6 }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', margin: 0 }}>System Developer</p>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333', margin: '2px 0' }}>Samir Bhuiyan</p>
          <p style={{ fontSize: '0.65rem', color: '#666', margin: 0 }}>shamirbhuiyan2@gmail.com</p>
        </div>
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
