import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { Users, Database, Workflow, Activity, ShieldAlert, FileClock } from 'lucide-react';

const OwnershipCenter = () => {
  const navigate = useNavigate();
  const { credentials, getRequestConfig, addNotification } = useApp();

  const [selectedOwner, setSelectedOwner] = useState('');
  const [loading, setLoading] = useState(true);
  const [catalogTables, setCatalogTables] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pipelines, setPipelines] = useState([]);

  // Fetch all catalog assets & jobs to filter locally by owner
  useEffect(() => {
    const fetchOwnershipData = async () => {
      try {
        setLoading(true);
        const tablesRes = await axios.get('/api/catalog/all-tables-metadata', getRequestConfig());
        setCatalogTables(tablesRes.data || []);

        const jobsRes = await axios.get('/api/jobs', getRequestConfig());
        setJobs(jobsRes.data || []);

        const pipelinesRes = await axios.get('/api/pipelines', getRequestConfig());
        setPipelines(pipelinesRes.data || []);

      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        addNotification(`Could not load ownership catalog: ${errMsg}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOwnershipData();
  }, [credentials]);

  // Compile owners list dynamically from actual retrieved assets
  const ownersMap = {};
  
  catalogTables.forEach(t => {
    const ownerName = t.owner || 'Workspace Owner';
    ownersMap[ownerName] = (ownersMap[ownerName] || 0) + 1;
  });
  jobs.forEach(j => {
    const ownerName = j.owner || 'Workspace Owner';
    ownersMap[ownerName] = (ownersMap[ownerName] || 0) + 1;
  });
  pipelines.forEach(p => {
    const ownerName = p.owner || 'Workspace Owner';
    ownersMap[ownerName] = (ownersMap[ownerName] || 0) + 1;
  });

  const ownersList = Object.keys(ownersMap).map(name => ({
    name,
    role: name.includes('@') ? 'Databricks Workspace Account' : 'Team / System Principal Owner',
    count: ownersMap[name]
  }));

  // Auto-select first owner from the compiled list
  useEffect(() => {
    if (ownersList.length > 0 && (!selectedOwner || !ownersMap[selectedOwner])) {
      setSelectedOwner(ownersList[0].name);
    }
  }, [catalogTables, jobs, pipelines]);

  // Filter listings based on active owner
  const ownedTables = catalogTables.filter(t => 
    selectedOwner && (t.owner || 'Workspace Owner').toLowerCase() === selectedOwner.toLowerCase()
  );
  
  const ownedJobs = jobs.filter(j => 
    selectedOwner && (j.owner || 'Workspace Owner').toLowerCase() === selectedOwner.toLowerCase()
  );

  const ownedPipelines = pipelines.filter(p => 
    selectedOwner && (p.owner || 'Workspace Owner').toLowerCase() === selectedOwner.toLowerCase()
  );

  // Columns for owned tables
  const tableCols = [
    {
      header: 'Table Full Name',
      accessor: 'name',
      render: (val, row) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          {row.catalog}.{row.schema}.{val}
        </span>
      )
    },
    {
      header: 'Medallion Schema',
      accessor: 'schema',
      render: (val) => <span className="badge badge-blue">{val}</span>
    },
    {
      header: 'Criticality',
      accessor: 'criticality',
      render: (val) => val ? (
        <span 
          className="badge"
          style={{
            backgroundColor: val === 'High' ? 'var(--color-rose-light)' : val === 'Medium' ? 'var(--color-amber-light)' : 'var(--color-emerald-light)',
            color: val === 'High' ? 'var(--color-rose)' : val === 'Medium' ? 'var(--color-amber)' : 'var(--color-emerald)'
          }}
        >
          {val}
        </span>
      ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (val, row) => (
        <button 
          className="btn btn-ghost" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          onClick={() => navigate(`/catalog/${row.catalog}/${row.schema}/${row.name}`)}
        >
          View Profile
        </button>
      )
    }
  ];

  // Columns for owned jobs
  const jobCols = [
    {
      header: 'Job Name',
      accessor: 'name',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <Workflow size={14} style={{ color: 'var(--color-violet)' }} />
          <span>{val}</span>
        </div>
      )
    },
    {
      header: 'Trigger Schedule',
      accessor: 'schedule'
    },
    {
      header: 'Active Status',
      accessor: 'active',
      render: (val) => (
        <span className={`badge ${val ? 'badge-emerald' : 'badge-rose'}`}>
          {val ? 'Active' : 'Paused'}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
          Workspace Ownership Center
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Explore assets categorised by owner, department, or active DevOps teams.
        </p>
      </div>

      {/* Main split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Owner teams selection cards */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Owner Teams
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ownersList.map(owner => (
              <button
                key={owner.name}
                onClick={() => setSelectedOwner(owner.name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedOwner === owner.name ? 'var(--color-blue-light)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: selectedOwner === owner.name ? 'var(--color-blue)' : 'var(--color-text)' }}>
                    {owner.name}
                  </span>
                  <span className="badge" style={{ fontSize: '0.6875rem', padding: '1px 5px', backgroundColor: 'var(--color-border)' }}>
                    {owner.count}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {owner.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Owned Assets details tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary counters card */}
          <div className="card" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderLeft: '4px solid var(--color-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>ACTIVE OWNER TEAM</div>
                <strong style={{ fontSize: '1.125rem' }}>{selectedOwner}</strong>
              </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '2rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>TABLES</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{ownedTables.length}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>WORKFLOW JOBS</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{ownedJobs.length}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>DLT PIPELINES</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{ownedPipelines.length}</div>
              </div>
            </div>
          </div>

          {/* Tables list */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} style={{ color: 'var(--color-blue)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Owned Unity Catalog Tables</h3>
            </div>
            <DataTable
              columns={tableCols}
              data={ownedTables}
              searchPlaceholder="Filter owned tables..."
              loading={loading}
              defaultPageSize={5}
              emptyMessage="No catalog tables assigned to this owner."
            />
          </div>

          {/* Jobs list */}
          {ownedJobs.length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Workflow size={16} style={{ color: 'var(--color-violet)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Owned Scheduled Spark Workflows</h3>
              </div>
              <DataTable
                columns={jobCols}
                data={ownedJobs}
                searchPlaceholder="Filter owned jobs..."
                loading={loading}
                defaultPageSize={5}
              />
            </div>
          )}

          {/* Pipelines list */}
          {ownedPipelines.length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} style={{ color: 'var(--color-emerald)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Owned Delta Live Tables</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {ownedPipelines.map(p => (
                  <div 
                    key={p.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--color-border)' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                      <Activity size={14} style={{ color: 'var(--color-emerald)' }} />
                      <span>{p.name}</span>
                    </div>
                    <span className="badge badge-emerald">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default OwnershipCenter;
