import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import LineageGraph from '../components/LineageGraph';
import { Search, Database, Layers, X, Link, GitFork, Layout, BrainCircuit, FileSpreadsheet } from 'lucide-react';

const Lineage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { credentials, getRequestConfig, addNotification } = useApp();

  const selectedTable = searchParams.get('table') || '';

  // State
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [tableList, setTableList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected Node property side drawer
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [nodeDetails, setNodeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Reset selected table when credentials change (switching connection modes)
  useEffect(() => {
    setSearchParams({});
    setSearchTerm('');
  }, [credentials]);

  // 1. Fetch available tables list for search suggestions
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get('/api/catalog/all-tables', getRequestConfig());
        setTableList(res.data);
      } catch (err) {
        console.error('Error fetching tables index:', err);
      }
    };
    fetchTables();
  }, [credentials]);

  // 2. Fetch lineage graph nodes/edges for the active table
  useEffect(() => {
    if (!selectedTable) return;
    
    const fetchGraph = async () => {
      try {
        setLoading(true);
        setSelectedNodeId(selectedTable);
        const res = await axios.get(`/api/lineage/recursive?table=${selectedTable}`, getRequestConfig());
        const data = res.data;

        // If the API returned no nodes (table exists but has no tracked lineage),
        // show the table itself as a single standalone node instead of an error
        if (!data.nodes || data.nodes.length === 0) {
          const parts = selectedTable.split('.');
          setGraphData({
            nodes: [{ id: selectedTable, label: parts[parts.length - 1], type: 'table', schema: parts[1] || '' }],
            edges: []
          });
        } else {
          setGraphData(data);
        }
      } catch (err) {
        console.error('Error fetching lineage graph:', err);
        // Even on error — show the selected table as a lone node so the page is not blank
        const parts = selectedTable.split('.');
        setGraphData({
          nodes: [{ id: selectedTable, label: parts[parts.length - 1], type: 'table', schema: parts[1] || '' }],
          edges: []
        });
        addNotification(`Lineage data unavailable for ${selectedTable} — showing standalone node`, 'warning');
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [selectedTable]);

  // 3. Load node details when a node is clicked
  useEffect(() => {
    if (!selectedNodeId) {
      setNodeDetails(null);
      return;
    }

    const parts = selectedNodeId.split('.');
    if (parts.length !== 3) {
      // Non-table asset (Dashboard/Model/Report)
      let type = 'dashboard';
      if (selectedNodeId.includes('model')) type = 'model';
      else if (selectedNodeId.includes('report')) type = 'report';

      setNodeDetails({
        fullName: selectedNodeId,
        name: selectedNodeId.split('_').slice(1).join(' ').toUpperCase() || selectedNodeId,
        type: type.toUpperCase(),
        owner: 'Unknown',
        comment: `Downstream business asset. Asset type: ${type}.`
      });
      return;
    }

    const fetchNodeDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await axios.get(`/api/catalog/table/details?catalog=${parts[0]}&schema=${parts[1]}&table=${parts[2]}`, getRequestConfig());
        setNodeDetails({
          ...res.data,
          fullName: selectedNodeId
        });
      } catch (err) {
        console.error('Error loading node properties:', err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchNodeDetails();

  }, [selectedNodeId]);

  const selectSearchTable = (tbl) => {
    setSearchParams({ table: tbl });
    setSearchTerm('');
    setShowDropdown(false);
  };

  const filteredSuggestions = tableList.filter(t => 
    t.toLowerCase().includes(searchTerm.toLowerCase()) && t !== selectedTable
  );

  return (
    <div className="lineage-container">
      
      {/* Header and selector toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
            Interactive Lineage Explorer
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Map Unity Catalog table relationships. Double-click a table to open its catalog metadata profile.
          </p>
        </div>

        {/* Search autocomplete */}
        <div style={{ position: 'relative', width: '360px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search table to map..."
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
                    onClick={() => selectSearchTable(tbl)}
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

      {/* Main Viewport Grid */}
      <div className="lineage-viewport-wrapper">
        {/* Lineage flow diagram */}
        <div className="lineage-canvas-container">
          {loading ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              <div className="animate-pulse" style={{ fontSize: '1.25rem' }}>Mapping lineage coordinates...</div>
            </div>
          ) : (
            <LineageGraph
              nodesData={graphData.nodes}
              edgesData={graphData.edges}
              activeNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          )}
        </div>

        {/* Floating properties drawer */}
        {selectedNodeId && nodeDetails && (
          <div className="lineage-drawer animate-fade">
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span className="badge badge-blue" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                  {nodeDetails.type || 'TABLE'}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '4px' }}>
                  {nodeDetails.name || selectedNodeId.split('.').pop()}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedNodeId(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Properties content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Full Identifier:</span>
                <code style={{ display: 'block', padding: '4px', backgroundColor: 'var(--color-input)', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '4px', wordBreak: 'break-all' }}>
                  {nodeDetails.fullName}
                </code>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Owner / Custodian:</span>
                <div style={{ fontWeight: 600 }}>{nodeDetails.owner || '—'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Description:</span>
                <p style={{ color: 'var(--color-text)', marginTop: '2px' }}>
                  {nodeDetails.comment || 'No description registered.'}
                </p>
              </div>

              {nodeDetails.type === 'MANAGED' || nodeDetails.type === 'EXTERNAL' || nodeDetails.columns ? (
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Columns Schema:</span>
                  <div 
                    style={{ 
                      maxHeight: '120px', 
                      overflowY: 'auto', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: '6px', 
                      marginTop: '4px',
                      padding: '4px'
                    }}
                  >
                    {(nodeDetails.columns || []).map(col => (
                      <div key={col.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', borderBottom: '1px solid var(--color-border)' }}>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{col.name}</strong>
                        <span style={{ color: 'var(--color-text-muted)' }}>{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Actions link */}
            {nodeDetails.type !== 'DASHBOARD' && nodeDetails.type !== 'MODEL' && nodeDetails.type !== 'REPORT' && (
              <button 
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.5rem', marginTop: 'auto' }}
                onClick={() => {
                  const parts = nodeDetails.fullName.split('.');
                  navigate(`/catalog/${parts[0]}/${parts[1]}/${parts[2]}`);
                }}
              >
                <Database size={16} />
                <span>View Full Profile</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Lineage;
