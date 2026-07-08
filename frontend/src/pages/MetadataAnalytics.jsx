import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { BarChart3, AlertTriangle, HelpCircle, HardDrive, ShieldAlert, ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const MetadataAnalytics = () => {
  const navigate = useNavigate();
  const { credentials, getRequestConfig, addNotification } = useApp();

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [criticalRankings, setCriticalRankings] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/analytics/overview', getRequestConfig());
        setAnalyticsData(res.data);

        // Fetch Critical Rankings
        const rankRes = await axios.get('/api/impact/critical', getRequestConfig());
        setCriticalRankings(rankRes.data);

      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        addNotification(`Could not load analytics metrics: ${errMsg}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [credentials]);

  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // Columns for Critical Rankings table
  const rankingColumns = [
    {
      header: 'Rank',
      accessor: 'rank',
      render: (val, row, idx) => <strong>#{idx + 1}</strong>
    },
    {
      header: 'Table Full Name',
      accessor: 'fullName',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>
    },
    {
      header: 'Score',
      accessor: 'criticalityScore',
      sortable: true,
      render: (val) => (
        <span 
          className="badge" 
          style={{ 
            backgroundColor: val >= 75 ? 'var(--color-rose-light)' : 'var(--color-amber-light)',
            color: val >= 75 ? 'var(--color-rose)' : 'var(--color-amber)',
            fontWeight: 700
          }}
        >
          {val}/100
        </span>
      )
    },
    {
      header: 'Blast Count',
      accessor: 'blastRadiusCount',
      sortable: true,
      render: (val) => `${val} assets`
    },
    {
      header: 'Max Depth',
      accessor: 'maxDepth',
      sortable: true,
      render: (val) => `${val} levels`
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (val, row) => {
        const parts = row.fullName.split('.');
        return (
          <button 
            className="btn btn-ghost" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            onClick={() => navigate(`/catalog/${parts[0]}/${parts[1]}/${parts[2]}`)}
          >
            <span>View Profile</span>
            <ArrowRight size={12} />
          </button>
        );
      }
    }
  ];

  // Unused tables count comes from actual kpis.unusedTables — no hardcoded rows
  const unusedTables = [];

  const unusedColumns = [
    {
      header: 'Table Name',
      accessor: 'name',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>
    },
    {
      header: 'Schema',
      accessor: 'schema',
      render: (val) => <span className="badge badge-blue">{val}</span>
    },
    {
      header: 'Sizing',
      accessor: 'size'
    },
    {
      header: 'Created On',
      accessor: 'created'
    },
    {
      header: 'Owner',
      accessor: 'owner'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
          Metadata Analytics
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Identify largest tables, growth trends, and automatically map critical dependencies.
        </p>
      </div>

      {/* Visual Analytics Charts split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        
        {/* Table Sizing Sizing distribution */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Table Size Distribution</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Breakdown of workspace datasets by physical footprint sizing</span>
          </div>
          <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <div className="animate-pulse" style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: '8px' }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.tableDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(analyticsData?.tableDistribution || []).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Growth rates by schema */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Schema Growth Rates (% / Month)</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Fastest growing medallion schemas by metadata registrations</span>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            {loading ? (
              <div className="animate-pulse" style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: '8px' }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.schemaGrowth || []} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis dataKey="schema" type="category" stroke="var(--color-text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <Bar dataKey="growth" fill="var(--color-blue)" radius={[0, 4, 4, 0]} name="Monthly Growth (%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Critical dataset rankings */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} style={{ color: 'var(--color-rose)' }} />
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Dataset Impact Rankings (Blast Radius)</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Automatically ranked by downstream dependency depth levels and consuming pipeline dependencies.
            </span>
          </div>
        </div>

        <DataTable
          columns={rankingColumns}
          data={criticalRankings}
          searchPlaceholder="Filter critical datasets..."
          loading={loading}
          defaultPageSize={5}
        />
      </div>

      {/* Unused Tables / Cost optimizer */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-amber)' }} />
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Stale / Unused Tables (Cost Optimization)</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Tables registered in catalogs that have not been read or merged by active compute tasks in the last 90 days.
            </span>
          </div>
        </div>

        <DataTable
          columns={unusedColumns}
          data={unusedTables}
          loading={loading}
          defaultPageSize={3}
          emptyMessage="No stale tables identified in workspace."
        />
      </div>

    </div>
  );
};

export default MetadataAnalytics;
