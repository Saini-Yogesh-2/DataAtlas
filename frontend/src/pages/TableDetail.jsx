import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { 
  ArrowLeft, 
  Database, 
  GitFork, 
  ShieldAlert, 
  History, 
  Eye, 
  BookOpen, 
  Info,
  Calendar,
  User,
  HardDrive,
  Cpu
} from 'lucide-react';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const TableDetail = () => {
  const { catalog, schema, table } = useParams();
  const navigate = useNavigate();
  const { credentials, getRequestConfig, addNotification } = useApp();

  const fullName = `${catalog}.${schema}.${table}`;

  const [activeTab, setActiveTab] = useState('schema'); // 'schema', 'history', 'preview', 'stats'
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [preview, setPreview] = useState([]);

  // Fetch Table details — re-fetch when credentials or table params change
  useEffect(() => {
    const fetchTableDetails = async () => {
      try {
        setLoading(true);
        const detailsRes = await axios.get(`/api/catalog/table/details?catalog=${catalog}&schema=${schema}&table=${table}`, getRequestConfig());
        setDetails(detailsRes.data);

        // Fetch History
        const historyRes = await axios.get(`/api/catalog/table/history?catalog=${catalog}&schema=${schema}&table=${table}`, getRequestConfig());
        setHistory(historyRes.data);

        // Fetch Sample Data
        const previewRes = await axios.get(`/api/catalog/table/preview?catalog=${catalog}&schema=${schema}&table=${table}`, getRequestConfig());
        setPreview(previewRes.data);

      } catch (err) {
        console.error('Error fetching table details:', err);
        addNotification(`Could not fetch details for table ${fullName}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTableDetails();
  }, [catalog, schema, table, credentials]);

  // Schema Columns mapping
  const columnCols = [
    {
      header: 'Column Name',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.pk ? 'var(--color-blue)' : 'var(--color-text)' }}>
          {val} {row.pk && <span style={{ fontSize: '0.625rem', padding: '1px 4px', borderRadius: '4px', backgroundColor: 'var(--color-blue-light)', marginLeft: '4px' }}>PK</span>}
        </span>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      sortable: true,
      render: (val) => <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{val}</span>
    },
    {
      header: 'Nullable',
      accessor: 'nullable',
      render: (val) => val ? 'YES' : 'NO'
    },
    {
      header: 'Tags',
      accessor: 'tags',
      render: (val) => (val || []).map(t => (
        <span key={t} className="badge badge-rose" style={{ marginRight: '4px' }}>{t}</span>
      ))
    },
    {
      header: 'Comment / Description',
      accessor: 'comment',
      render: (val) => val || <em style={{ color: 'var(--color-text-muted)' }}>No description.</em>
    }
  ];

  // Delta History mapping
  const historyCols = [
    {
      header: 'Version',
      accessor: 'version',
      render: (val) => <strong>v{val}</strong>
    },
    {
      header: 'Operation',
      accessor: 'operation',
      render: (val) => (
        <span className={`badge ${val === 'CREATE TABLE' ? 'badge-blue' : val === 'MERGE' ? 'badge-emerald' : 'badge-amber'}`}>
          {val}
        </span>
      )
    },
    {
      header: 'User',
      accessor: 'userName'
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (val) => new Date(val).toLocaleString()
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back navigation buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/catalog')}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <button className="btn btn-secondary" onClick={() => navigate(`/lineage?table=${fullName}`)}>
          <GitFork size={16} />
          <span>Trace Lineage</span>
        </button>

        <button className="btn btn-secondary" onClick={() => navigate(`/impact?table=${fullName}`)}>
          <ShieldAlert size={16} />
          <span>Impact Analysis</span>
        </button>
      </div>

      {/* Table Title Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--color-blue-light)', color: 'var(--color-blue)' }}>
            <Database size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
                {table}
              </h2>
              {details && (
                <span className="badge badge-blue">{details.type}</span>
              )}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              {fullName}
            </p>
          </div>
        </div>

        {details && (
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>OWNER</div>
                <strong>{details.owner}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={16} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>SIZE</div>
                <strong>{details.size_bytes ? formatBytes(details.size_bytes) : '—'}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main split details grid */}
      <div className="detail-grid">
        
        {/* Left side tabs panel */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tab selector menu */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '1rem' }}>
            {[
              { id: 'schema', label: 'Schema Columns', icon: BookOpen },
              { id: 'history', label: 'Delta History', icon: History },
              { id: 'preview', label: 'Sample Preview', icon: Eye },
              { id: 'stats', label: 'Properties & Info', icon: Info }
            ].map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.75rem 0.5rem',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--color-blue)' : '2px solid transparent',
                    color: isActive ? 'var(--color-blue)' : 'var(--color-text-muted)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Render Tab Contents */}
          <div>
            {activeTab === 'schema' && (
              <DataTable
                columns={columnCols}
                data={details?.columns || []}
                searchPlaceholder="Search columns..."
                loading={loading}
              />
            )}

            {activeTab === 'history' && (
              <DataTable
                columns={historyCols}
                data={history}
                searchPlaceholder="Search operations..."
                loading={loading}
              />
            )}

            {activeTab === 'preview' && (
              <div>
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="animate-pulse" style={{ height: '36px', backgroundColor: 'var(--color-border)', borderRadius: '6px', marginBottom: '8px' }} />
                  ))
                ) : preview.length === 0 || preview[0]?.error ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Preview rows unavailable. Ensure the SQL Warehouse is active.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--color-card-hover)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                          {Object.keys(preview[0]).map(key => (
                            <th key={key} style={{ padding: '8px 12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            {Object.values(row).map((val, vidx) => (
                              <td key={vidx} style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && details && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Storage Location</span>
                  <code style={{ color: 'var(--color-text)', wordBreak: 'break-all' }}>{details.location}</code>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Data Format</span>
                  <strong>{details.format}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Created At</span>
                  <span>{new Date(details.created_at).toLocaleString()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Last Refreshed</span>
                  <span>{new Date(details.updated_at).toLocaleString()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Security Level</span>
                  <span>{details.tags?.includes('PII') ? '🔴 High Risk PII' : '🟢 General'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side metadata properties pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* General comment */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Description
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
              {details?.comment || <em style={{ color: 'var(--color-text-muted)' }}>No description registered in Unity Catalog.</em>}
            </p>
          </div>

          {/* Active Tags */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Tags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {details?.tags?.length > 0 ? (
                details.tags.map(t => (
                  <span key={t} className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{t}</span>
                ))
              ) : (
                <em style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>No tags assigned.</em>
              )}
            </div>
          </div>

          {/* Criticality rating panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: details?.criticality === 'High' ? '4px solid var(--color-rose)' : '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Risk / Criticality
            </h3>
            <div>
              <span 
                className="badge"
                style={{ 
                  backgroundColor: details?.criticality === 'High' ? 'var(--color-rose-light)' : 'var(--color-emerald-light)',
                  color: details?.criticality === 'High' ? 'var(--color-rose)' : 'var(--color-emerald)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {details?.criticality || 'Medium'} Impact
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Impact ranking is computed dynamically from downstream table dependencies, consuming Spark workflows, and dashboard references.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TableDetail;
