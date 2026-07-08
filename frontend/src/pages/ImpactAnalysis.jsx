import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { ShieldAlert, AlertTriangle, Workflow, Activity, Database, Search, ArrowRight } from 'lucide-react';

const ImpactAnalysis = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { credentials, getRequestConfig, addNotification } = useApp();

  const selectedTable = searchParams.get('table') || '';

  // State lists
  const [tableList, setTableList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState(null);

  // Reset table selection when credentials change
  useEffect(() => {
    setSearchParams({});
    setSearchTerm('');
  }, [credentials]);

  // 1. Fetch available tables for search dropdown
  useEffect(() => {
    const fetchTablesList = async () => {
      try {
        const res = await axios.get('/api/catalog/all-tables', getRequestConfig());
        setTableList(res.data);
      } catch (err) {
        console.error('Error loading tables dropdown:', err);
      }
    };
    fetchTablesList();
  }, [credentials]);

  // 2. Fetch impact assessment metrics for the selected table
  useEffect(() => {
    if (!selectedTable) return;

    const fetchImpact = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/impact/analysis?table=${selectedTable}`, getRequestConfig());
        setImpactData(res.data);
      } catch (err) {
        console.error('Error fetching impact analytics:', err);
        addNotification(`Could not fetch impact details for ${selectedTable}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, [selectedTable]);

  const handleSelectTable = (tbl) => {
    setSearchParams({ table: tbl });
    setSearchTerm('');
    setShowDropdown(false);
  };

  const getCriticalityColor = (score) => {
    if (score >= 75) return 'var(--color-rose)';
    if (score >= 40) return 'var(--color-amber)';
    return 'var(--color-emerald)';
  };

  // Columns for downstream tables list
  const downstreamTableCols = [
    {
      header: 'Table Full Name',
      accessor: 'id',
      render: (val, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {row}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (val, row) => {
        const parts = row.split('.');
        return (
          <button 
            className="btn btn-ghost" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            onClick={() => navigate(`/catalog/${parts[0]}/${parts[1]}/${parts[2]}`)}
          >
            <span>View Catalog Profile</span>
            <ArrowRight size={12} />
          </button>
        );
      }
    }
  ];

  // Columns for consuming jobs list
  const jobCols = [
    {
      header: 'Job Name',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Workflow size={16} style={{ color: 'var(--color-violet)' }} />
          <span>{val}</span>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'owner'
    },
    {
      header: 'Schedule',
      accessor: 'schedule',
      render: (val) => <code style={{ fontSize: '0.75rem' }}>{val}</code>
    },
    {
      header: 'Run Status',
      accessor: 'status',
      render: (val) => (
        <span className={`badge ${val === 'ACTIVE' ? 'badge-emerald' : 'badge-rose'}`}>
          {val}
        </span>
      )
    }
  ];

  // Columns for DLT pipelines
  const pipelineCols = [
    {
      header: 'Pipeline Name',
      accessor: 'name',
      sortable: true,
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Activity size={16} style={{ color: 'var(--color-emerald)' }} />
          <span>{val}</span>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'owner'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <span className={`badge ${val === 'RUNNING' ? 'badge-emerald' : 'badge-rose'}`}>
          {val}
        </span>
      )
    }
  ];

  const filteredSuggestions = tableList.filter(t => 
    t.toLowerCase().includes(searchTerm.toLowerCase()) && t !== selectedTable
  );

  const br = impactData?.blastRadius || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
            Blast Radius & Impact Analysis
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Determine exactly what downstream dashboards, ETL pipeline workflows, and ML models will fail if this table is updated or deleted.
          </p>
        </div>

        {/* Search autocomplete selector */}
        <div style={{ position: 'relative', width: '360px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search table to analyze..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
          </div>

          {showDropdown && searchTerm.trim() && (
            <div 
              style={{
                position: 'absolute',
                top: '42px',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {filteredSuggestions.length === 0 ? (
                <div style={{ padding: '8px 12px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  No matching tables.
                </div>
              ) : (
                filteredSuggestions.map(tbl => (
                  <button
                    key={tbl}
                    onClick={() => handleSelectTable(tbl)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {tbl}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Target Table details card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-rose-light)', color: 'var(--color-rose)' }}>
          <ShieldAlert size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>ACTIVE SCOPE</span>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
            {selectedTable.split('.').pop()}
          </h2>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{selectedTable}</span>
        </div>
      </div>

      {/* Assessment Metrics grid */}
      <div className="impact-grid">
        
        {/* Left Side: Score & Sizing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Criticality Score Gauge */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Criticality Score
            </h3>

            {loading ? (
              <div className="animate-pulse" style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }} />
            ) : (
              <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                {/* SVG circular track */}
                <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" stroke="var(--color-border)" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke={getCriticalityColor(impactData?.criticalityScore)} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (impactData?.criticalityScore || 0)) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-title)', color: getCriticalityColor(impactData?.criticalityScore) }}>
                    {impactData?.criticalityScore}
                  </span>
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>Score</span>
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Scores above 70 represent core warehouse assets requiring strict pull-request review pipelines before edits are pushed.
            </p>
          </div>

          {/* Blast Radius counters */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Blast Radius Summary
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Affected Assets:</span>
              <strong>{loading ? '—' : br.affectedAssetsCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Max Dependency Depth:</span>
              <strong>{loading ? '—' : `${br.maxDependencyDepth} levels`}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Downstream Tables:</span>
              <strong>{loading ? '—' : br.tablesCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Impacted Spark Jobs:</span>
              <strong>{loading ? '—' : br.jobsCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Impacted DLT Pipelines:</span>
              <strong>{loading ? '—' : br.pipelinesCount}</strong>
            </div>
          </div>

        </div>

        {/* Right Side: Downstream tables / jobs listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Tables Affected */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} style={{ color: 'var(--color-blue)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Affected Downstream Tables</h3>
            </div>
            <DataTable
              columns={downstreamTableCols}
              data={impactData?.downstreamTables || []}
              searchPlaceholder="Filter affected tables..."
              loading={loading}
              defaultPageSize={5}
              emptyMessage="No downstream tables are dependent on this table."
            />
          </div>

          {/* Jobs Affected */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Workflow size={18} style={{ color: 'var(--color-violet)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Affected Scheduled Spark Jobs</h3>
            </div>
            <DataTable
              columns={jobCols}
              data={impactData?.downstreamJobs || []}
              searchPlaceholder="Filter affected jobs..."
              loading={loading}
              defaultPageSize={5}
              emptyMessage="No scheduled workflow jobs read from this table."
            />
          </div>

          {/* Pipelines Affected */}
          {impactData?.downstreamPipelines?.length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--color-emerald)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Affected DLT Pipelines</h3>
              </div>
              <DataTable
                columns={pipelineCols}
                data={impactData?.downstreamPipelines || []}
                searchPlaceholder="Filter affected pipelines..."
                loading={loading}
                defaultPageSize={5}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ImpactAnalysis;
