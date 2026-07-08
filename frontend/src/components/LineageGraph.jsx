import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Layout, BrainCircuit, FileSpreadsheet, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Custom Nodes for React Flow ---
const CustomTableNode = ({ data }) => {
  const isSelected = data.isSelected;
  const isHighlighted = data.isHighlighted;
  const isDimmed = data.isDimmed;
  
  const nodeIcon = () => {
    switch (data.type) {
      case 'dashboard': return <Layout size={16} style={{ color: 'var(--color-violet)' }} />;
      case 'model': return <BrainCircuit size={16} style={{ color: 'var(--color-rose)' }} />;
      case 'report': return <FileSpreadsheet size={16} style={{ color: 'var(--color-amber)' }} />;
      default: return <Database size={16} style={{ color: 'var(--color-blue)' }} />;
    }
  };

  const getBorderColor = () => {
    if (isSelected) return 'var(--color-blue)';
    if (isHighlighted) return 'var(--color-blue)';
    return 'var(--color-border)';
  };

  const getOpacity = () => {
    if (isDimmed) return 0.4;
    return 1;
  };

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        border: `2px solid ${getBorderColor()}`,
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-text)',
        minWidth: '220px',
        fontSize: '0.8125rem',
        boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'var(--shadow-md)',
        opacity: getOpacity(),
        transition: 'border-color 0.2s, opacity 0.2s, box-shadow 0.2s'
      }}
    >
      {/* Target input handle (left side) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: 'var(--color-blue)', width: '8px', height: '8px' }} 
      />

      {/* Node Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {data.schema ? `${data.id?.split('.')?.[0] || ''}.${data.schema}` : 'Downstream Asset'}
          </span>
          {data.type !== 'table' && (
            <span 
              className="badge" 
              style={{ 
                fontSize: '0.625rem', 
                padding: '1px 4px', 
                backgroundColor: data.type === 'dashboard' ? 'rgba(139, 92, 246, 0.1)' : data.type === 'model' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: data.type === 'dashboard' ? 'var(--color-violet)' : data.type === 'model' ? 'var(--color-rose)' : 'var(--color-amber)',
                textTransform: 'uppercase'
              }}
            >
              {data.type}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          {nodeIcon()}
          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.label}
          </span>
        </div>
      </div>

      {/* Source output handle (right side) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: 'var(--color-blue)', width: '8px', height: '8px' }} 
      />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomTableNode
};

/**
 * Lineage Graph Viewer using React Flow
 */
const LineageGraph = ({ nodesData = [], edgesData = [], activeNodeId = null, onSelectNode = () => {} }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const navigate = useNavigate();

  // Helper: Computes column-based medallion positions
  const getLayoutedElements = (rawNodes, rawEdges) => {
    const columnWidth = 320;
    const rowHeight = 120;
    
    // Categorize nodes into columns
    const columns = {
      raw: [],
      bronze: [],
      silver: [],
      gold: [],
      analytics: []
    };

    rawNodes.forEach(node => {
      if (node.type === 'dashboard' || node.type === 'model' || node.type === 'report') {
        columns.analytics.push(node);
      } else {
        const schema = (node.schema || '').toLowerCase();
        if (schema.startsWith('raw')) {
          columns.raw.push(node);
        } else if (schema.startsWith('bronze')) {
          columns.bronze.push(node);
        } else if (schema.startsWith('silver')) {
          columns.silver.push(node);
        } else if (schema.startsWith('gold')) {
          columns.gold.push(node);
        } else {
          columns.silver.push(node); // default fallback
        }
      }
    });

    const orderedKeys = ['raw', 'bronze', 'silver', 'gold', 'analytics'];
    const nodesMap = [];

    orderedKeys.forEach((key, colIdx) => {
      const colNodes = columns[key];
      const totalColHeight = colNodes.length * rowHeight;
      const startY = 150 - (totalColHeight / 2); // Center column around Y=150

      colNodes.forEach((node, rowIdx) => {
        nodesMap.push({
          id: node.id,
          type: 'customNode',
          position: { 
            x: colIdx * columnWidth + 40, 
            y: startY + rowIdx * rowHeight 
          },
          data: { 
            label: node.label, 
            schema: node.schema, 
            type: node.type,
            isSelected: activeNodeId === node.id,
            isHighlighted: false,
            isDimmed: false
          }
        });
      });
    });

    // Format edges for React Flow
    const flowEdges = rawEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: 'var(--color-border)', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6'
      }
    }));

    return { nodes: nodesMap, edges: flowEdges };
  };

  // Build the nodes/edges when props refresh
  useEffect(() => {
    if (nodesData.length === 0) return;
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodesData, edgesData);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodesData, edgesData, activeNodeId]);

  // Handle highlights on node hovering
  const highlightedElements = useMemo(() => {
    if (!hoveredNode) return null;
    
    const upstreams = new Set();
    const downstreams = new Set();
    
    // Find all directly connected nodes
    edgesData.forEach(edge => {
      if (edge.target === hoveredNode) upstreams.add(edge.source);
      if (edge.source === hoveredNode) downstreams.add(edge.target);
    });

    return { upstreams, downstreams };
  }, [hoveredNode, edgesData]);

  // Apply hover highlights to nodes state
  useEffect(() => {
    if (!hoveredNode) {
      setNodes(prev => prev.map(n => ({
        ...n,
        data: { ...n.data, isHighlighted: false, isDimmed: false, isSelected: activeNodeId === n.id }
      })));
      setEdges(prev => prev.map(e => ({
        ...e,
        animated: true,
        style: { stroke: 'var(--color-border)', strokeWidth: 2 }
      })));
      return;
    }

    const { upstreams, downstreams } = highlightedElements;

    setNodes(prev => prev.map(n => {
      const isSelf = n.id === hoveredNode;
      const isConnected = upstreams.has(n.id) || downstreams.has(n.id);
      
      return {
        ...n,
        data: {
          ...n.data,
          isHighlighted: isSelf || isConnected,
          isDimmed: !isSelf && !isConnected,
          isSelected: activeNodeId === n.id
        }
      };
    }));

    setEdges(prev => prev.map(e => {
      const isRelated = e.source === hoveredNode || e.target === hoveredNode;
      return {
        ...e,
        animated: isRelated,
        style: { 
          stroke: isRelated ? 'var(--color-blue)' : 'var(--color-border)', 
          strokeWidth: isRelated ? 3 : 1 
        }
      };
    }));

  }, [hoveredNode, highlightedElements, activeNodeId]);

  // Navigate to Table details page on double-click
  const onNodeDoubleClick = (event, node) => {
    if (node.data.type === 'table') {
      const parts = node.id.split('.');
      if (parts.length === 3) {
        navigate(`/catalog/${parts[0]}/${parts[1]}/${parts[2]}`);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(event, node) => onSelectNode(node.id)}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={(event, node) => setHoveredNode(node.id)}
        onNodeMouseLeave={() => setHoveredNode(null)}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
        <Background color="var(--color-border)" gap={16} size={1} />
        <MiniMap 
          nodeColor={() => 'var(--color-border)'}
          maskColor="rgba(0, 0, 0, 0.2)"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} 
        />
      </ReactFlow>
    </div>
  );
};

export default LineageGraph;
