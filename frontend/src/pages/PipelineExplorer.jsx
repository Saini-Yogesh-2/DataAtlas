import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { Activity, X, User, Clock, Settings, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

const PipelineExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { credentials, getRequestConfig, addNotification } = useApp();

  // Reset selected pipeline when connection status changes
  useEffect(() => {
    setSearchParams({});
  }, [credentials]);

  const selectedPipelineId = searchParams.get('pipelineId') || '';

  // State lists
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected pipeline details
  const [pipelineDetails, setPipelineDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Fetch all pipelines
  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/pipelines', getRequestConfig());
        setPipelines(res.data);
      } catch (err) {
        console.error('Error fetching pipelines:', err);
        addNotification('Could not load pipelines log', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPipelines();
  }, [credentials]);

  // 2. Fetch specific pipeline details on selectedPipelineId update
  useEffect(() => {
    if (!selectedPipelineId) {
      setPipelineDetails(null);
      return;
    }

    const fetchPipelineDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await axios.get(`/api/pipelines/${selectedPipelineId}`, getRequestConfig());
        setPipelineDetails(res.data);
      } catch (err) {
        console.error('Error loading pipeline details:', err);
        addNotification('Could not load pipeline details', 'error');
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchPipelineDetails();
  }, [selectedPipelineId]);

  const closeDrawer = () => {
    setSearchParams({});
  };

  // Columns for the pipelines listing
  const pipelineColumns = [
    {
      header: 'Pipeline ID',
      accessor: 'id',
      sortable: true,
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{val}</span>
    },
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
      header: 'Execution Schedule',
      accessor: 'schedule',
      sortable: true
    },
    {
      header: 'Workers Allocation',
      accessor: 'cluster_size'
    },
    {
      header: 'Owner',
      accessor: 'owner',
      sortable: true
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => (
        <span className={`badge ${val === 'RUNNING' ? 'badge-emerald' : val === 'DEPLOYING' ? 'badge-blue' : 'badge-rose'}`}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
          DLT Pipeline Explorer
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Inspect Delta Live Tables DLT streaming pipelines, active triggers, cluster worker scale, and dataset outputs.
        </p>
      </div>

      {/* Main split grid */}
      <div className={selectedPipelineId ? "explorer-grid-split" : "explorer-grid"}>
        {/* Pipelines DataTable */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <DataTable
            columns={pipelineColumns}
            data={pipelines}
            searchPlaceholder="Filter DLT pipelines by name, status, owner..."
            loading={loading}
            rowClickable={true}
            onRowClick={(row) => setSearchParams({ pipelineId: row.id })}
            selectedRowKey={selectedPipelineId || null}
            emptyMessage="No active DLT pipelines cataloged."
          />
        </div>

        {/* Selected Pipeline Drawer sidebar */}
        {selectedPipelineId && pipelineDetails && (
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
              borderLeft: pipelineDetails.status === 'RUNNING' ? '1px solid var(--color-border)' : '1px solid var(--color-rose)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span className={`badge ${pipelineDetails.status === 'RUNNING' ? 'badge-emerald' : 'badge-blue'}`} style={{ fontSize: '0.6875rem' }}>
                  {pipelineDetails.status}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                  {pipelineDetails.name}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {pipelineDetails.id}</span>
              </div>
              <button 
                onClick={closeDrawer}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* General Properties */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Owner: <strong>{pipelineDetails.owner}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Mode: <strong>{pipelineDetails.schedule} Execution</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Compute: <strong>{pipelineDetails.cluster_size}</strong></span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Inputs & Outputs mapping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Inputs */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Inputs (Sources)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {pipelineDetails.inputs?.length > 0 ? (
                    pipelineDetails.inputs.map(input => {
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No inputs listed.</span>
                  )}
                </div>
              </div>

              {/* Outputs */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Target Outputs (Tables)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {pipelineDetails.outputs?.length > 0 ? (
                    pipelineDetails.outputs.map(out => {
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No outputs listed.</span>
                  )}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Trigger/Run alert notifications */}
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <strong>DLT telemetry note:</strong> Real-time streaming metrics and detailed DLT cell schema validations are fetched continuously via the Databricks Event Log APIs.
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineExplorer;
