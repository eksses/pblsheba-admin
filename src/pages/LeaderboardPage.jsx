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
      .then(r => setBoard(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('rankings_title')}</h1>
          <p className="text-muted">{t('rankings_desc')}</p>
        </div>
      </div>

      {loading ? (
        <div className="shimmer" style={{ height: 400, borderRadius: 20 }} />
      ) : board.length === 0 ? (
        <div className="empty-state">
          <Trophy size={48} weight="duotone" />
          <p>{t('no_data')}</p>
        </div>
      ) : (
        <div className="card-list">
          {board.map((item, index) => (
            <div 
              className="data-card" 
              key={item._id || item.id} 
              onClick={() => navigate(`/members?staffId=${item._id || item.id}`)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div 
                  className={`rank-badge ${index < 3 ? `rank-${index + 1}` : ''}`}
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--grey-100)',
                    color: index < 3 ? 'white' : 'var(--text-main)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                    {item.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('members_referred')}
                  </div>
                </div>
                <CaretRight size={20} weight="bold" color="var(--grey-400)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
