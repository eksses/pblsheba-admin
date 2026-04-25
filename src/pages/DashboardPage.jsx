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
import "@magicbell/react/styles/webpush-button.css";
import MagicBellProvider from "@magicbell/react/context-provider";
import WebPushButton from "@magicbell/react/webpush-button";

const DashboardPage = () => {
  const { t } = useTranslation();
  const { dashboardCache, setDashboardCache } = useAuthStore();
  const [metrics, setMetrics] = useState(
    dashboardCache || { totalMembers: 0, totalEmployees: 0, pendingApprovals: 0, totalCollected: 0 }
  );
  const magicBellToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2VtYWlsIjoic2hhbWlyYmh1aXlhbjJAZ21haWwuY29tIiwidXNlcl9leHRlcm5hbF9pZCI6bnVsbCwiYXBpX2tleSI6InBrX1RHNDFuM3I0OTF2ZDRGOUJPRzAxXzM2MzEwMjgyMDIiLCJpYXQiOjE3NzcxMDU0MDMsImV4cCI6MTc3NzE5MTgwM30.aX6fePvT8r1Pvzc-X3N3JVZruY0Bc8UlHjOx9N_Sqs8";

  useEffect(() => { 
    axiosClient.get('/admin/dashboard')
      .then(r => {
        setMetrics(r.data);
        setDashboardCache(r.data);
      })
      .catch(() => {}); 
  }, [setDashboardCache]);

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

      <MagicBellProvider token={magicBellToken}>
        <div style={{ marginBottom: 20 }}>
          <WebPushButton
            className="magicbell-button"
            renderLabel={({ status, error }) => (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 10, 
                width: '100%', padding: '14px 18px',
                background: status === "success" ? 'rgba(46, 125, 50, 0.1)' : 'rgba(124, 58, 237, 0.1)', 
                border: status === "success" ? '1px solid #2e7d32' : '1px solid #7c3aed', 
                borderRadius: 10,
                color: status === "success" ? '#a5d6a7' : '#a78bfa',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
              }}>
                <BellRinging size={20} weight="fill" />
                <span>
                  {error 
                    ? `Error: ${error}` 
                    : status === "success" 
                      ? "Push Notifications Active" 
                      : "Enable Push Notifications"}
                </span>
              </div>
            )}
          />
        </div>
      </MagicBellProvider>

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
