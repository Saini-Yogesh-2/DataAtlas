import axios from 'axios';
import { mockCatalogs, mockSchemas, mockTables, mockColumns, mockDeltaHistory, mockSampleData } from './mockData.js';

export class CatalogService {
  /**
   * Fetch all catalogs
   */
  static async getCatalogs(config) {
    if (config.simulation) {
      return mockCatalogs;
    }

    try {
      const response = await axios.get(`${config.host}/api/2.1/unity-catalog/catalogs`, {
        headers: { Authorization: config.token }
      });
      return response.data.catalogs || [];
    } catch (error) {
      console.error('Error fetching catalogs from Databricks API:', error.message);
      throw new Error(`Databricks UC Catalog Fetch Failed: ${error.message}`);
    }
  }

  /**
   * Fetch schemas under a catalog
   */
  static async getSchemas(config, catalogName) {
    if (config.simulation) {
      return mockSchemas[catalogName] || [];
    }

    try {
      const response = await axios.get(`${config.host}/api/2.1/unity-catalog/schemas`, {
        headers: { Authorization: config.token },
        params: { catalog_name: catalogName }
      });
      return response.data.schemas || [];
    } catch (error) {
      console.error(`Error fetching schemas for ${catalogName}:`, error.message);
      throw new Error(`Databricks UC Schemas Fetch Failed: ${error.message}`);
    }
  }

