import React from 'react';

const DetailRow = ({ label, value, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
    <div style={{ fontWeight: 600, color: color || 'var(--text-heading)', fontSize: '0.95rem' }}>{value || '—'}</div>
  </div>
);

export default DetailRow;
