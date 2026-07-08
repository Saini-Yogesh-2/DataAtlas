import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Metric Card Component for Executive Dashboards
 */
const MetricCard = ({
  title,
  value,
  icon: Icon,
  trendValue,
  trendDirection = 'none', // 'up', 'down', 'none'
  trendLabel = 'vs last period',
  progressScore = null, // if present, renders a horizontal progress bar
  progressColor = 'var(--color-blue)',
  loading = false
}) => {
  return (
    <div className="card card-hoverable" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
      {/* Title & Icon Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {title}
        </span>
        {Icon && (
          <div 
            style={{ 
              padding: '6px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--color-border)', 
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      {loading ? (
        <div 
          className="animate-pulse" 
          style={{ height: '36px', width: '60%', backgroundColor: 'var(--color-border)', borderRadius: '6px', margin: '4px 0' }} 
        />
      ) : (
        <div style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'var(--font-title)', color: 'var(--color-text)' }}>
          {value}
        </div>
      )}

      {/* Trend indicators or progress loaders */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          {/* Progress bar sparkline */}
          {progressScore !== null && (
            <div style={{ width: '100%', marginTop: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Usage Gauge</span>
                <span style={{ fontWeight: 600 }}>{progressScore}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${progressScore}%`, 
                    backgroundColor: progressColor, 
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease-out' 
                  }} 
                />
              </div>
            </div>
          )}

          {/* Trend pill labels */}
          {trendValue && trendDirection !== 'none' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
              <span 
                className="badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: trendDirection === 'up' ? 'var(--color-emerald-light)' : 'var(--color-rose-light)',
                  color: trendDirection === 'up' ? 'var(--color-emerald)' : 'var(--color-rose)',
                  fontWeight: 600
                }}
              >
                {trendDirection === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trendValue}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>{trendLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
