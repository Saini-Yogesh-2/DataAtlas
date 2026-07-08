import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, Layers, Database, Workflow, Activity, FolderOpen, ArrowRight, CornerDownRight } from 'lucide-react';

const Search = () => {
  const navigate = useNavigate();
  const { getRequestConfig } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'catalog', 'schema', 'table', 'job', 'pipeline'

  // Debouncing search queries
  const typingTimeoutRef = useRef(null);

  const fetchSearchResults = async (searchStr) => {
    const q = (searchStr || '').trim();
    if (!q) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`/api/search?q=${q}`, getRequestConfig());
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(query);
    }, 150); // Small 150ms delay for natural instant typing response

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [query]);

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
  };

  // Filter local listings
  const filteredResults = results.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const getResultIcon = (type) => {
    switch (type) {
      case 'catalog': return <FolderOpen size={18} style={{ color: 'var(--color-blue)' }} />;
      case 'schema': return <Layers size={18} style={{ color: 'var(--color-blue)' }} />;
      case 'table': return <Database size={18} style={{ color: 'var(--color-blue)' }} />;
      case 'job': return <Workflow size={18} style={{ color: 'var(--color-violet)' }} />;
      case 'pipeline': return <Activity size={18} style={{ color: 'var(--color-emerald)' }} />;
      default: return <Database size={18} />;
    }
  };

  const getFilterBadgeClass = (type) => {
    switch (type) {
      case 'job': return 'badge-rose';
      case 'pipeline': return 'badge-emerald';
      default: return 'badge-blue';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
          Workspace Global Search
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Instant search across catalogs, schemas, tables, columns, owners, jobs, and pipelines.
        </p>
      </div>

      {/* Main search bar */}
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '4px 12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <SearchIcon size={20} style={{ color: 'var(--color-text-muted)', marginRight: '8px' }} />
        <input
          type="text"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            fontSize: '1rem',
            padding: '12px 6px',
            fontFamily: 'var(--font-sans)'
          }}
          placeholder="Type keywords (e.g. sales, customer_orders, raw, jobs, owner)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Split layout: Filter sidebar + Results pane */}
      <div className="search-grid">
        
        {/* Filter categories list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} />
            <span>Categories</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'all', label: 'All Assets' },
              { id: 'catalog', label: 'Catalogs' },
              { id: 'schema', label: 'Schemas' },
              { id: 'table', label: 'Tables & Views' },
              { id: 'job', label: 'Scheduled Jobs' },
              { id: 'pipeline', label: 'DLT Pipelines' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => handleFilterClick(f.id)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeFilter === f.id ? 'var(--color-blue-light)' : 'transparent',
                  color: activeFilter === f.id ? 'var(--color-blue)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: activeFilter === f.id ? 600 : 500,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== f.id) e.currentTarget.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== f.id) e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search results list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {loading ? (
            // SKELETON CARDS
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="card animate-pulse" style={{ height: '80px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '14px', width: '30%', backgroundColor: 'var(--color-border)', borderRadius: '4px' }} />
                <div style={{ height: '12px', width: '60%', backgroundColor: 'var(--color-border)', borderRadius: '4px' }} />
              </div>
            ))
          ) : !query.trim() ? (
            // INITIAL STATE
            <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Enter search keywords to query the Databricks workspace metadata catalog.
            </div>
          ) : filteredResults.length === 0 ? (
            // EMPTY STATE
            <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No catalog assets matched "<strong>{query}</strong>" in category "<strong>{activeFilter}</strong>".
            </div>
          ) : (
            // POPULATED RESULTS
            filteredResults.map(item => (
              <div 
                key={item.id}
                className="card card-hoverable"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  gap: '1rem',
                  cursor: 'pointer' 
                }}
                onClick={() => navigate(item.link)}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-border)' }}>
                    {getResultIcon(item.type)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: item.type === 'table' || item.type === 'schema' ? 'var(--font-mono)' : 'var(--font-sans)' }}>
                        {item.name}
                      </h3>
                      <span className={`badge ${getFilterBadgeClass(item.type)}`} style={{ fontSize: '0.625rem', textTransform: 'uppercase' }}>
                        {item.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {item.subtitle}
                    </span>
                    {item.comment && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {item.comment}
                      </p>
                    )}
                    {item.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        {item.tags.map(t => (
                          <span key={t} className="badge badge-blue" style={{ fontSize: '0.6875rem' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn btn-ghost" 
                  style={{ padding: '8px' }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
};

export default Search;
