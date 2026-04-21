import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const toast = useToast();

  const [settings, setSettings] = useState({ 
    registrationFee: 365, 
    employeeCanViewAll: false, 
    jobApplicationsEnabled: true,
    paymentMethods: [] 
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/admin/settings')
      .then(r => setSettings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => { 
    setSaving(true);
    try { 
      await axiosClient.patch('/admin/settings', settings); 
      toast.success(t('success_settings_save'));
    } catch { 
      toast.error(t('error_settings_save'));
    } finally { 
      setSaving(false); 
    }
  };

  const updatePM = (i, k, v) => { 
    const pms = [...settings.paymentMethods]; 
    pms[i][k] = v; 
    setSettings({ ...settings, paymentMethods: pms }); 
  };

  const togglePM = (i) => {
    const pms = [...settings.paymentMethods];
    pms[i].isActive = !pms[i].isActive;
    setSettings({ ...settings, paymentMethods: pms });
  };

  if (user.role !== 'owner') {
    return (
      <div className="fade-up">
        <div className="page-header">
          <h1>{t('settings_title')}</h1>
        </div>
        <div className="alert-danger" style={{ fontWeight: 700 }}>
          {t('owner_only_access')}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('settings_title')}</h1>
          <p className="text-muted">{t('settings_desc') || 'Manage platform configuration and policies.'}</p>
        </div>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? <Spinner size={16} /> : t('save_all')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* General Settings */}
        <div className="data-card">
          <h3 style={{ color: 'var(--text-heading)', marginBottom: 4 }}>{t('general')}</h3>
          <p className="text-muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
            {t('platform_policies')}
          </p>
          
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">{t('reg_fee')}</label>
            <input 
              className="form-input" 
              type="number" 
              value={settings.registrationFee} 
              onChange={e => setSettings({ ...settings, registrationFee: +e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="form-checkbox"
                checked={settings.employeeCanViewAll} 
                onChange={e => setSettings({ ...settings, employeeCanViewAll: e.target.checked })} 
              />
              <span style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.95rem' }}>
                {t('employee_view_all')}
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="form-checkbox"
                checked={settings.jobApplicationsEnabled} 
                onChange={e => setSettings({ ...settings, jobApplicationsEnabled: e.target.checked })} 
              />
              <span style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.95rem' }}>
                Enable Job Applications (ক্যারিয়ার সেকশন চালু করুন)
              </span>
            </label>
          </div>
        </div>

        {/* Payment Methods */}
        {loading && settings.paymentMethods.length === 0 ? (
          <div className="shimmer" style={{ height: 150, borderRadius: 16 }} />
        ) : (
          settings.paymentMethods?.map((pm, i) => (
            <div 
              className="data-card" 
              key={i} 
              style={{ 
                borderLeft: `4px solid ${pm.isActive ? (pm.themeColor || 'var(--primary)') : 'var(--border)'}`, 
                opacity: pm.isActive ? 1 : 0.65 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: pm.themeColor || 'var(--primary)', margin: 0 }}>{pm.name}</h3>
                <button 
                  className={`btn btn-sm ${pm.isActive ? 'btn-outline' : 'btn-primary'}`} 
                  onClick={() => togglePM(i)}
                >
                  {pm.isActive ? t('disable') : t('enable')}
                </button>
              </div>
              
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">{t('account_number')}</label>
                <input 
                  className="form-input" 
                  value={pm.number || ''} 
                  onChange={e => updatePM(i, 'number', e.target.value)} 
                  disabled={!pm.isActive} 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('instructions')}</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  value={pm.instructions || ''} 
                  onChange={e => updatePM(i, 'instructions', e.target.value)} 
                  disabled={!pm.isActive} 
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
