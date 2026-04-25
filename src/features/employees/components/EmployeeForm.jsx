import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageCapture from '../../../components/ImageCapture';

const EmployeeForm = ({ form, onFieldChange, isEdit }) => {
  const { t } = useTranslation();

  return (
    <form id="employee-form" style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <div className="form-group">
        <label className="form-label">{t('full_name')} *</label>
        <input 
          className="form-input" 
          value={form.name} 
          onChange={e => onFieldChange('name', e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('father_name')}</label>
        <input 
          className="form-input" 
          value={form.fatherName} 
          onChange={e => onFieldChange('fatherName', e.target.value)} 
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
          <label className="form-label">{t('nid')}</label>
          <input 
            className="form-input" 
            value={form.nid} 
            onChange={e => onFieldChange('nid', e.target.value)} 
          />
        </div>
      </div>

      <div className="m-grid m-grid-2">
        <div className="form-group">
          <label className="form-label">{t('email')}</label>
          <input 
            className="form-input" 
            type="email" 
            value={form.email} 
            onChange={e => onFieldChange('email', e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('dob')} *</label>
          <input 
            className="form-input" 
            type="date" 
            value={form.dob} 
            onChange={e => onFieldChange('dob', e.target.value)} 
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('address')}</label>
        <input 
          className="form-input" 
          value={form.address} 
          onChange={e => onFieldChange('address', e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          {isEdit ? t('new_password_optional') : t('password') + ' *'}
        </label>
        <input 
          className="form-input" 
          type="password" 
          value={form.password} 
          onChange={e => onFieldChange('password', e.target.value)} 
          placeholder={isEdit ? t('leave_blank_keep_current') : ''}
          required={!isEdit} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile_photo')}</label>
        <ImageCapture 
          onImageChange={(file) => onFieldChange('image', file)} 
          currentImage={form.currentImageUrl} 
        />
        {form.currentImageUrl && !form.image && (
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
            {t('showing_current_photo')}
          </p>
        )}
      </div>
    </form>
  );
};

export default EmployeeForm;
