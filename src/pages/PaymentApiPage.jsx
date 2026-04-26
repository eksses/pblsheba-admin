import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import { Key, Copy, ArrowsClockwise, TerminalWindow, Check, Warning } from '@phosphor-icons/react';
import ConfirmModal from '../components/common/ConfirmModal';
import { haptic } from '../utils/haptic';

const PaymentApiPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axiosClient.get('/admin/settings');
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async () => {
    setShowRotateConfirm(false);
    setRotating(true);
    haptic('medium');
    try {
      const { data } = await axiosClient.post('/admin/settings/regenerate-sms-key');
      setSettings(prev => ({ ...prev, smsWebhookKey: data.key }));
      toast.success(t('success_rotate_key'));
    } catch (err) {
      console.error('Failed to rotate key:', err);
      toast.error(err.response?.data?.message || t('error_update'));
    } finally {
      setRotating(false);
    }
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t('copy_success') || 'Copied to clipboard!');
  };

  if (loading) return <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size={40} /></div>;

  const webhookUrl = `${window.location.protocol}//${window.location.hostname.replace('admin', 'server')}/api/public/sms-webhook`;
  const exampleJson = JSON.stringify({
    sender: "BKASH",
    body: "You have received Tk 365.00 from 01700000000. Ref: 12345. TrxID: ABC123DEF4. 26/04/24 21:19",
    apiKey: settings?.smsWebhookKey || "YOUR_API_KEY"
  }, null, 2);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('payment_api_title')}</h1>
          <p className="text-muted">{t('payment_api_desc')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* API Configuration Card */}
        <div className="data-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Key size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('api_key_management') || 'API Key Management'}</h2>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">{t('webhook_url')}</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="form-input" readOnly value={webhookUrl} style={{ background: 'var(--bg-secondary)' }} />
              <button className="btn btn-outline btn-sm" onClick={() => copyToClipboard(webhookUrl, setCopiedUrl)}>
                {copiedUrl ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 5 }}>{t('webhook_hint')}</p>
          </div>

          <div className="form-group">
            <label className="form-label">{t('api_key')}</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                className="form-input" 
                type={showKey ? 'text' : 'password'} 
                readOnly 
                value={settings?.smsWebhookKey || ''} 
                style={{ background: 'var(--bg-secondary)', letterSpacing: showKey ? 'normal' : '4px' }} 
              />
              <button className="btn btn-outline btn-sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? t('hide') : t('show')}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => copyToClipboard(settings?.smsWebhookKey, setCopiedKey)}>
                {copiedKey ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 5 }}>{t('api_key_hint')}</p>
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
              onClick={() => {
                haptic('heavy');
                setShowRotateConfirm(true);
              }}
              disabled={rotating}
            >
              {rotating ? <Spinner size={16} /> : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ArrowsClockwise size={18} /> {t('rotate_key')}</div>}
            </button>
          </div>
        </div>

        <ConfirmModal
          open={showRotateConfirm}
          title={t('regenerate_key_confirm')}
          message={t('regenerate_key_desc')}
          confirmText={t('confirm_regenerate')}
          onConfirm={handleRotateKey}
          onCancel={() => setShowRotateConfirm(false)}
        />

        {/* Integration Guide Card */}
        <div className="data-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TerminalWindow size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('how_to_use')}</h2>
          </div>

          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginBottom: 16 }}>
            {t('sms_example')}
          </p>

          <pre style={{ 
            background: '#1e293b', 
            color: '#f8fafc', 
            padding: 20, 
            borderRadius: 12, 
            overflowX: 'auto',
            fontSize: '0.85rem',
            lineHeight: 1.6
          }}>
            <code>{exampleJson}</code>
          </pre>

          <div style={{ marginTop: 20, padding: 15, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
              <strong>Pro Tip:</strong> Use an app like "SMS to URL" on Android to automatically forward incoming bKash/Nagad SMS to the Webhook URL above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentApiPage;
