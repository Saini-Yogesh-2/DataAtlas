import { getDatabricksConfig } from '../config/databricks.js';
import { AuthService } from '../services/authService.js';
import { CatalogService } from '../services/catalogService.js';
import { LineageService } from '../services/lineageService.js';
import { JobService } from '../services/jobService.js';
import { PipelineService } from '../services/pipelineService.js';
import { SearchService } from '../services/searchService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { ImpactService } from '../services/impactService.js';

// --- Auth Controllers ---
export async function testConnection(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const result = await AuthService.verifyCredentials(config);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// --- Catalog Controllers ---
export async function getCatalogs(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const catalogs = await CatalogService.getCatalogs(config);
    res.json(catalogs);
  } catch (error) {
    next(error);
  }
}

export async function getSchemas(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { catalog } = req.query;
    if (!catalog) {
      return res.status(400).json({ error: 'Query parameter "catalog" is required' });
    }
    const schemas = await CatalogService.getSchemas(config, catalog);
    res.json(schemas);
  } catch (error) {
    next(error);
  }
}

export async function getTables(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { catalog, schema } = req.query;
    if (!catalog || !schema) {
      return res.status(400).json({ error: 'Query parameters "catalog" and "schema" are required' });
    }
    const tables = await CatalogService.getTables(config, catalog, schema);
    res.json(tables);
  } catch (error) {
    next(error);
  }
}

export async function getAllTables(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const tableNames = await CatalogService.getAllTableNames(config);
    res.json(tableNames);
  } catch (error) {
    next(error);
  }
}

export async function getAllTablesMetadata(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const tables = await CatalogService.getAllTablesMetadata(config);
    res.json(tables);
  } catch (error) {
    next(error);
  }
}

export async function getTableDetails(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { catalog, schema, table } = req.query;
    if (!catalog || !schema || !table) {
      return res.status(400).json({ error: 'Query parameters "catalog", "schema", and "table" are required' });
    }
    const details = await CatalogService.getTableDetails(config, catalog, schema, table);
    if (!details) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json(details);
  } catch (error) {
    next(error);
  }
}

export async function getTableDeltaHistory(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { catalog, schema, table } = req.query;
    if (!catalog || !schema || !table) {
      return res.status(400).json({ error: 'Query parameters "catalog", "schema", and "table" are required' });
    }
    const history = await CatalogService.getTableDeltaHistory(config, catalog, schema, table);
    res.json(history);
  } catch (error) {
    next(error);
  }
}

export async function getTableSampleData(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { catalog, schema, table } = req.query;
    if (!catalog || !schema || !table) {
      return res.status(400).json({ error: 'Query parameters "catalog", "schema", and "table" are required' });
    }
    const sample = await CatalogService.getTableSampleData(config, catalog, schema, table);
    res.json(sample);
  } catch (error) {
    next(error);
  }
}

// --- Lineage Controllers ---
export async function getTableLineage(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { table } = req.query;
    if (!table) {
      return res.status(400).json({ error: 'Query parameter "table" is required' });
    }
    const lineage = await LineageService.getTableLineage(config, table);
    res.json(lineage);
  } catch (error) {
    next(error);
  }
}

export async function getColumnLineage(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { table, column } = req.query;
    if (!table || !column) {
      return res.status(400).json({ error: 'Query parameters "table" and "column" are required' });
    }
    const lineage = await LineageService.getColumnLineage(config, table, column);
    res.json(lineage);
  } catch (error) {
    next(error);
  }
}

export async function getRecursiveLineage(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { table } = req.query;
    if (!table) {
      return res.status(400).json({ error: 'Query parameter "table" is required' });
    }
    const graph = await LineageService.getRecursiveLineage(config, table);
    res.json(graph);
  } catch (error) {
    next(error);
  }
}

// --- Jobs & Pipelines Controllers ---
export async function getJobs(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const jobs = await JobService.getJobs(config);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

export async function getJobDetails(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const details = await JobService.getJobDetails(config, req.params.id);
    if (!details) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(details);
  } catch (error) {
    next(error);
  }
}

export async function getPipelines(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const pipelines = await PipelineService.getPipelines(config);
    res.json(pipelines);
  } catch (error) {
    next(error);
  }
}

export async function getPipelineDetails(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const details = await PipelineService.getPipelineDetails(config, req.params.id);
    if (!details) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    res.json(details);
  } catch (error) {
    next(error);
  }
}

// --- Search Controllers ---
export async function search(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { q } = req.query;
    const results = await SearchService.search(config, q);
    res.json(results);
  } catch (error) {
    next(error);
  }
}

// --- Analytics Controllers ---
export async function getOverviewAnalytics(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const analytics = await AnalyticsService.getOverviewAnalytics(config);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
}

// --- Impact Controllers ---
export async function getImpactAnalysis(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const { table } = req.query;
    if (!table) {
      return res.status(400).json({ error: 'Query parameter "table" is required' });
    }
    const analysis = await ImpactService.getImpactAnalysis(config, table);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
}

export async function getCriticalDatasets(req, res, next) {
  try {
    const config = getDatabricksConfig(req);
    const rankings = await ImpactService.getCriticalDatasets(config);
    res.json(rankings);
  } catch (error) {
    next(error);
  }
}


