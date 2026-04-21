import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageCapture from '../../../components/ImageCapture';

const MemberForm = ({ form, onFieldChange }) => {
  const { t } = useTranslation();

  return (
    <form id="member-form" style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <div className="form-group">
        <label className="form-label">{t('full_name')} *</label>
        <input 
          className="form-input" 
          placeholder={t('as_per_nid')} 
          value={form.name} 
          onChange={e => onFieldChange('name', e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('father_name')} *</label>
        <input 
          className="form-input" 
          value={form.fatherName} 
          onChange={e => onFieldChange('fatherName', e.target.value)} 
          required 
        />
      </div>

      <div className="m-grid m-grid-2">
        <div className="form-group">
          <label className="form-label">{t('phone')} *</label>
          <input 
            className="form-input" 
            type="tel" 
            placeholder="017-XXXXXXXX" 
            value={form.phone} 
            onChange={e => onFieldChange('phone', e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('nid')} *</label>
          <input 
            className="form-input" 
            value={form.nid} 
            onChange={e => onFieldChange('nid', e.target.value)} 
            required 
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('password')} *</label>
        <input 
          className="form-input" 
          type="password" 
          value={form.password} 
          onChange={e => onFieldChange('password', e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile_photo')} *</label>
        <ImageCapture onImageChange={(file) => onFieldChange('image', file)} currentImage={null} />
      </div>

      <div className="m-grid m-grid-2">
        <div className="form-group">
          <label className="form-label">{t('payment_method')} *</label>
          <select 
            className="form-input" 
            value={form.paymentMethod} 
            onChange={e => onFieldChange('paymentMethod', e.target.value)}
          >
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('payment_number')} *</label>
          <input 
            className="form-input" 
            value={form.paymentNumber} 
            onChange={e => onFieldChange('paymentNumber', e.target.value)} 
            required 
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('trx_id')} *</label>
        <input 
          className="form-input" 
          value={form.trxId} 
          onChange={e => onFieldChange('trxId', e.target.value)} 
          required 
        />
      </div>
    </form>
  );
};

export default MemberForm;
