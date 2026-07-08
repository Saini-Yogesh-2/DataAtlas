import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import MetricCard from '../components/MetricCard';
import DataTable from '../components/DataTable';
import { 
  Database, 
  Workflow, 
  Activity, 
  Layers, 
  Cpu, 
  HardDrive, 
  FileClock, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

const Dashboard = () => {
  const { credentials, connectionDetails, logout, getRequestConfig, addNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/overview', getRequestConfig());
        setData(response.data);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        addNotification(`Could not load dashboard data: ${errMsg}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [credentials]);

  const kpis = data?.kpis || {};
  
  // Columns for the audit log
  const auditColumns = [
    {
      header: 'Change Type',
      accessor: 'type',
      render: (val) => (
        <span className={`badge ${val === 'SCHEMA' ? 'badge-blue' : val === 'OWNER' ? 'badge-emerald' : 'badge-amber'}`}>
          {val}
        </span>
      )
    },
    {
      header: 'Asset Name',
      accessor: 'asset',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{val}</span>
    },
    {
      header: 'Description',
      accessor: 'action'
    },
    {
      header: 'Modified By',
      accessor: 'user'
    },
    {
      header: 'Date Time',
      accessor: 'date',
      render: (val) => new Date(val).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
          Executive Overview
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Real-time catalog size, warehouse compute consumption, and metadata lineage indicators.
        </p>
      </div>

      {/* Secure Connection Call-to-Action Card */}
      {connectionDetails && connectionDetails.mode === 'Simulation' && (
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          border: '1px dashed var(--color-amber)',
          backgroundColor: 'rgba(245, 158, 11, 0.02)',
          padding: '1.25rem'
        }}>
          <div style={{ flex: '1 1 500px', display: 'flex', gap: '1rem', alignItems: 'start' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber)' }}>
              <Database size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)' }}>
                🔒 Analyze Your Live Databricks Workspace
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                You are currently viewing simulation data. Connect your live workspace to profile active Unity Catalogs, trace lineages, and run query previews. 
                Your credentials are held temporarily in secure browser state memory (`sessionStorage`) and <b style={{ color: 'var(--color-blue)' }}>never written on disk</b>, <b style={{ color: 'var(--color-blue)' }}>never written to any database</b>, and instantly cleared when you click Disconnect or close the browser tab.
              </p>
            </div>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={() => window.openConnectModal ? window.openConnectModal() : alert('Click the Connect Live DB button in the top header!')}
            style={{
              borderColor: 'var(--color-amber)',
              color: 'var(--color-amber)',
              backgroundColor: 'rgba(217, 119, 6, 0.05)',
              fontWeight: 600,
              padding: '10px 18px',
              fontSize: '0.875rem'
            }}
          >
            Connect Live Workspace
          </button>
        </div>
      )}

      {connectionDetails && connectionDetails.mode !== 'Simulation' && (
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--color-emerald)',
          backgroundColor: 'rgba(16, 185, 129, 0.02)',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-emerald)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Connected to Live Databricks: <strong>{connectionDetails.workspace || 'Workspace'}</strong> (Host: <code>{credentials?.host}</code>)
            </span>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={logout}
            style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-rose)', borderColor: 'var(--color-rose)' }}
          >
            Disconnect Session
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <MetricCard
          title="Catalogs"
          value={kpis.totalCatalogs}
          icon={FolderOpen}
          trendValue="+1"
          trendDirection="up"
          trendLabel="this month"
          loading={loading}
        />
        <MetricCard
          title="Schemas"
          value={kpis.totalSchemas}
          icon={Layers}
          loading={loading}
        />
        <MetricCard
          title="Tables & Views"
          value={`${kpis.totalTables || 0} / ${kpis.totalViews || 0}`}
          icon={Database}
          loading={loading}
        />
        <MetricCard
          title="Active Workflow Jobs"
          value={kpis.totalJobs}
          icon={Workflow}
          trendValue="Continuous"
          trendDirection="none"
          loading={loading}
        />
        <MetricCard
          title="DLT Pipelines"
          value={kpis.totalPipelines}
          icon={Activity}
          loading={loading}
        />
        <MetricCard
          title="Storage Consumption"
          value={kpis.storageSizeTb || '0 Bytes'}
          icon={HardDrive}
          loading={loading}
        />
        <MetricCard
          title="Data Freshness Index"
          value={kpis.dataFreshness || '100%'}
          icon={FileClock}
          trendValue="Excellent"
          trendDirection="up"
          loading={loading}
        />
        <MetricCard
          title="Critical / Unused Assets"
          value={`${kpis.criticalDatasets || 0} / ${kpis.unusedTables || 0}`}
          icon={AlertTriangle}
          trendValue="Ranked"
          trendDirection="none"
          loading={loading}
        />
      </div>

      {/* Analytics Charts split */}
      <div className="dashboard-charts-grid">
        {/* Storage Growth Area Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Storage Sizing Growth ({data?.storageUnit || 'TB'})</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Medallion warehouse cumulative footprint over 6 months</span>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            {loading ? (
              <div className="animate-pulse" style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: '8px' }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.storageGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="size" stroke="var(--color-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorSize)" name={`Size (${data?.storageUnit || 'TB'})`} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* DBU Compute Consumption Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Databricks Compute Usage (DBU)</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Active SQL Warehouse DBU consumption logs</span>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            {loading ? (
              <div className="animate-pulse" style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: '8px' }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.dbuUsage || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="DBUs" fill="var(--color-emerald)" radius={[4, 4, 0, 0]} name="DBU Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Table Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Metadata Audit Feed</h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Latest catalog updates, schema definitions, and ownership migrations.</span>
        </div>
        <DataTable
          columns={auditColumns}
          data={data?.recentChanges || []}
          searchPlaceholder="Filter audit records..."
          loading={loading}
          defaultPageSize={5}
        />
      </div>
    </div>
  );
};

export default Dashboard;
