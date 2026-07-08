import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { Workflow, Play, Calendar, User, Cpu, Clock, X, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

const JobExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { credentials, getRequestConfig, addNotification } = useApp();

  // Reset selected job when connection status changes
  useEffect(() => {
    setSearchParams({});
  }, [credentials]);

  const selectedJobId = searchParams.get('jobId') || '';

  // State lists
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Job Details Drawer
  const [jobDetails, setJobDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/jobs', getRequestConfig());
        setJobs(res.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        addNotification('Could not load jobs catalog', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [credentials]);

  // 2. Fetch specific job details on ID update
  useEffect(() => {
    if (!selectedJobId) {
      setJobDetails(null);
      return;
    }

    const fetchJobDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await axios.get(`/api/jobs/${selectedJobId}`, getRequestConfig());
        setJobDetails(res.data);
      } catch (err) {
        console.error('Error loading job details:', err);
        addNotification('Could not load job run history', 'error');
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchJobDetails();
  }, [selectedJobId]);

  const closeDrawer = () => {
    setSearchParams({});
  };

  // Columns for the jobs listing
  const jobColumns = [
    {
      header: 'Job ID',
      accessor: 'id',
      sortable: true,
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{val}</span>
    },
    {
      header: 'Job Name',
      accessor: 'name',
      sortable: true,
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Workflow size={16} style={{ color: 'var(--color-violet)' }} />
          <span>{val}</span>
        </div>
      )
    },
    {
      header: 'Schedule (Cron)',
      accessor: 'schedule',
      render: (val) => val === 'Manual' ? <span style={{ color: 'var(--color-text-muted)' }}>Manual Trigger</span> : <code style={{ fontSize: '0.75rem' }}>{val}</code>
    },
    {
      header: 'Compute Target',
      accessor: 'cluster',
      sortable: true
    },
    {
      header: 'Owner',
      accessor: 'owner',
      sortable: true
    },
    {
      header: 'Status',
      accessor: 'active',
      sortable: true,
      render: (val) => (
        <span className={`badge ${val ? 'badge-emerald' : 'badge-rose'}`}>
          {val ? 'Enabled' : 'Paused'}
        </span>
      )
    }
  ];

  // Columns for job run history inside drawer
  const runHistoryCols = [
    {
      header: 'Run ID',
      accessor: 'run_id',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)' }}>#{val}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <span className={`badge ${val === 'SUCCESS' ? 'badge-emerald' : 'badge-rose'}`}>
          {val}
        </span>
      )
    },
    {
      header: 'Duration',
      accessor: 'duration_ms',
      render: (val) => `${(val / 1000).toFixed(1)}s`
    },
    {
      header: 'Start Time',
      accessor: 'start_time',
      render: (val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
          Workflow Job Explorer
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Inspect scheduled jobs, Spark runtimes, compute allocations, and dataset inputs and outputs.
        </p>
      </div>

      {/* Main split container */}
      <div className={selectedJobId ? "explorer-grid-split" : "explorer-grid"}>
        {/* Jobs List Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <DataTable
            columns={jobColumns}
            data={jobs}
            searchPlaceholder="Filter jobs by name, owner, cluster..."
            loading={loading}
            rowClickable={true}
            onRowClick={(row) => setSearchParams({ jobId: row.id })}
            selectedRowKey={selectedJobId ? Number(selectedJobId) : null}
            emptyMessage="No workflow jobs registered in workspace."
          />
        </div>

        {/* Selected Job Drawer sidebar */}
        {selectedJobId && jobDetails && (
          <div 
            className="card animate-fade"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'sticky',
              top: '80px',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              borderLeft: jobDetails.active ? '1px solid var(--color-border)' : '1px solid var(--color-rose)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span className={`badge ${jobDetails.active ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.6875rem' }}>
                  {jobDetails.active ? 'ACTIVE' : 'PAUSED'}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                  {jobDetails.name}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Job ID: {jobDetails.id}</span>
              </div>
              <button 
                onClick={closeDrawer}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Properties details grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Owner: <strong>{jobDetails.owner}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Schedule: <code style={{ fontSize: '0.75rem' }}>{jobDetails.schedule}</code></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Runtime: <strong>{jobDetails.runtime}</strong></span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Inputs & Outputs columns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Inputs */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Reads From (Inputs)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {jobDetails.inputs?.length > 0 ? (
                    jobDetails.inputs.map(input => {
                      const parts = input.split('.');
                      return (
                        <button
                          key={input}
                          className="btn btn-ghost"
                          style={{ justifyContent: 'start', width: '100%', padding: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                          onClick={() => parts.length === 3 && navigate(`/catalog/${parts[0]}/${parts[1]}/${parts[2]}`)}
                        >
                          <ExternalLink size={12} style={{ marginRight: '4px' }} />
                          <span>{input.split('.').pop()}</span>
                        </button>
                      );
                    })
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No database inputs listed.</span>
                  )}
                </div>
              </div>

              {/* Outputs */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Writes To (Outputs)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {jobDetails.outputs?.length > 0 ? (
                    jobDetails.outputs.map(out => {
                      const parts = out.split('.');
                      return (
                        <button
                          key={out}
                          className="btn btn-ghost"
                          style={{ justifyContent: 'start', width: '100%', padding: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                          onClick={() => parts.length === 3 && navigate(`/catalog/${parts[0]}/${parts[1]}/${parts[2]}`)}
                        >
                          <ExternalLink size={12} style={{ marginRight: '4px' }} />
                          <span>{out.split('.').pop()}</span>
                        </button>
                      );
                    })
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No database outputs listed.</span>
                  )}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Run history table */}
            <div>
              <h4 style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Recent Executions Run History
              </h4>
              <DataTable
                columns={runHistoryCols}
                data={jobDetails.recent_runs || []}
                loading={loadingDetails}
                searchPlaceholder="Filter runs..."
                defaultPageSize={3}
                emptyMessage="No runs executed recently."
              />
            </div>

            {/* Error notifications inside drawer */}
            {jobDetails.recent_runs?.some(r => r.status === 'FAILED') && (
              <div 
                style={{ 
                  padding: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: 'var(--color-rose-light)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '6px',
                  color: 'var(--color-rose)'
                }}
              >
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Task failure alert:</strong> Last run failed with error: 
                  <code style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px', borderRadius: '4px', marginTop: '2px' }}>
                    {jobDetails.recent_runs.find(r => r.status === 'FAILED')?.error || 'Driver aborted.'}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobExplorer;
