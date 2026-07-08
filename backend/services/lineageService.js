import axios from 'axios';
import { mockTableLineage, mockColumnLineage } from './mockData.js';

export class LineageService {
  /**
   * Fetch table-level lineage
   * Upstreams and downstreams for a given table name
   */
  static async getTableLineage(config, tableName) {
    if (config.simulation) {
      const upstreams = mockTableLineage.upstreams[tableName] || [];
      const downstreams = mockTableLineage.downstreams[tableName] || [];
      return {
        upstreams,
        downstreams,
        currentTable: tableName
      };
    }

    try {
      // Fetch upstream table lineage
      const upstreamRes = await axios.get(`${config.host}/api/2.0/lineage-tracking/table-lineage`, {
        headers: { Authorization: config.token },
        params: { table_name: tableName, direction: 'UPSTREAM' }
      }).catch(() => ({ data: { upstreams: [] } }));

      // Fetch downstream table lineage
      const downstreamRes = await axios.get(`${config.host}/api/2.0/lineage-tracking/table-lineage`, {
        headers: { Authorization: config.token },
        params: { table_name: tableName, direction: 'DOWNSTREAM' }
      }).catch(() => ({ data: { downstreams: [] } }));

      // Map safely checking table_name, tableInfo.name, or name, and filter out any empty values
      const upstreams = (upstreamRes.data.upstreams || [])
        .map(u => u.table_name || u.tableInfo?.name || u.name)
        .filter(Boolean);

      const downstreams = (downstreamRes.data.downstreams || [])
        .map(d => d.table_name || d.tableInfo?.name || d.name)
        .filter(Boolean);

      return {
        upstreams,
        downstreams,
        currentTable: tableName
      };
    } catch (error) {
      console.error(`Error fetching table lineage for ${tableName}:`, error.message);
      return { upstreams: [], downstreams: [], currentTable: tableName };
    }
  }

  /**
   * Fetch column-level lineage
   */
  static async getColumnLineage(config, tableName, columnName) {
    const fullColName = `${tableName}.${columnName}`;

    if (config.simulation) {
      const relations = mockColumnLineage[fullColName] || [];
      return {
        column: fullColName,
        dependencies: relations
      };
    }

    try {
      const response = await axios.get(`${config.host}/api/2.0/lineage-tracking/column-lineage`, {
        headers: { Authorization: config.token },
        params: { table_name: tableName, column_name: columnName }
      });
      return {
        column: fullColName,
        dependencies: (response.data.upstream_cols || []).map(c => ({
          upstream: `${c.table_name}.${c.name}`,
          type: 'DIRECT'
        }))
      };
    } catch (error) {
      console.error(`Error fetching column lineage for ${fullColName}:`, error.message);
      return { column: fullColName, dependencies: [] };
    }
  }

  /**
   * Get recursive dependencies (all descendants and ancestors)
   * Helpful for rendering the complete end-to-end dependency tree
   */
  static async getRecursiveLineage(config, tableName) {
    if (config.simulation) {
      // Build a full graph map
      const graphNodes = new Set();
      const graphEdges = [];
      const visited = new Set();

      const traverse = (node, direction) => {
        if (visited.has(`${node}-${direction}`)) return;
        visited.add(`${node}-${direction}`);
        graphNodes.add(node);

        const neighbors = direction === 'upstream' 
          ? (mockTableLineage.upstreams[node] || [])
          : (mockTableLineage.downstreams[node] || []);

        neighbors.forEach(neighbor => {
          graphNodes.add(neighbor);
          const edgeId = direction === 'upstream' ? `${neighbor}->${node}` : `${node}->${neighbor}`;
          
          if (!graphEdges.some(e => e.id === edgeId)) {
            graphEdges.push({
              id: edgeId,
              source: direction === 'upstream' ? neighbor : node,
              target: direction === 'upstream' ? node : neighbor
            });
          }
          traverse(neighbor, direction);
        });
      };

      traverse(tableName, 'upstream');
      traverse(tableName, 'downstream');

      return {
        nodes: Array.from(graphNodes).map(n => {
          // Attempt to locate table metadata for display properties
          const parts = n.split('.');
          const isRealTable = parts.length === 3;
          let label = parts[parts.length - 1];
          let type = 'table';
          let schema = '';
          
          if (isRealTable) {
            schema = parts[1];
          } else {
            type = n.includes('dashboard') ? 'dashboard' : n.includes('model') ? 'model' : 'report';
          }

          return { id: n, label, type, schema };
        }),
        edges: graphEdges
      };
    }

    // For a real database environment, retrieve details by recursively merging individual table lineage lookups
    const nodes = new Map();
    const edges = [];
    const queue = [{ id: tableName, dir: 'both' }];
    const processed = new Set();

    // Limit runs to prevent loop locks
    let iterations = 0;
    while (queue.length > 0 && iterations < 30) {
      iterations++;
      const current = queue.shift();
      if (!current || !current.id) continue;
      if (processed.has(current.id)) continue;
      processed.add(current.id);

      const parts = current.id.split('.');
      const label = parts[parts.length - 1];
      const type = parts.length === 3 ? 'table' : 'asset';
      nodes.set(current.id, { id: current.id, label, type, schema: parts[1] || '' });

      const lin = await this.getTableLineage(config, current.id);
      if (!lin) continue;

      if (current.dir === 'both' || current.dir === 'upstream') {
        (lin.upstreams || []).forEach(up => {
          if (!up) return;
          const edgeId = `${up}->${current.id}`;
          if (!edges.some(e => e.id === edgeId)) {
            edges.push({ id: edgeId, source: up, target: current.id });
          }
          queue.push({ id: up, dir: 'upstream' });
        });
      }

      if (current.dir === 'both' || current.dir === 'downstream') {
        (lin.downstreams || []).forEach(down => {
          if (!down) return;
          const edgeId = `${current.id}->${down}`;
          if (!edges.some(e => e.id === edgeId)) {
            edges.push({ id: edgeId, source: current.id, target: down });
          }
          queue.push({ id: down, dir: 'downstream' });
        });
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges
    };
  }
}
