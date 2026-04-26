import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  IdentificationCard, 
  WarningCircle, 
  Money,
  BellRinging,
  Export,
  Trash,
  Bug,
  X,
  Info
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
      
      const publicKey = 'BGJBhJEhNlojxGRksjriJrIgH7-BCs0q4D7_rthm5AKP3tJnjBpU46mIiqZ87UNQSvcpuIlGb51ouqHrgvAOMY0';
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      let subscription = existing;

      if (!existing) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      if (subscription) {
        await axiosClient.post('/notifications/subscribe', { subscription });
        setPushStatus('subscribed');
        // Refresh debug info
        fetchDebugInfo();
      }
    } catch (err) {
      if (!isSilent) {
        console.error('Notification setup failed:', err);
        setPushStatus('error');
      }
    }
  };

  const handleUnsubscribe = async () => {
    setPushStatus('requesting');
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await axiosClient.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      
      setPushStatus('idle');
      fetchDebugInfo();
    } catch (err) {
      console.error('Unsubscribe failed:', err);
      setPushStatus('error');
    }
  };

  const [clearAllLoading, setClearAllLoading] = useState(false);
  const handleClearAll = async () => {
    if (!window.confirm('This will delete ALL push subscriptions from the database. Continue?')) return;
    setClearAllLoading(true);
    try {
      await axiosClient.delete('/notifications/clear-all');
      alert('All subscriptions cleared');
      setPushStatus('idle');
      fetchDebugInfo();
    } catch (err) {
      console.error('Clear all failed:', err);
      alert('Failed to clear subscriptions');
    } finally {
      setClearAllLoading(false);
    }
  };

  const [debugInfo, setDebugInfo] = useState(null);
  const [pushLogs, setPushLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('push_debug_db', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!db.objectStoreNames.contains('notification_logs')) return;

      const tx = db.transaction('notification_logs', 'readonly');
      const store = tx.objectStore('notification_logs');
      const request = store.getAll();
      request.onsuccess = () => {
        setPushLogs(request.result.sort((a, b) => b.timestamp - a.timestamp));
      };
    } catch (err) {
      console.warn('Failed to fetch push logs:', err);
    }
  };

  const clearLogs = async () => {
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('push_debug_db', 1);
        request.onsuccess = () => resolve(request.result);
      });
      const tx = db.transaction('notification_logs', 'readwrite');
      tx.objectStore('notification_logs').clear();
      setPushLogs([]);
    } catch (err) {}
  };

  const fetchDebugInfo = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setDebugInfo({
        hasSW: 'serviceWorker' in navigator,
        swState: registration.active?.state || 'unknown',
        permission: Notification.permission,
        subscription: subscription ? {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime,
        } : null
      });
      
      if (subscription) setPushStatus('subscribed');
      fetchLogs();
    } catch (err) {
      console.error('Debug fetch failed:', err);
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
      fetchDebugInfo();
    } else {
      window.addEventListener('sw-ready', () => {
        initPush();
        fetchDebugInfo();
      });
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
      const endpoints = delivery.endpoints ? `\nEndpoints: ${delivery.endpoints.join(', ')}` : '';
      alert(`Server Response: Sent=${delivery.sent}, Failed=${delivery.failed}, Cleaned=${delivery.cleaned}${endpoints}`);
      
      setTimeout(() => setTestPushLoading(false), 1000);
    } catch (err) {
      console.error('Test push failed:', err);
      alert('Test push failed: ' + (err.response?.data?.message || err.message));
      setTestPushLoading(false);
    }
  };

  const handleLocalTest = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Local Test', {
        body: 'If you see this, browser-level notifications are working!',
        icon: '/logo.png',
        tag: 'local-test'
      });
    } catch (err) {
      alert('Local test failed: ' + err.message);
    }
  };

  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
  const showIOSPrompt = isIOS && !isStandalone;

  const hasNotif = typeof window !== 'undefined' && 'Notification' in window;
  const showNotifBanner = hasNotif && window.Notification?.permission !== 'granted' && window.Notification?.permission !== 'denied' && !showIOSPrompt;
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

      {showIOSPrompt && (
        <div style={{
          background: '#1a2b3c', border: '1px solid #2196f3', borderRadius: 10,
          padding: '16px', marginBottom: 20, color: '#90caf9'
        }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Export size={18} weight="bold" />
            {t('install_pwa_ios', 'Install for Notifications')}
          </p>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
            {t('ios_pwa_instruction', 'To receive notifications on iPhone: Tap the share button and select "Add to Home Screen".')}
          </p>
        </div>
      )}

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
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={handleTestPush}
            disabled={testPushLoading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px',
              background: 'rgba(124, 58, 237, 0.1)', 
              border: '1px solid #7c3aed', borderRadius: 10,
              color: '#a78bfa', cursor: testPushLoading ? 'not-allowed' : 'pointer', 
              fontSize: '0.85rem', fontWeight: 600
            }}
          >
            <BellRinging size={18} weight="fill" className={testPushLoading ? 'animate-pulse' : ''} />
            {testPushLoading ? 'Sending...' : 'Test Push'}
          </button>

          <button
            onClick={handleUnsubscribe}
            disabled={pushStatus === 'requesting'}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px',
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid #ef4444', borderRadius: 10,
              color: '#ef4444', cursor: 'pointer', 
              fontSize: '0.85rem', fontWeight: 600
            }}
          >
            <X size={18} weight="bold" />
            Unsubscribe
          </button>
        </div>
      )}

      {debugInfo && (
        <div className="data-card" style={{ marginBottom: 20, border: '1px dashed #444', background: '#0f172a' }}>
          <div className="data-card-header" style={{ color: 'var(--amber)' }}>
            <Bug size={14} weight="fill" /> Push Debug Info
          </div>
          <div style={{ padding: '0 18px 18px' }}>
            <div className="data-row">
              <span className="data-label">Permission</span>
              <span className="data-value" style={{ color: debugInfo.permission === 'granted' ? 'var(--green)' : 'var(--amber)' }}>
                {debugInfo.permission}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">SW Active</span>
              <span className="data-value">{debugInfo.swState}</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button 
                onClick={handleLocalTest}
                style={{
                  flex: 1, padding: '6px', borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6',
                  color: '#60a5fa', fontSize: '0.7rem', cursor: 'pointer'
                }}
              >
                Test Browser Permission
              </button>
              <button 
                onClick={fetchDebugInfo}
                style={{
                  padding: '6px 10px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid #444',
                  color: '#fff', fontSize: '0.7rem', cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
            {debugInfo.subscription ? (
              <>
                <div className="data-row">
                  <span className="data-label">Endpoint</span>
                  <span className="data-value" style={{ fontSize: '0.65rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {debugInfo.subscription.endpoint}
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <button 
                    onClick={handleClearAll}
                    disabled={clearAllLoading}
                    style={{
                      width: '100%', padding: '8px', borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444',
                      color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    <Trash size={14} weight="fill" style={{ marginRight: 6 }} />
                    {clearAllLoading ? 'Clearing...' : 'Clear All DB Subscriptions'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 10, textAlign: 'center' }}>
                Not Subscribed to Push Manager
              </div>
            )}

            <div style={{ marginTop: 20, borderTop: '1px solid #334155', pt: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 10 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Local Device Logs
                </span>
                <button onClick={fetchLogs} className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', height: 'auto' }}>
                  Refresh
                </button>
              </div>
              
              {pushLogs.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.7rem' }}>
                  {pushLogs.map((log) => (
                    <div key={log.timestamp} style={{ padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)' }}>
                        <span style={{ fontWeight: 700 }}>{log.title}</span>
                        <span style={{ color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ color: '#cbd5e1', marginTop: 2 }}>{log.body}</div>
                      {log.raw && (
                        <div style={{ color: '#64748b', fontSize: '0.6rem', marginTop: 4, fontStyle: 'italic', wordBreak: 'break-all' }}>
                          Raw: {log.raw}
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={clearLogs} style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.65rem', cursor: 'pointer', marginTop: 10 }}>
                    Clear Logs
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.7rem', padding: '10px 0' }}>
                  No notifications logged on this device yet.
                </div>
              )}
            </div>
          </div>
        </div>
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
