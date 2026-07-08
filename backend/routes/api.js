import express from 'express';
import {
  testConnection,
  getCatalogs,
  getSchemas,
  getTables,
  getAllTables,
  getAllTablesMetadata,
  getTableDetails,
  getTableDeltaHistory,
  getTableSampleData,
  getTableLineage,
  getColumnLineage,
  getRecursiveLineage,
  getJobs,
  getJobDetails,
  getPipelines,
  getPipelineDetails,
  search,
  getOverviewAnalytics,
  getImpactAnalysis,
  getCriticalDatasets
} from '../controllers/apiController.js';

const router = express.Router();

// Test Connection
router.post('/auth/test', testConnection);

// Catalog Routes
router.get('/catalog/catalogs', getCatalogs);
router.get('/catalog/schemas', getSchemas);
router.get('/catalog/tables', getTables);
router.get('/catalog/all-tables', getAllTables);
router.get('/catalog/all-tables-metadata', getAllTablesMetadata);
router.get('/catalog/table/details', getTableDetails);
router.get('/catalog/table/history', getTableDeltaHistory);
router.get('/catalog/table/preview', getTableSampleData);

// Lineage Routes
router.get('/lineage/table', getTableLineage);
router.get('/lineage/column', getColumnLineage);
router.get('/lineage/recursive', getRecursiveLineage);

// Jobs & Pipelines Routes
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobDetails);
router.get('/pipelines', getPipelines);
router.get('/pipelines/:id', getPipelineDetails);

// Search Route
router.get('/search', search);

// Analytics Route
router.get('/analytics/overview', getOverviewAnalytics);

// Impact Analysis Routes
router.get('/impact/analysis', getImpactAnalysis);
router.get('/impact/critical', getCriticalDatasets);

export default router;
