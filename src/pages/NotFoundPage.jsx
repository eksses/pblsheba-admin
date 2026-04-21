import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Warning, House } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="fade-up" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        background: 'var(--amber-50)', 
        color: 'var(--amber-500)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 24 
      }}>
        <Warning size={48} weight="duotone" />
      </div>
      
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 8, color: 'var(--text-heading)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 16, color: 'var(--text-main)' }}>
        {t('page_not_found') || 'Page Not Found'}
      </h2>
      <p style={{ maxWidth: 400, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
        {t('404_desc') || "The page you're looking for doesn't exist or has been moved to a different location."}
      </p>
      
      <button 
        className="btn btn-primary" 
        onClick={() => navigate('/')}
        style={{ padding: '12px 24px', fontSize: '1rem' }}
      >
        <House size={20} weight="bold" />
        <span style={{ marginLeft: 8 }}>{t('back_home') || 'Back to Home'}</span>
      </button>
    </div>
  );
};

export default NotFoundPage;
