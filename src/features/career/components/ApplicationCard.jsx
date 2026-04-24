import React from 'react';

const ApplicationCard = ({ application, onClick }) => {
  const { nameEn, nameBn, postAppliedFor, mobile, status } = application;
  const id = application.id || application._id;

  const statusClass = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';

  return (
    <div className="data-card" onClick={() => onClick(application)} style={{ cursor: 'pointer' }}>
      <div className="data-card-row">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
          <div 
            className="data-card-avatar" 
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {nameEn?.[0] || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="data-card-name">{nameEn} ({nameBn})</div>
            <div className="data-card-sub">{postAppliedFor} · {mobile}</div>
          </div>
        </div>
        <div className={`badge badge-${statusClass}`}>
          {status}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
