import React, { useState, useEffect } from 'react';
import { CaretLeft, Trash, Copy, Bug, Clock, Info } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const DebugPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [pushLogs, setPushLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  const DB_NAME = 'push_debug_db';
  const LOG_STORE = 'console_logs';
  const PUSH_STORE = 'notification_logs';

  const fetchLogs = async () => {
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(LOG_STORE)) db.createObjectStore(LOG_STORE, { keyPath: 'id', autoIncrement: true });
          if (!db.objectStoreNames.contains(PUSH_STORE)) db.createObjectStore(PUSH_STORE, { keyPath: 'timestamp' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Fetch Console Logs
      if (db.objectStoreNames.contains(LOG_STORE)) {
        const tx = db.transaction(LOG_STORE, 'readonly');
        const store = tx.objectStore(LOG_STORE);
        const req = store.getAll();
        req.onsuccess = () => setLogs(req.result.sort((a, b) => b.id - a.id));
      }

      // Fetch Push Logs
      if (db.objectStoreNames.contains(PUSH_STORE)) {
        const tx = db.transaction(PUSH_STORE, 'readonly');
        const store = tx.objectStore(PUSH_STORE);
        const req = store.getAll();
        req.onsuccess = () => setPushLogs(req.result.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (err) {
      console.error('Debug fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const clearAll = async () => {
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = () => resolve(request.result);
      });
      const tx = db.transaction([LOG_STORE, PUSH_STORE], 'readwrite');
      tx.objectStore(LOG_STORE).clear();
      tx.objectStore(PUSH_STORE).clear();
      setLogs([]);
      setPushLogs([]);
    } catch (err) {}
  };

  const copyToClipboard = () => {
    const data = {
      console: logs,
      push: pushLogs,
      userAgent: navigator.userAgent,
      time: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Debug data copied to clipboard!');
  };

  return (
    <div className="fade-up" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ padding: '8px' }}>
            <CaretLeft size={20} />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>System Debug</h1>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={clearAll} className="btn btn-danger btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Trash size={16} /> Clear All
          </button>
          <button onClick={copyToClipboard} className="btn btn-primary btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Copy size={16} /> Copy Full Info
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['all', 'push', 'console'].map(t => (
            <button 
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                background: filter === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: filter === t ? '#fff' : '#888', border: 'none', cursor: 'pointer'
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="card-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filter !== 'console' && pushLogs.map(log => (
            <div key={log.timestamp} className="data-card" style={{ borderLeft: '4px solid var(--green)', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bug size={14} /> PUSH RECEIVED
                </span>
                <span style={{ fontSize: '0.65rem', color: '#666' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{log.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{log.body}</div>
              {log.raw && <div style={{ fontSize: '0.6rem', color: '#555', marginTop: 6, fontFamily: 'monospace', wordBreak: 'break-all', background: '#000', padding: 4 }}>RAW: {log.raw}</div>}
            </div>
          ))}

          {filter !== 'push' && logs.map(log => (
            <div key={log.id} className="data-card" style={{ borderLeft: `4px solid ${log.type === 'error' ? '#ef4444' : '#3b82f6'}`, padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: '0.65rem', color: log.type === 'error' ? '#ef4444' : '#3b82f6', fontWeight: 800 }}>
                  {log.type.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.6rem', color: '#666' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {typeof log.msg === 'string' ? log.msg : JSON.stringify(log.msg)}
              </div>
            </div>
          ))}
        </div>

        {(logs.length === 0 && pushLogs.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
            <Clock size={40} weight="thin" style={{ marginBottom: 12 }} />
            <p>No system logs yet.</p>
          </div>
        )}
      </div>
  );
};

export default DebugPage;
