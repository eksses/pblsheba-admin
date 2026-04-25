import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Database, HardDrive, ShieldCheck, X, ChevronDown, ChevronUp } from '@phosphor-icons/react';

const DebugPanel = () => {
  const [health, setHealth] = useState(null);
  const [minimized, setMinimized] = useState(true);
  const [forceShow, setForceShow] = useState(localStorage.getItem('pbl_debug_active') === 'true');
  const showDebug = import.meta.env.VITE_SHOW_DEBUG === 'true' || forceShow;

  useEffect(() => {
    // Secret Trigger: Check URL for ?debug=true or ?debug=false
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      localStorage.setItem('pbl_debug_active', 'true');
      setForceShow(true);
    } else if (params.get('debug') === 'false') {
      localStorage.setItem('pbl_debug_active', 'false');
      setForceShow(false);
    }

    if (!showDebug) return;

    const fetchHealth = async () => {
      try {
        const apiHost = window.location.hostname;
        const res = await axios.get(`http://${apiHost}:5000/api/public/health`);
        setHealth(res.data);
      } catch (err) {
        console.error('Health check failed');
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [showDebug]);

  if (!showDebug) return null;

  const getStatusColor = (status) => status === 'connected' || status === 'active' ? '#4caf50' : '#e53935';

  return (
    <div style={panelWrapper}>
      <div style={header} onClick={() => setMinimized(!minimized)}>
        <Activity size={18} weight="bold" color="#e53935" />
        <span style={title}>SYSTEM HEALTH</span>
        {minimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {!minimized && (
        <div style={content}>
          <HealthItem 
            icon={Database} 
            label="MongoDB" 
            status={health?.services?.mongodb || 'checking...'} 
            color={getStatusColor(health?.services?.mongodb)}
          />
          <HealthItem 
            icon={HardDrive} 
            label="Redis" 
            status={health?.services?.redis || 'checking...'} 
            color={getStatusColor(health?.services?.redis)}
          />
          <HealthItem 
            icon={ShieldCheck} 
            label="Supabase" 
            status={health?.services?.supabase || 'checking...'} 
            color={getStatusColor(health?.services?.supabase)}
          />
          <div style={footer}>
            <span>Env: {health?.env || '...'}</span>
            <span>API: {window.location.hostname}:5000</span>
          </div>
        </div>
      )}
    </div>
  );
};

const HealthItem = ({ icon: Icon, label, status, color }) => (
  <div style={itemStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={14} weight="fill" color={color} />
      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{label}</span>
    </div>
    <span style={{ fontSize: '0.7rem', color, fontWeight: 800, textTransform: 'uppercase' }}>{status}</span>
  </div>
);

const panelWrapper = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '220px',
  background: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid #333',
  borderRadius: '12px',
  color: '#fff',
  zIndex: 9999,
  fontFamily: '"Inter", sans-serif',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

const header = {
  padding: '10px 15px',
  background: '#111',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  borderBottom: '1px solid #222'
};

const title = {
  fontSize: '0.7rem',
  fontWeight: 900,
  letterSpacing: '1px',
  flex: 1
};

const content = {
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10
};

const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const footer = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid #222',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.6rem',
  color: '#666'
};

export default DebugPanel;
