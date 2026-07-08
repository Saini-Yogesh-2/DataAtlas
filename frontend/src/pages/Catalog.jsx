import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { FolderOpen, Layers, Database, ChevronRight, HardDrive, ShieldAlert } from 'lucide-react';

const Catalog = () => {
  const { credentials, getRequestConfig, addNotification } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters from URL for bookmarking views
  const selectedCatalog = searchParams.get('catalog') || '';
  const selectedSchema = searchParams.get('schema') || '';

  // Local lists
  const [catalogs, setCatalogs] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [tables, setTables] = useState([]);

  // Load flags
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  // 1. Load Catalogs
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        const res = await axios.get('/api/catalog/catalogs', getRequestConfig());
        setCatalogs(res.data);
        
        // Auto-select first catalog if none selected
        if (!selectedCatalog && res.data.length > 0) {
          setSearchParams({ catalog: res.data[0].name });
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        addNotification(`Could not load catalogs list: ${errMsg}`, 'error');
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, [credentials]);

  // Clear catalog and schema parameters when connection changes to prevent 404s
  useEffect(() => {
    setSearchParams({});
  }, [credentials]);

  // 2. Load Schemas on Catalog Change
  useEffect(() => {
    if (!selectedCatalog) return;

    const fetchSchemas = async () => {
      try {
        setLoadingSchemas(true);
        setSchemas([]);
        setTables([]);
        const res = await axios.get(`/api/catalog/schemas?catalog=${selectedCatalog}`, getRequestConfig());
        setSchemas(res.data);

        // Auto-select first schema if none selected
        if (!selectedSchema && res.data.length > 0) {
          setSearchParams({ catalog: selectedCatalog, schema: res.data[0].name });
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        addNotification(`Could not load schema structures: ${errMsg}`, 'error');
      } finally {
        setLoadingSchemas(false);
      }
    };
    fetchSchemas();
  }, [selectedCatalog]);

  // 3. Load Tables on Schema Change
  useEffect(() => {
    if (!selectedCatalog || !selectedSchema) return;

    const fetchTables = async () => {
      try {
        setLoadingTables(true);
        setTables([]);
        const res = await axios.get(`/api/catalog/tables?catalog=${selectedCatalog}&schema=${selectedSchema}`, getRequestConfig());
        setTables(res.data);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        addNotification(`Could not load table inventory: ${errMsg}`, 'error');
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, [selectedCatalog, selectedSchema]);

  const selectCatalog = (catName) => {
    setSearchParams({ catalog: catName });
  };

  const selectSchema = (schemaName) => {
    setSearchParams({ catalog: selectedCatalog, schema: schemaName });
  };

  // Columns for the tables overview list
  const tableColumns = [
    {
      header: 'Table Name',
      accessor: 'name',
      sortable: true,
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Database size={16} style={{ color: 'var(--color-blue)' }} />
          <span>{val}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {val}
        </span>
      )
    },
    {
      header: 'Criticality',
      accessor: 'criticality',
      sortable: true,
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
      header: 'Owner',
      accessor: 'owner',
      sortable: true
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
          Data Catalog
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Browse catalogs, schemas, tables, and views registered within Unity Catalog.
        </p>
      </div>

      {/* Tri-pane catalog browser */}
      <div className="catalog-grid">
        
        {/* Pane 1: Catalogs Selector */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Catalogs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loadingCatalogs ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse" style={{ height: '36px', backgroundColor: 'var(--color-border)', borderRadius: '6px' }} />
              ))
            ) : (
              catalogs.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => selectCatalog(cat.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedCatalog === cat.name ? 'var(--color-blue-light)' : 'transparent',
                    color: selectedCatalog === cat.name ? 'var(--color-blue)' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontWeight: selectedCatalog === cat.name ? 600 : 500,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOpen size={16} />
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: selectedCatalog === cat.name ? 1 : 0 }} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Pane 2: Schemas Selector */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Schemas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loadingSchemas ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse" style={{ height: '36px', backgroundColor: 'var(--color-border)', borderRadius: '6px' }} />
              ))
            ) : schemas.length === 0 ? (
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', padding: '0.5rem' }}>Select a catalog</span>
            ) : (
              schemas.map(sch => (
                <button
                  key={sch.name}
                  onClick={() => selectSchema(sch.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedSchema === sch.name ? 'var(--color-blue-light)' : 'transparent',
                    color: selectedSchema === sch.name ? 'var(--color-blue)' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontWeight: selectedSchema === sch.name ? 600 : 500,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} />
                    <span>{sch.name}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: selectedSchema === sch.name ? 1 : 0 }} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Pane 3: Tables list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              Tables and Views
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Showing tables located under <strong style={{ color: 'var(--color-text)' }}>{selectedCatalog || '—'}.{selectedSchema || '—'}</strong>
            </span>
          </div>

          <DataTable
            columns={tableColumns}
            data={tables}
            searchPlaceholder="Filter tables by name, owner..."
            loading={loadingTables}
            rowClickable={true}
            onRowClick={(row) => navigate(`/catalog/${selectedCatalog}/${selectedSchema}/${row.name}`)}
            emptyMessage="No tables exist in this schema."
          />
        </div>

      </div>
    </div>
  );
};

export default Catalog;
