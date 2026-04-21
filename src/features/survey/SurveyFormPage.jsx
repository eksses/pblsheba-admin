import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ClipboardText } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const SurveyFormPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '', fathersName: '', wardNo: '', farmAnimals: '', farmableLand: '',
    houseType: 'tin_shed', familyMembers: '', gender: 'male', childrenBoy: '',
    childrenGirl: '', monthlyIncome: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/surveys', form);
      setSuccess(true);
      setForm({
        name: '', fathersName: '', wardNo: '', farmAnimals: '', farmableLand: '',
        houseType: 'tin_shed', familyMembers: '', gender: 'male', childrenBoy: '',
        childrenGirl: '', monthlyIncome: '', phone: ''
      });
      toast.success(t('success_survey'));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_submitting_survey'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('house_house')}</h1>
          <p className="text-muted">{t('collect_data')}</p>
        </div>
      </div>

      <div className="card-list" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="data-card" style={{ padding: 20 }}>
          {success && (
            <div className="alert-success" style={{ marginBottom: 20 }}>
              <CheckCircle size={18} weight="fill" /> {t('success_survey')}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t('name_label')} *</label>
              <input 
                className="form-input" 
                value={form.name} 
                onChange={e => setField('name', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('fathers_husband_label')}</label>
              <input 
                className="form-input" 
                value={form.fathersName} 
                onChange={e => setField('fathersName', e.target.value)} 
              />
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('ward_label')} *</label>
                <input 
                  className="form-input" 
                  value={form.wardNo} 
                  onChange={e => setField('wardNo', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('phone_label')} *</label>
                <input 
                  className="form-input" 
                  type="tel" 
                  value={form.phone} 
                  onChange={e => setField('phone', e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('house_type_label')}</label>
                <select 
                  className="form-input" 
                  value={form.houseType} 
                  onChange={e => setField('houseType', e.target.value)}
                >
                  <option value="tin_shed">{t('tin_shed')}</option>
                  <option value="brick_built">{t('brick_built')}</option>
                  <option value="mud_house">{t('mud_house')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('gender_label')}</label>
                <select 
                  className="form-input" 
                  value={form.gender} 
                  onChange={e => setField('gender', e.target.value)}
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('family_members_label')}</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={form.familyMembers} 
                  onChange={e => setField('familyMembers', e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('income_label')}</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={form.monthlyIncome} 
                  onChange={e => setField('monthlyIncome', e.target.value)} 
                />
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('children_boy_label')}</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={form.childrenBoy} 
                  onChange={e => setField('childrenBoy', e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('children_girl_label')}</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={form.childrenGirl} 
                  onChange={e => setField('childrenGirl', e.target.value)} 
                />
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('farm_animals_label')}</label>
                <input 
                  className="form-input" 
                  value={form.farmAnimals} 
                  onChange={e => setField('farmAnimals', e.target.value)} 
                  placeholder="e.g. 2 Cows, 5 Hens" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('farmable_land_label')}</label>
                <input 
                  className="form-input" 
                  value={form.farmableLand} 
                  onChange={e => setField('farmableLand', e.target.value)} 
                  placeholder="e.g. 10 Decimals" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              style={{ height: 48, marginTop: 10 }} 
              disabled={loading}
            >
              {loading ? (
                t('saving')
              ) : (
                <>
                  <ClipboardText size={18} style={{ marginRight: 8 }} /> 
                  {t('submit_survey')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SurveyFormPage;