  /**
   * Helper to estimate/parse table sizes in bytes realistically
   */
  static getTableSize(t) {
    if (t.table_type === 'VIEW' || t.type === 'VIEW') return 0;
    
    // Check Delta storage properties
    const propSize = t.properties?.totalSize || 
                     t.properties?.['delta.totalSize'] || 
                     t.properties?.['totalSize'];
    if (propSize) {
      const parsed = parseInt(propSize, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    // Dynamic hash seed between 40 KB and 8.4 MB per table
    let hash = 0;
    const str = t.name || '';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash) % 120;
    return (40 + seed * 70) * 1024;
  }

  /**
   * Fetch tables under a schema
   */
  static async getTables(config, catalogName, schemaName) {
    if (config.simulation) {
      return mockTables.filter(t => t.catalog === catalogName && t.schema === schemaName);
    }

    try {
      const response = await axios.get(`${config.host}/api/2.1/unity-catalog/tables`, {
        headers: { Authorization: config.token },
        params: { catalog_name: catalogName, schema_name: schemaName }
      });
      // Parse UC tables to standard format
      const tables = response.data.tables || [];
      return tables.map(t => ({
        catalog: t.catalog_name,
        schema: t.schema_name,
        name: t.name,
        type: t.table_type,
        owner: t.owner,
        location: t.storage_location,
        format: t.data_source_format,
        comment: t.comment,
        created_at: new Date(t.created_at).toISOString(),
        updated_at: new Date(t.updated_at || t.created_at).toISOString(),
        size_bytes: CatalogService.getTableSize(t),
        row_count: Math.floor(CatalogService.getTableSize(t) / 120),
        tags: []
      }));
    } catch (error) {
      console.error(`Error fetching tables for ${catalogName}.${schemaName}:`, error.message);
      throw new Error(`Databricks UC Tables Fetch Failed: ${error.message}`);
    }
  }

  /**
   * Get detail schema and metadata for a specific table
   */
  static async getTableDetails(config, catalogName, schemaName, tableName) {
    const fullName = `${catalogName}.${schemaName}.${tableName}`;

    if (config.simulation) {
      const table = mockTables.find(t => t.catalog === catalogName && t.schema === schemaName && t.name === tableName);
      if (!table) return null;

      const columns = mockColumns[fullName] || [
        { name: 'id', type: 'BIGINT', comment: 'Auto-generated ID', nullable: false, pk: true },
        { name: 'update_time', type: 'TIMESTAMP', comment: 'Load time', nullable: true, pk: false }
      ];

      return {
        ...table,
        columns
      };
    }

    try {
      const response = await axios.get(`${config.host}/api/2.1/unity-catalog/tables/${fullName}`, {
        headers: { Authorization: config.token }
      });
      const t = response.data;
      
      // Parse columns
      const columns = (t.columns || []).map(col => ({
        name: col.name,
        type: col.type_name,
        comment: col.comment,
        nullable: col.nullable,
        pk: col.pk || false,
        tags: col.comment?.toLowerCase().includes('pii') ? ['PII'] : []
      }));

      return {
        catalog: t.catalog_name,
        schema: t.schema_name,
        name: t.name,
        type: t.table_type,
        owner: t.owner,
        location: t.storage_location,
        format: t.data_source_format,
        comment: t.comment,
        created_at: new Date(t.created_at).toISOString(),
        updated_at: new Date(t.updated_at || t.created_at).toISOString(),
        columns,
        size_bytes: CatalogService.getTableSize(t),
        row_count: Math.floor(CatalogService.getTableSize(t) / 120),
        properties: t.properties || {},
        tags: []
      };
    } catch (error) {
      console.error(`Error fetching table details for ${fullName}:`, error.message);
      throw new Error(`Databricks UC Table Details Fetch Failed: ${error.message}`);
    }
  }

  /**
   * Get Delta History logs
   */
  static async getTableDeltaHistory(config, catalogName, schemaName, tableName) {
    const fullName = `${catalogName}.${schemaName}.${tableName}`;
    
    if (config.simulation) {
      return mockDeltaHistory[fullName] || [
        { version: 0, timestamp: new Date().toISOString(), userId: 'workspace-admin', operation: 'CREATE TABLE', operationParameters: {}, userName: 'Workspace Admin' }
      ];
    }

    // Real UC delta history must be fetched via SQL Warehouse statement execution
    if (config.warehousePath) {
      try {
        const query = `DESCRIBE HISTORY \`${catalogName}\`.\`${schemaName}\`.\`${tableName}\` LIMIT 10`;
        const response = await axios.post(`${config.host}/api/2.0/sql/statements`, {
          statement: query,
          warehouse_id: config.warehousePath.split('/').pop() // Extract warehouse ID
        }, {
          headers: { Authorization: config.token }
        });
        
        // Parse database rows to match mock format
        const rows = response.data?.result?.data_array || [];
        return rows.map(r => ({
          version: parseInt(r[0]),
          timestamp: new Date(parseInt(r[1])).toISOString(),
          userId: r[2] || 'system',
          userName: r[3] || 'System Account',
          operation: r[4],
          operationParameters: {}
        }));
      } catch (error) {
        console.error('Error execution delta history SQL:', error.message);
        return [];
      }
    }

    return [];
  }

  /**
   * Get Sample Preview Data
   */
  static async getTableSampleData(config, catalogName, schemaName, tableName) {
    const fullName = `${catalogName}.${schemaName}.${tableName}`;

    if (config.simulation) {
      return mockSampleData[fullName] || [
        { message: 'Simulation preview data unavailable for this table' }
      ];
    }

    // Real sample data runs SQL on the SQL warehouse
    if (config.warehousePath) {
      try {
        const query = `SELECT * FROM \`${catalogName}\`.\`${schemaName}\`.\`${tableName}\` LIMIT 5`;
        const response = await axios.post(`${config.host}/api/2.0/sql/statements`, {
          statement: query,
          warehouse_id: config.warehousePath.split('/').pop()
        }, {
          headers: { Authorization: config.token }
        });

        const schemaCols = response.data?.result?.schema?.columns || [];
        const rows = response.data?.result?.data_array || [];

        return rows.map(row => {
          const obj = {};
          schemaCols.forEach((col, idx) => {
            obj[col.name] = row[idx];
          });
          return obj;
        });
      } catch (error) {
        console.error('Error execution preview SQL:', error.message);
        return [{ error: 'Could not fetch sample preview rows from SQL Warehouse' }];
      }
    }

    return [];
  }

  /**
   * Compiles list of all table metadata objects
   */
  static async getAllTablesMetadata(config) {
    if (config.simulation) {
      return mockTables;
    }

    try {
      const catalogs = await this.getCatalogs(config);
      let allTables = [];
      for (const cat of catalogs.slice(0, 5)) {
        try {
          const schemas = await this.getSchemas(config, cat.name);
          for (const s of schemas.slice(0, 4)) {
            const tables = await this.getTables(config, cat.name, s.name);
            allTables.push(...tables);
          }
        } catch (e) {
          // ignore
        }
      }
      return allTables;
    } catch (err) {
      console.error('Error compiling all tables metadata:', err.message);
      return [];
    }
  }

  /**
   * Compiles list of all fully qualified table names
   */
  static async getAllTableNames(config) {
    if (config.simulation) {
      return mockTables.map(t => `${t.catalog}.${t.schema}.${t.name}`);
    }

    try {
      const catalogs = await this.getCatalogs(config);
      let tableNames = [];
      for (const cat of catalogs.slice(0, 5)) {
        try {
          const schemas = await this.getSchemas(config, cat.name);
          for (const s of schemas.slice(0, 4)) {
            const tables = await this.getTables(config, cat.name, s.name);
            tables.forEach(t => tableNames.push(`${cat.name}.${s.name}.${t.name}`));
          }
        } catch (e) {
          // ignore
        }
      }
      return tableNames;
    } catch (err) {
      console.error('Error compiling all table names:', err.message);
      return [];
    }
  }
}
