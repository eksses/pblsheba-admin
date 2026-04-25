import React, { useState, useEffect } from 'react';

const panelWrapper = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '240px',
  background: 'rgba(0, 0, 0, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid #333',
  borderRadius: '12px',
  color: '#fff',
  zIndex: 9999,
  fontFamily: 'sans-serif',
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
  fontSize: '11px',
  fontWeight: 'bold',
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
  fontSize: '10px',
  color: '#666'
};

const StatusDot = ({ color }) => (
  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
);

const DebugPanel = () => {
  const [health, setHealth] = useState(null);
  const [minimized, setMinimized] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [forceShow, setForceShow] = useState(localStorage.getItem('pbl_debug_active') === 'true');
  const showDebug = import.meta.env.VITE_SHOW_DEBUG === 'true' || forceShow;

  useEffect(() => {
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
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
        const baseApi = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const healthUrl = baseApi.replace(/\/api$/, '') + '/api/public/health';
        
        const res = await fetch(healthUrl);
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

  const getColor = (s) => {
    if (apiError) return '#666'; // Grey if API is unreachable
    return (s === 'connected' || s === 'active' ? '#4caf50' : '#f44336');
  };

  return (
    <div style={panelWrapper}>
      <div style={header} onClick={() => setMinimized(!minimized)}>
        <div style={{ 
          width: 10, 
          height: 10, 
          borderRadius: '50%', 
          background: apiError ? '#666' : '#f44336', 
          animation: apiError ? 'none' : 'pulse 1.5s infinite' 
        }} />
        <span style={title}>SYSTEM TELEMETRY</span>
        <span style={{ fontSize: '10px' }}>{minimized ? '▲' : '▼'}</span>
      </div>

      {!minimized && (
        <div style={content}>
          {apiError && (
            <div style={{ background: 'rgba(244, 67, 54, 0.2)', padding: '8px', borderRadius: '6px', marginBottom: '5px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#f44336', fontWeight: 'bold' }}>API UNREACHABLE</span>
            </div>
          )}
          
          <div style={itemStyle}>
            <span style={{ fontSize: '12px' }}>MongoDB</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '10px', color: getColor(health?.services?.mongodb) }}>
                {apiError ? 'unknown' : (health?.services?.mongodb || '...')}
              </span>
              <StatusDot color={getColor(health?.services?.mongodb)} />
            </div>
          </div>
          
          <div style={itemStyle}>
            <span style={{ fontSize: '12px' }}>Redis</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '10px', color: getColor(health?.services?.redis) }}>
                {apiError ? 'unknown' : (health?.services?.redis || '...')}
              </span>
              <StatusDot color={getColor(health?.services?.redis)} />
            </div>
          </div>
          
          <div style={itemStyle}>
            <span style={{ fontSize: '12px' }}>Supabase</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '10px', color: getColor(health?.services?.supabase) }}>
                {apiError ? 'unknown' : (health?.services?.supabase || '...')}
              </span>
              <StatusDot color={getColor(health?.services?.supabase)} />
            </div>
          </div>
          
          <div style={footer}>
            <span>{apiError ? 'OFFLINE' : (health?.env || 'dev')}</span>
            <span style={{ fontSize: '9px', color: '#444' }}>{window.location.hostname}</span>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DebugPanel;
