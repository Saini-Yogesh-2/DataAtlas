import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GitFork, ShieldAlert, Key, Link2, Server, HelpCircle } from 'lucide-react';

const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [host, setHost] = useState('');
  const [token, setToken] = useState('');
  const [warehousePath, setWarehousePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle live connection submit
  const handleConnect = async (e) => {
    e.preventDefault();
    if (!host || !token) {
      setErrorMsg('Workspace Host URL and Personal Access Token are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(host, token, warehousePath);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Connection test failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate Simulation Mode access
  const handleDemoMode = () => {
    login(null, null, null); // Set empty to fall back to simulation
    navigate('/');
  };

  return (
    <div 
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-sans)',
        padding: '1.5rem'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Brand header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--color-blue-light)', 
              color: 'var(--color-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem'
            }}
          >
            <GitFork size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--color-text)' }}>
            DataAtlas
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '300px' }}>
            Enterprise Metadata Intelligence Platform for Databricks Unity Catalog
          </p>
        </div>

        {errorMsg && (
          <div 
            className="badge" 
            style={{ 
              padding: '10px 14px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--color-rose-light)', 
              color: 'var(--color-rose)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live login form */}
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Host input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Databricks Host URL
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Link2 size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '36px' }}
                placeholder="https://dbc-xxxx.cloud.databricks.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* PAT token input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Personal Access Token (PAT)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                className="input"
                style={{ paddingLeft: '36px' }}
                placeholder="dapi1234567890abcdef..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Warehouse SQL path input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                SQL Warehouse HTTP Path (Optional)
              </label>
              <span title="Required only to query Delta history and data previews" style={{ color: 'var(--color-text-muted)', cursor: 'help' }}>
                <HelpCircle size={14} />
              </span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Server size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '36px' }}
                placeholder="/sql/1.0/warehouses/xxxx"
                value={warehousePath}
                onChange={(e) => setWarehousePath(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.625rem', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Testing Connection...' : 'Connect Workspace'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-border)' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
        </div>

        {/* Enter Simulation Mode Button */}
        <button 
          onClick={handleDemoMode}
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '0.625rem' }}
          disabled={loading}
        >
          Explore in Simulation Mode
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
          Simulation Mode runs local, pre-loaded mock telemetry representing a complex medallion warehouse.
        </p>
      </div>
    </div>
  );
};

export default Login;
