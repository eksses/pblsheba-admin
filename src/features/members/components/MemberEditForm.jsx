import React from 'react';
import { useTranslation } from 'react-i18next';

const MemberEditForm = ({ form, onFieldChange }) => {
  const { t } = useTranslation();

  if (!form) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">{t('full_name')} *</label>
        <input 
          type="text" 
          className="form-input" 
          value={form.name} 
          onChange={e => onFieldChange('name', e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('father_name')}</label>
        <input 
          type="text" 
          className="form-input" 
          value={form.fatherName || ''} 
          onChange={e => onFieldChange('fatherName', e.target.value)} 
        />
      </div>

      <div className="m-grid m-grid-2">
        <div className="form-group">
          <label className="form-label">{t('email')}</label>
          <input 
            type="email" 
            className="form-input" 
            value={form.email || ''} 
            onChange={e => onFieldChange('email', e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('dob')} *</label>
          <input 
            type="date" 
            className="form-input" 
            value={form.dob ? form.dob.split('T')[0] : ''} 
            onChange={e => onFieldChange('dob', e.target.value)} 
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('address')}</label>
        <textarea 
          className="form-input" 
          rows={2}
          value={form.address || ''} 
          onChange={e => onFieldChange('address', e.target.value)} 
        />
      </div>

      <div className="m-grid m-grid-2">
        <div className="form-group">
          <label className="form-label">{t('phone')} *</label>
          <input 
            type="tel" 
            className="form-input" 
            value={form.phone} 
            onChange={e => onFieldChange('phone', e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('nid')}</label>
          <input 
            type="text" 
            className="form-input" 
            value={form.nid || ''} 
            onChange={e => onFieldChange('nid', e.target.value)} 
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('new_password_optional')}</label>
        <input 
          type="password" 
          className="form-input" 
          placeholder="********" 
          value={form.password || ''} 
          onChange={e => onFieldChange('password', e.target.value)} 
        />
        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
          {t('leave_blank_keep_current')}
        </p>
      </div>

      <div className="m-grid m-grid-2">
        <div className="form-group">
          <label className="form-label">{t('payment_method')}</label>
          <select 
            className="form-input" 
            value={form.paymentMethod || 'bKash'} 
            onChange={e => onFieldChange('paymentMethod', e.target.value)}
          >
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('payment_number')}</label>
          <input 
            className="form-input" 
            value={form.paymentNumber || ''} 
            onChange={e => onFieldChange('paymentNumber', e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
};

export default MemberEditForm;
