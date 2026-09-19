import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash, Check, X } from '@phosphor-icons/react';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../context/ToastContext';
import { useFastData } from '../hooks/useFastData';
import Spinner from '../components/ui/Spinner';

const defaultPaymentMethods = [
  { 
    name: 'bKash', 
    number: '01322511554', 
    instructions: 'Send money to this bKash personal number (01322511554) and enter the TrxID below.', 
    isActive: true, 
    themeColor: '#E2136E', 
    logoUrl: '' 
  },
  { 
    name: 'Nagad', 
    number: '01700000000', 
    instructions: 'Send money to this Nagad personal number and enter the TrxID below.', 
    isActive: true, 
    themeColor: '#F7931E', 
    logoUrl: '' 
  }
];

const defaultSettings = { 
  registrationFee: 365, 
  employeeCanViewAll: false, 
  jobApplicationsEnabled: true,
  paymentMethods: defaultPaymentMethods 
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const toast = useToast();

  const { data: serverSettings, loading, mutate } = useFastData('/admin/settings', defaultSettings);
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);

  // Sync state when data is loaded from cache/server
  useEffect(() => {
    if (serverSettings) {
      setSettings(prev => ({
        ...prev,
        ...serverSettings,
        paymentMethods: serverSettings.paymentMethods?.length > 0 
          ? serverSettings.paymentMethods 
          : defaultPaymentMethods
      }));
    }
  }, [serverSettings]);

  const handleSave = async () => { 
    setSaving(true);
    // Optimistic update in SWR cache
    mutate(settings);
    try { 
      const { data: updated } = await axiosClient.patch('/admin/settings', settings); 
      setSettings(updated);
      mutate(updated);
      toast.success(t('success_settings_save') || 'Settings saved successfully!');
    } catch (err) { 
      toast.error(err.response?.data?.message || t('error_settings_save') || 'Failed to save settings');
    } finally { 
      setSaving(false); 
    }
  };

  const updatePM = (i, k, v) => { 
    const pms = [...settings.paymentMethods]; 
    pms[i] = { ...pms[i], [k]: v }; 
    setSettings(s => ({ ...s, paymentMethods: pms })); 
  };

  const togglePM = (i) => {
    const pms = [...settings.paymentMethods];
    pms[i] = { ...pms[i], isActive: !pms[i].isActive };
    setSettings(s => ({ ...s, paymentMethods: pms }));
  };

  const addPaymentMethod = () => {
    const newMethod = {
      name: 'New Gateway',
      number: '',
      instructions: 'Enter transaction instructions for members.',
      isActive: true,
      themeColor: '#10B981',
      logoUrl: ''
    };
    setSettings(s => ({ ...s, paymentMethods: [...s.paymentMethods, newMethod] }));
  };

  const removePaymentMethod = (index) => {
    if (settings.paymentMethods.length <= 1) {
      toast.error('You must keep at least one payment method.');
      return;
    }
    const pms = settings.paymentMethods.filter((_, i) => i !== index);
    setSettings(s => ({ ...s, paymentMethods: pms }));
  };

  if (user?.role !== 'owner') {
    return (
      <div className="fade-up">
        <div className="page-header">
          <h1>{t('settings_title') || 'Settings'}</h1>
        </div>
        <div className="alert-danger" style={{ fontWeight: 700 }}>
          {t('owner_only_access') || 'Owner-only access'}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('settings_title') || 'Settings'}</h1>
          <p className="text-muted">{t('settings_desc') || 'Manage platform configuration, payment gateways, and policies.'}</p>
        </div>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleSave} 
          disabled={saving}
          style={{ minWidth: 100 }}
        >
          {saving ? <Spinner size={16} /> : (t('save_all') || 'Save Changes')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* General Settings */}
        <div className="data-card">
          <h3 style={{ color: 'var(--text-heading)', marginBottom: 4 }}>{t('general') || 'General Configuration'}</h3>
          <p className="text-muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
            {t('platform_policies') || 'Platform rules and membership fees.'}
          </p>
          
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">{t('reg_fee') || 'Registration Fee (BDT / TK)'}</label>
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
                checked={Boolean(settings.employeeCanViewAll)} 
                onChange={e => setSettings({ ...settings, employeeCanViewAll: e.target.checked })} 
              />
              <span style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.95rem' }}>
                {t('employee_view_all') || 'Allow Staff to View All Member Records'}
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="form-checkbox"
                checked={Boolean(settings.jobApplicationsEnabled)} 
                onChange={e => setSettings({ ...settings, jobApplicationsEnabled: e.target.checked })} 
              />
              <span style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.95rem' }}>
                Enable Job Applications (ক্যারিয়ার সেকশন চালু রাখুন)
              </span>
            </label>
          </div>
        </div>

        {/* Payment Methods Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-heading)' }}>Payment Gateways (bKash / Nagad)</h2>
            <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              Edit receiving numbers and payment instructions shown to members.
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            onClick={addPaymentMethod}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} weight="bold" /> Add Method
          </button>
        </div>

        {/* Payment Methods List */}
        {settings.paymentMethods?.map((pm, i) => (
          <div 
            className="data-card" 
            key={i} 
            style={{ 
              borderLeft: `5px solid ${pm.isActive ? (pm.themeColor || 'var(--primary)') : 'var(--grey-400)'}`, 
              opacity: pm.isActive ? 1 : 0.75,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input 
                  type="text" 
                  value={pm.name} 
                  onChange={e => updatePM(i, 'name', e.target.value)}
                  className="form-input"
                  style={{ 
                    fontWeight: 700, 
                    fontSize: '1.1rem', 
                    width: 160, 
                    color: pm.themeColor || 'var(--primary)',
                    padding: '4px 8px'
                  }}
                  placeholder="Gateway Name"
                />
                <input 
                  type="color" 
                  value={pm.themeColor || '#E2136E'} 
                  onChange={e => updatePM(i, 'themeColor', e.target.value)}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                  title="Theme Color"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button 
                  type="button"
                  className={`btn btn-sm ${pm.isActive ? 'btn-outline' : 'btn-primary'}`} 
                  onClick={() => togglePM(i)}
                  style={{ minWidth: 80 }}
                >
                  {pm.isActive ? (t('disable') || 'Disable') : (t('enable') || 'Enable')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => removePaymentMethod(i)}
                  title="Delete payment method"
                  style={{ color: 'var(--danger)', padding: '6px 8px' }}
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {pm.name} {t('account_number') || 'Account / Mobile Number'}
              </label>
              <input 
                className="form-input" 
                value={pm.number || ''} 
                onChange={e => updatePM(i, 'number', e.target.value)} 
                placeholder="e.g. 01322511554"
                style={{ fontSize: '1rem', fontWeight: 600 }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                {t('instructions') || 'Payment Instructions for Members'}
              </label>
              <textarea 
                className="form-input" 
                rows={2} 
                value={pm.instructions || ''} 
                onChange={e => updatePM(i, 'instructions', e.target.value)} 
                placeholder="Send money to this personal number and enter the TrxID..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
