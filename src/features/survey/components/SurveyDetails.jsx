import React from 'react';
import { useTranslation } from 'react-i18next';

const SurveyDetails = ({ survey }) => {
  const { t } = useTranslation();
  if (!survey) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Personal Identity */}
      <div>
        <h4 style={{ 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          color: 'var(--primary)', 
          letterSpacing: '0.05em', 
          marginBottom: '12px', 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '6px' 
        }}>
          Personal Identity
        </h4>
        <div className="ppc-info-grid" style={{ marginBottom: 0, gap: 12 }}>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Full Name</div>
            <div className="ppc-info-value">{survey.name}</div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Father / Husband</div>
            <div className="ppc-info-value">{survey.fathersName || '—'}</div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Contact Phone</div>
            <div className="ppc-info-value">{survey.phone}</div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Gender</div>
            <div className="ppc-info-value" style={{ textTransform: 'capitalize' }}>
              {survey.gender}
            </div>
          </div>
        </div>
      </div>

      {/* Housing & Family */}
      <div>
        <h4 style={{ 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          color: 'var(--primary)', 
          letterSpacing: '0.05em', 
          marginBottom: '12px', 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '6px' 
        }}>
          Housing & Family
        </h4>
        <div className="ppc-info-grid" style={{ marginBottom: 0, gap: 12 }}>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Ward No.</div>
            <div className="ppc-info-value">{survey.wardNo}</div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">House Type</div>
            <div className="ppc-info-value" style={{ textTransform: 'capitalize' }}>
              {survey.houseType.replace('_', ' ')}
            </div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Total Members</div>
            <div className="ppc-info-value">{survey.familyMembers || '0'}</div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Children (Boys / Girls)</div>
            <div className="ppc-info-value">
              {survey.childrenBoy || '0'} / {survey.childrenGirl || '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Socio-Economics */}
      <div>
        <h4 style={{ 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          color: 'var(--primary)', 
          letterSpacing: '0.05em', 
          marginBottom: '12px', 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '6px' 
        }}>
          Socio-Economics
        </h4>
        <div className="ppc-info-grid" style={{ marginBottom: 0, gap: 12 }}>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Monthly Income</div>
            <div className="ppc-info-value">
              {survey.monthlyIncome ? `${survey.monthlyIncome} TK` : '—'}
            </div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Farmable Land</div>
            <div className="ppc-info-value">
              {survey.farmableLand ? `${survey.farmableLand} decimals` : '—'}
            </div>
          </div>
          <div className="ppc-info-item">
            <div className="ppc-info-label">Farm Animals</div>
            <div className="ppc-info-value">{survey.farmAnimals || 'None'}</div>
          </div>
          <div className="ppc-info-item" style={{ background: 'var(--green-50)', borderColor: 'var(--green-200)' }}>
            <div className="ppc-info-label" style={{ color: 'var(--green-800)' }}>Data Collected By</div>
            <div className="ppc-info-value" style={{ color: 'var(--green-900)' }}>
              {survey.submittedBy?.name || 'Self Registered'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SurveyDetails;
