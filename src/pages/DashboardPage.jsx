import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import HealthStats from '../features/system/HealthStats';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dashboardCache, setDashboardCache } = useAuthStore();
  const [metrics, setMetrics] = useState(
    dashboardCache || { totalMembers: 0, totalEmployees: 0, pendingApprovals: 0, totalCollected: 0 }
  );
  const [pushStatus, setPushStatus] = useState('idle');

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    let rawData;
    try {
      rawData = window.atob(base64);
    } catch (e) {
      console.error('atob failed:', e);
      return new Uint8Array(0);
    }
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnableNotifications = async (isSilent = false) => {
    if (!isSilent) setPushStatus('requesting');
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const publicKey = 'BGJBhJEhNlojxGRksjriJrIgH7-BCs0q4D7_rthm5AKP3tJnjBpU46mIiqZ87UNQSvcpuIlGb51ouqHrgvAOMY0';
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      if (subscription) {
        await axiosClient.post('/notifications/subscribe', { subscription });
        setPushStatus('subscribed');
      }
    } catch (err) {
      if (!isSilent) {
        console.error('Notification setup failed:', err);
        setPushStatus('error');
      }
    }
  };

  useEffect(() => {
    const initPush = () => {
      const hasNotif = typeof window !== 'undefined' && 'Notification' in window;
      if (hasNotif && window.Notification?.permission === 'granted') {
        handleEnableNotifications(true);
      }
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      initPush();
    } else {
      window.addEventListener('sw-ready', initPush);
    }
    return () => window.removeEventListener('sw-ready', initPush);
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

  const hasNotif = typeof window !== 'undefined' && 'Notification' in window;
  const showNotifBanner = hasNotif && window.Notification?.permission !== 'granted' && window.Notification?.permission !== 'denied';
  const isNotifGranted = hasNotif && window.Notification?.permission === 'granted';

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
      
      {isNotifGranted && (
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
      
      {metrics.staffPerformance?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('staff_performance')}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leaderboard')}>{t('view_all')}</button>
          </div>
          <div className="card-list">
            {(Array.isArray(metrics.staffPerformance) ? metrics.staffPerformance : []).slice(0, 3).map((item, index) => (
              <div className="data-card" key={item.id} style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div className="data-card-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem', flexShrink: 0 }}>{item.name[0]}</div>
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div className="data-card-name" style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.registrations} {t('total_registrations')}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{item.totalActivity}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('activity')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics && <HealthStats />}
    </div>
  );
};

export default DashboardPage;
