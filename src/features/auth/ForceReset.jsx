import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/useAuthStore';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const ForceReset = () => {
  const { t } = useTranslation();
  const [pw, setPw] = useState('');
  const toast = useToast();
  const logout = useAuthStore(s => s.logout);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.patch('/users/change-password', { newPassword: pw });
      toast.success(t('success_password_reset'));
      logout();
    } catch (error) {
      toast.error(t('error_password_reset'));
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-icon-wrap">
          <ShieldCheck size={28} color="white" weight="fill" />
        </div>
        <h1>{t('security_check')}</h1>
        <p>{t('set_password_msg')}</p>
      </div>
      <div className="login-body">
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">{t('new_password')}</label>
            <input 
              className="form-input" 
              type="password" 
              value={pw} 
              onChange={e => setPw(e.target.value)} 
              required 
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            {t('set_password')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceReset;
