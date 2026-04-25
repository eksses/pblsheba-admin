import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Users, DeviceMobile, PaperPlaneTilt } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

const NotificationCenter = () => {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ count: 0, subscriptions: [] });
  const [form, setForm] = useState({ role: '', title: '', body: '', url: '/' });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await axiosClient.get('/notifications/all-subscriptions');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!form.role || !form.title) {
      toast.error('Role and Title are required');
      return;
    }
    
    setLoading(true);
    try {
      await axiosClient.post('/notifications/broadcast', form);
      toast.success('Broadcast sent successfully!');
      setForm({ ...form, title: '', body: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setLoading(true);
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('notification_center') || 'Notification Center'}</h1>
          <p className="text-muted">{stats.count} {t('active_subscriptions') || 'active devices'}</p>
        </div>
      </div>

      <div className="m-grid m-grid-2">
        {/* Broadcast Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Megaphone size={20} weight="duotone" /> {t('send_broadcast') || 'Send Broadcast'}
            </h3>
          </div>
          <form className="card-body" onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t('target_role') || 'Target Role'}</label>
              <select 
                className="form-input" 
                value={form.role} 
                onChange={e => setForm({...form, role: e.target.value})}
                required
              >
                <option value="">{t('select_role') || 'Select Role'}</option>
                <option value="all">{t('all_users') || 'All Users'}</option>
                <option value="member">{t('members') || 'Members'}</option>
                <option value="employee">{t('employees') || 'Employees'}</option>
                <option value="owner">{t('owners') || 'Owners'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('title') || 'Title'}</label>
              <input 
                className="form-input" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. System Update"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('message') || 'Message'}</label>
              <textarea 
                className="form-input" 
                rows={3}
                value={form.body} 
                onChange={e => setForm({...form, body: e.target.value})}
                placeholder="Type your message here..."
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', height: 44 }}>
              {loading ? <Spinner size={18} /> : <PaperPlaneTilt size={20} weight="bold" />}
              {t('send_now') || 'Send Now'}
            </button>
          </form>
        </div>

        {/* Subscription Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={20} weight="duotone" /> {t('active_devices') || 'Active Devices'}
            </h3>
          </div>
          <div className="card-body">
            <div className="stats-list">
              {stats.subscriptions.length === 0 ? (
                <div className="empty-state">
                  <DeviceMobile size={32} weight="duotone" />
                  <p>{t('no_subscriptions') || 'No active device subscriptions found'}</p>
                </div>
              ) : (
                stats.subscriptions.slice(0, 10).map(sub => (
                  <div key={sub.id} className="data-row" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <DeviceMobile size={18} color="var(--grey-400)" />
                      <div>
                        <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--grey-600)' }}>{sub.endpoint}</p>
                        <p className="text-muted" style={{ fontSize: '0.65rem' }}>{new Date(sub.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {stats.count > 10 && (
                <p className="text-muted" style={{ textAlign: 'center', marginTop: 12, fontSize: '0.8rem' }}>
                  Showing latest 10 of {stats.count} subscriptions
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
