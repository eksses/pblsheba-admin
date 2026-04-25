import React, { useState, useEffect } from 'react';
import { Activity, Database, HardDrive, Cpu, ShieldCheck } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';

const HealthStats = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(false);

  const fetchHealth = async () => {
    try {
      const res = await axiosClient.get('/public/health');
      setHealth(res.data);
      setError(false);
    } catch (err) {
      setError(true);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="health-card error">
        <Activity size={20} weight="bold" />
        <div className="health-content">
          <p className="health-label">System Health</p>
          <p className="health-value">Connectivity Lost</p>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const getStatusColor = (s) => {
    if (s === 'connected' || s === 'active' || s === 'up') return 'var(--green-500)';
    return 'var(--danger)';
  };

  return (
    <div className="health-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ShieldCheck size={18} weight="fill" color="var(--primary)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>System Stability</h3>
      </div>
      
      <div className="health-grid">
        <div className="health-item">
          <Database size={16} color={getStatusColor(health.services?.mongodb?.status)} weight="fill" />
          <span>MongoDB</span>
        </div>
        <div className="health-item">
          <Activity size={16} color={getStatusColor(health.services?.redis?.status)} weight="fill" />
          <span>Redis</span>
        </div>
        <div className="health-item">
          <HardDrive size={16} color={getStatusColor(health.services?.supabase?.status)} weight="fill" />
          <span>Supabase</span>
        </div>
        <div className="health-item">
          <Cpu size={16} color="var(--primary)" weight="fill" />
          <span>{Math.round(health.memory?.rss / 1024 / 1024)}MB RSS</span>
        </div>
      </div>
    </div>
  );
};

export default HealthStats;
