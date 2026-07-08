import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search, Inbox } from 'lucide-react';

/**
 * Enterprise Reusable Data Table Component
 * Supports sorting, search, pagination, loading states, and custom rendering
 */
const DataTable = ({
  columns,
  data = [],
  searchPlaceholder = 'Filter records...',
  emptyMessage = 'No matching assets found.',
  loading = false,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  rowClickable = false,
  onRowClick = () => {},
  selectedRowKey = null // for highlighted selection state
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset pagination on search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Trigger sorting config
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // 1. Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      return columns.some((col) => {
        const val = row[col.accessor];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, columns]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination limits
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Table search toolbar */}
      {!loading && data.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '320px' }}>
            <Search 
              size={16} 
              style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} 
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '32px' }}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            Total: <strong>{filteredData.length}</strong> records
          </div>
        </div>
      )}

      {/* Main Table Structure */}
      <div 
        style={{ 
          border: '1px solid var(--color-border)', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          backgroundColor: 'var(--color-card)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table 
            style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              textAlign: 'left',
              fontSize: '0.875rem'
            }}
          >
            {/* Header elements */}
            <thead>
              <tr 
                style={{ 
                  backgroundColor: 'var(--color-card-hover)', 
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600
                }}
              >
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    style={{ 
                      padding: '12px 16px', 
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => col.sortable && handleSort(col.accessor)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {col.header}
                      {col.sortable && sortConfig.key === col.accessor && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body elements */}
            <tbody>
              {loading ? (
                // SKELETON LOADERS
                Array.from({ length: pageSize }).map((_, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} style={{ padding: '16px' }}>
                        <div 
                          className="animate-pulse" 
                          style={{ 
                            height: '14px', 
                            backgroundColor: 'var(--color-border)', 
                            borderRadius: '4px',
                            width: cIdx === 0 ? '70%' : '45%' 
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                      <Inbox size={40} strokeWidth={1.5} />
                      <span style={{ fontWeight: 500 }}>{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                // POPULATED ROWS
                paginatedData.map((row, rIdx) => {
                  const rowKey = row.fullName || row.id || rIdx;
                  const isSelected = selectedRowKey && selectedRowKey === rowKey;
                  
                  return (
                    <tr
                      key={rowKey}
                      onClick={() => rowClickable && onRowClick(row)}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        cursor: rowClickable ? 'pointer' : 'default',
                        backgroundColor: isSelected ? 'var(--color-blue-light)' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                      className={rowClickable ? 'table-row-hover' : ''}
                      onMouseEnter={(e) => {
                        if (rowClickable && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--color-card-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (rowClickable && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {columns.map((col) => (
                        <td key={col.accessor} style={{ padding: '12px 16px', color: 'var(--color-text)', verticalAlign: 'middle' }}>
                          {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Toolbar */}
        {!loading && sortedData.length > pageSize && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 16px', 
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card-hover)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              <span>Show</span>
              <select
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-text)',
                  outline: 'none'
                }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {pageSizeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span>per page</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
