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
import { useSubscribe } from 'react-pwa-push-notifications';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { dashboardCache, setDashboardCache } = useAuthStore();
  const [metrics, setMetrics] = useState(
    dashboardCache || { totalMembers: 0, totalEmployees: 0, pendingApprovals: 0, totalCollected: 0 }
  );
  const [pushStatus, setPushStatus] = useState('idle');

  const { getSubscription } = useSubscribe({ 
    publicKey: 'BGJBhJEhNlojxGRksjriJrIgH7-BCs0q4D7_rthm5AKP3tJnjBpU46mIiqZ87UNQSvcpuIlGb51ouqHrgvAOMY0' 
  });

  const handleEnableNotifications = async (isSilent = false) => {
    if (!isSilent) setPushStatus('requesting');
    try {
      const subscription = await getSubscription();
      if (subscription) {
        await axiosClient.post('/notifications/subscribe', { subscription });
        setPushStatus('subscribed');
      } else if (!isSilent) {
        setPushStatus('error');
      }
    } catch (err) {
      if (!isSilent) {
        console.error('Notification setup failed:', err);
        setPushStatus('error');
      }
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      handleEnableNotifications(true);
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

  const [testPushLoading, setTestPushLoading] = useState(false);

  const handleTestPush = async () => {
    if (testPushLoading) return;
    setTestPushLoading(true);
    try {
      const response = await axiosClient.post('/notifications/test-push', {
        title: 'Admin Test',
        body: 'Testing notifications from the Admin Dashboard.'
      });
      
      const { delivery } = response.data;
      alert(`Server Response: Sent=${delivery.sent}, Failed=${delivery.failed}, Cleaned=${delivery.cleaned}`);
      
      setTimeout(() => setTestPushLoading(false), 1000);
    } catch (err) {
      console.error('Test push failed:', err);
      alert('Test push failed: ' + (err.response?.data?.message || err.message));
      setTestPushLoading(false);
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
      
      {Notification.permission === 'granted' && (
        <button
          onClick={handleTestPush}
          disabled={testPushLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '12px 18px', marginBottom: 20,
            background: testPushLoading ? 'rgba(124, 58, 237, 0.05)' : 'rgba(124, 58, 237, 0.1)', 
            border: '1px solid #7c3aed', borderRadius: 10,
            color: '#a78bfa', cursor: testPushLoading ? 'not-allowed' : 'pointer', 
            fontSize: '0.85rem', fontWeight: 600,
            opacity: testPushLoading ? 0.6 : 1
          }}
        >
          <BellRinging size={18} weight="fill" className={testPushLoading ? 'animate-pulse' : ''} />
          {testPushLoading ? 'Sending Test Notification...' : 'Send Test Push Notification'}
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
