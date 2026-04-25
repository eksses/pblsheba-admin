import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  IdentificationCard, 
  WarningCircle, 
  Money,
  BellRinging
} from '@phosphor-icons/react';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { subscribeAdminToPush } from '../utils/push';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { dashboardCache, setDashboardCache } = useAuthStore();
  const [metrics, setMetrics] = useState(
    dashboardCache || { totalMembers: 0, totalEmployees: 0, pendingApprovals: 0, totalCollected: 0 }
  );
  const [pushStatus, setPushStatus] = useState('idle');

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      subscribeAdminToPush().then(() => setPushStatus('subscribed'));
    }
  }, []);
  
  useEffect(() => { 
    axiosClient.get('/admin/dashboard')
      .then(r => {
        setMetrics(r.data);
        setDashboardCache(r.data);
      })
      .catch(() => {}); 
  }, [setDashboardCache]);

  const handleEnableNotifications = async () => {
    setPushStatus('requesting');
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeAdminToPush();
        setPushStatus('subscribed');
      } else {
        setPushStatus('denied');
      }
    } catch (err) {
      console.error('Notification setup failed:', err);
      setPushStatus('error');
    }
  };

  const showNotifBanner = 'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied';

  const cards = [
    { key: 'total_members',    value: metrics.totalMembers,     icon: Users,              cls: 'green'  },
    { key: 'total_employees',  value: metrics.totalEmployees,   icon: IdentificationCard, cls: 'blue'   },
    { key: 'pending_approvals',value: metrics.pendingApprovals, icon: WarningCircle,      cls: 'amber'  },
    { key: 'est_funds',        value: metrics.totalCollected,   icon: Money,              cls: 'purple' },
  ];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('dashboard')}</h1>
          <p className="text-muted">{t('platform_overview')}</p>
        </div>
      </div>

      {showNotifBanner && (
        <button
          onClick={handleEnableNotifications}
          disabled={pushStatus === 'requesting'}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '14px 18px', marginBottom: 20,
            background: '#1a2e1a', border: '1px solid #2e7d32', borderRadius: 10,
            color: '#a5d6a7', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
          }}
        >
          <BellRinging size={20} weight="fill" />
          {pushStatus === 'requesting' ? 'Enabling...' : 'Enable Push Notifications'}
        </button>
      )}

      <div className="metrics-grid">
        {cards.map(({ key, value, icon: Icon, cls }) => (
          <div className="metric-card" key={key}>
            <div className={`metric-card-icon ${cls}`}>
              <Icon size={20} weight="duotone" />
            </div>
            <div className="metric-label">{t(key)}</div>
            <div className="metric-value">{value}</div>
          </div>
        ))}
      </div>
      
      {/* Additional dashboard content could go here */}
    </div>
  );
};

export default DashboardPage;
