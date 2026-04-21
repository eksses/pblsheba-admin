import React from 'react';
import { useTranslation } from 'react-i18next';

const SurveyCard = ({ survey, onClick }) => {
  const { t } = useTranslation();
  
  return (
    <div 
      className="data-card" 
      onClick={() => onClick(survey)} 
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div className="data-card-row">
        <div style={{ flex: 1 }}>
          <div className="data-card-name">{survey.name}</div>
          <div className="data-card-sub">{survey.phone} · Ward {survey.wardNo}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="badge badge-green" style={{ textTransform: 'capitalize' }}>
            {survey.houseType.replace('_', ' ')}
          </div>
          <div className="data-card-sub" style={{ marginTop: 4 }}>
            {t('family_members_label')}: {survey.familyMembers}
          </div>
        </div>
      </div>
      <div 
        className="data-card-detail" 
        style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}
      >
        <div className="data-card-detail-row">
          <span className="data-card-detail-key">Collected By</span>
          <span className="data-card-detail-value" style={{ fontWeight: 600, color: 'var(--green)' }}>
            {survey.submittedBy?.name || 'Self'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SurveyCard;
