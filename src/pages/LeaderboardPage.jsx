import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trophy, CaretRight } from '@phosphor-icons/react';
import axiosClient from '../api/axiosClient';

const LeaderboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/admin/leaderboard')
      .then(r => setBoard(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('leaderboard')}</h1>
          <p className="text-muted">{t('staff_performance')}</p>
        </div>
      </div>

      {loading ? (
        <div className="card-list">
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 20 }} />)}
        </div>
      ) : board.length === 0 ? (
        <div className="empty-state">
          <Trophy size={48} weight="duotone" />
          <p>{t('no_activity')}</p>
        </div>
      ) : (
        <div className="card-list">
          {board.map((item, index) => (
            <div 
              className="data-card" 
              key={item.id} 
              onClick={() => navigate(`/members?staffId=${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div 
                    className={`rank-badge ${index < 3 ? `rank-${index + 1}` : ''}`}
                    style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--neutral-100)',
                      color: index < 3 ? 'white' : 'var(--text-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="data-card-name">{item.name}</div>
                    <div className="data-card-sub">{item.phone}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem', lineHeight: 1 }}>
                    {item.totalActivity}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                    {t('activity')}
                  </div>
                </div>
              </div>
              
              <div className="data-card-detail" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--neutral-50)' }}>
                <div style={{ padding: '8px 12px', borderRight: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('total_registrations')}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)' }}>{item.registrations}</div>
                </div>
                <div style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('total_surveys')}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)' }}>{item.surveys}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
