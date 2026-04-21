import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/useAuthStore';
import axiosClient from '../../api/axiosClient';
import LangToggle from '../../components/layout/LangToggle';

const Login = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', { phone, password });
      if (data.role !== 'owner' && data.role !== 'employee') {
        setErr(t('access_denied'));
        return;
      }
      login(data, data.token);
    } catch (error) {
      setErr(error.response?.data?.message || t('error_login_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
        <LangToggle />
      </div>
      <div className="login-hero">
        <div className="login-icon-wrap">
          <Leaf size={28} color="white" weight="fill" />
        </div>
        <h1>{t('brand_name')}</h1>
        <p>{t('admin_subtitle')}</p>
      </div>
      <div className="login-body">
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{t('sign_in')}</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>{t('use_credentials')}</p>
        </div>
        {err && (
          <div style={{ 
            padding: '12px 16px', 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: 'var(--radius-md)', 
            color: 'var(--danger)', 
            fontWeight: 600, 
            fontSize: '0.9rem' 
          }}>
            {err}
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">{t('phone_id')}</label>
            <input 
              className="form-input" 
              type="tel" 
              placeholder="017-XXXXXXXX" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required 
              autoFocus 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? t('signing_in') : t('sign_in')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
