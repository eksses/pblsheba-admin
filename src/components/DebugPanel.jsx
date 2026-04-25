import React, { useState, useEffect } from 'react';

const panelWrapper = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '260px',
  background: 'rgba(0, 0, 0, 0.95)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid #333',
  borderRadius: '14px',
  color: '#fff',
  zIndex: 9999,
  fontFamily: 'sans-serif',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
};

const header = {
  padding: '12px 15px',
  background: '#111',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  borderBottom: '1px solid #222'
};

const title = {
  fontSize: '11px',
  fontWeight: '900',
  letterSpacing: '1.5px',
  flex: 1,
  color: '#aaa'
};

const content = {
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12
};

const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative'
};

const footer = {
  marginTop: '8px',
  paddingTop: '10px',
  borderTop: '1px solid #222',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: '9px',
  color: '#555'
};

const StatusDot = ({ color }) => (
  <div style={{ 
    width: 8, 
    height: 8, 
    borderRadius: '50%', 
    background: color, 
    boxShadow: `0 0 8px ${color}`,
    transition: 'all 0.3s ease'
  }} />
);

const DiagnosticItem = ({ label, service, apiError }) => {
  const [hover, setHover] = useState(false);
  
  // Type Guard: Ensure status is always a string for React rendering
  let statusText = '...';
  if (apiError) {
    statusText = 'offline';
  } else if (typeof service === 'string') {
    statusText = service;
  } else if (service && typeof service === 'object') {
    statusText = service.status || 'unknown';
  }
  
  const getColor = (s) => {
    if (apiError) return '#666';
    if (s === 'connected' || s === 'active' || s === 'up') return '#4caf50';
    if (s === 'connecting') return '#ff9800';
    return '#f44336';
  };

  return (
    <div 
      style={itemStyle} 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ccc' }}>{label}</span>
        {hover && service?.host && (
          <span style={{ fontSize: '8px', color: '#666', position: 'absolute', top: '-12px', left: 0, background: '#000', padding: '2px 4px', borderRadius: '4px', zIndex: 10 }}>
            {service.host}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '10px', fontWeight: '900', color: getColor(statusText), textTransform: 'uppercase' }}>
          {statusText}
        </span>
        <StatusDot color={getColor(statusText)} />
      </div>
    </div>
  );
};

const DebugPanel = () => {
  const [health, setHealth] = useState(null);
  const [minimized, setMinimized] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [forceShow, setForceShow] = useState(() => {
    try {
      return localStorage.getItem('pbl_debug_active') === 'true';
    } catch (e) {
      return false;
    }
  });
  const showDebug = import.meta.env.VITE_SHOW_DEBUG === 'true' || forceShow;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    try {
      if (params.get('debug') === 'true') {
        localStorage.setItem('pbl_debug_active', 'true');
        setForceShow(true);
      } else if (params.get('debug') === 'false') {
        localStorage.setItem('pbl_debug_active', 'false');
        setForceShow(false);
      }
    } catch (e) {
      console.warn('Storage access blocked:', e);
    }

    if (!showDebug) return;

    const fetchHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) return;
        
        const base = apiUrl.replace(/\/api\/?$/, '');
        const res = await fetch(`${base}/api/public/health`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setHealth(data);
        setApiError(false);
      } catch (err) {
        setApiError(true);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [showDebug]);

  if (!showDebug) return null;

  return (
    <div style={panelWrapper}>
      <div style={header} onClick={() => setMinimized(!minimized)}>
        <div style={{ 
          width: 10, 
          height: 10, 
          borderRadius: '50%', 
          background: apiError ? '#444' : '#00ff00', 
          animation: apiError ? 'none' : 'pulse 2s infinite' 
        }} />
        <span style={title}>PRO TELEMETRY</span>
        <span style={{ fontSize: '10px', color: '#444' }}>{minimized ? '▲' : '▼'}</span>
      </div>

      {!minimized && (
        <div style={content}>
          {apiError && (
            <div style={{ background: 'rgba(244, 67, 54, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(244, 67, 54, 0.2)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#f44336', fontWeight: 'bold' }}>API CONNECTION LOST</span>
            </div>
          )}
          
          <DiagnosticItem label="MONGODB" service={health?.services?.mongodb} apiError={apiError} />
          <DiagnosticItem label="REDIS CACHE" service={health?.services?.redis} apiError={apiError} />
          <DiagnosticItem label="SUPABASE" service={health?.services?.supabase} apiError={apiError} />
          
          <div style={footer}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Uptime: {health?.uptime ? `${Math.floor(health.uptime / 60)}m` : '...'}</span>
              <span>Mem: {health?.memory?.rss ? `${Math.round(health.memory.rss / 1024 / 1024)}MB` : '...'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}>
              <span>Env: {health?.environment || 'unknown'}</span>
              <span>Node: {health?.version || '...'}</span>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.4); }
          50% { opacity: 0.6; transform: scale(1.1); box-shadow: 0 0 0 10px rgba(0, 255, 0, 0); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default DebugPanel;
