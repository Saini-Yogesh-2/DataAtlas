// --- Medallion Enterprise Mock Dataset ---
// Modeled to represent a fortune-500 scale Databricks Unity Catalog configuration

export const mockCatalogs = [
  { name: 'enterprise_dw', owner: 'Data Engineering & Platform Team', comment: 'Main enterprise data warehouse for core business models' },
  { name: 'customer_360', owner: 'Customer Data Science Team', comment: 'Aggregated customer profiles, engagement scores, and segments' },
  { name: 'finance_uc', owner: 'Financial Systems & Audit Team', comment: 'Secured ledger records, billing runs, and transaction details' },
  { name: 'dev_sandbox', owner: 'R&D Sandbox User Space', comment: 'Temporary workspaces and analysis schemas' },
  { name: 'system', owner: 'Workspace Administrators', comment: 'Databricks billing telemetry, lineage trackers, and system tables' }
];

export const mockSchemas = {
  enterprise_dw: [
    { name: 'raw_ingest', owner: 'Platform Ingestion Team', comment: 'Direct raw storage external tables (GCS/S3 logs)' },
    { name: 'bronze_medallion', owner: 'Data Engineering Team', comment: 'Deduplicated, structured, and validated Delta tables' },
    { name: 'silver_analytics', owner: 'Data Analytics Team', comment: 'Modelled silver entities and core dimension details' },
    { name: 'gold_reporting', owner: 'BI & Executive Reporting', comment: 'Aggregated reporting tables optimized for query speeds' }
  ],
  customer_360: [
    { name: 'silver_profiles', owner: 'Customer Analytics Team', comment: 'De-normalized user characteristics, joins POS/CRM/Web' },
    { name: 'gold_segments', owner: 'Marketing Analytics Team', comment: 'Machine learning clusters and user value segments' }
  ],
  finance_uc: [
    { name: 'raw_ledger', owner: 'Financial Operations Team', comment: 'Raw transaction dumps from ERP databases' },
    { name: 'gold_accounting', owner: 'Accounting Audits Team', comment: 'Consolidated ledgers and balance sheets' }
  ],
  dev_sandbox: [
    { name: 'ml_sandbox', owner: 'Data Scientists Group', comment: 'Ad-hoc feature engineering and testing features' }
  ],
  system: [
    { name: 'billing', owner: 'FinOps Admins', comment: 'Workspace DBU logs, cluster cost statistics' },
    { name: 'access_audit', owner: 'Security Team', comment: 'Security logs tracking SQL query runs' }
  ]
};

export const mockTables = [
  // --- ENTERPRISE_DW: RAW INGEST SCHEMA ---
  {
    catalog: 'enterprise_dw',
    schema: 'raw_ingest',
    name: 'raw_web_clicks',
    type: 'EXTERNAL',
    owner: 'Platform Ingestion Team',
    location: 's3://company-datalake/ingest/clickstream/v2/',
    format: 'JSON',
    comment: 'Raw web events, ingested continuously from Kafka clickstream topic',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-07-08T23:00:00Z',
    size_bytes: 858993459200, // 800 GB
    row_count: 5205400300,
    criticality: 'Low',
    tags: ['Ingest', 'Kafka', 'Web-Clicks']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'raw_ingest',
    name: 'raw_crm_users',
    type: 'EXTERNAL',
    owner: 'Platform Ingestion Team',
    location: 's3://company-datalake/ingest/crm/users_dump/',
    format: 'CSV',
    comment: 'Nightly CSV dumps from sales CRM user database',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-07-08T01:30:00Z',
    size_bytes: 32212254720, // 30 GB
    row_count: 45000000,
    criticality: 'Low',
    tags: ['Ingest', 'CRM', 'Users']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'raw_ingest',
    name: 'raw_pos_transactions',
    type: 'EXTERNAL',
    owner: 'Platform Ingestion Team',
    location: 's3://company-datalake/ingest/pos/retail_sales/',
    format: 'PARQUET',
    comment: 'Hourly POS terminal transactions from physical shops',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2026-07-08T22:30:00Z',
    size_bytes: 429496729600, // 400 GB
    row_count: 1205004000,
    criticality: 'Low',
    tags: ['Ingest', 'POS', 'Transactions']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'raw_ingest',
    name: 'raw_inventory_status',
    type: 'EXTERNAL',
    owner: 'Operations Ingestion Team',
    location: 's3://company-datalake/ingest/erp/inventory/',
    format: 'JSON',
    comment: 'ERP warehouse stock status telemetry',
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2026-07-08T20:00:00Z',
    size_bytes: 107374182400, // 100 GB
    row_count: 504500000,
    criticality: 'Low',
    tags: ['Ingest', 'ERP', 'Inventory']
  },

  // --- ENTERPRISE_DW: BRONZE MEDALLION SCHEMA ---
  {
    catalog: 'enterprise_dw',
    schema: 'bronze_medallion',
    name: 'bronze_clickstream',
    type: 'MANAGED',
    owner: 'Data Engineering Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/bronze_clickstream',
    format: 'DELTA',
    comment: 'Deduplicated clickstream logs with parsed schema details',
    created_at: '2025-01-02T02:00:00Z',
    updated_at: '2026-07-08T23:05:00Z',
    size_bytes: 644245094400, // 600 GB
    row_count: 5204850200,
    criticality: 'Medium',
    tags: ['Medallion', 'Bronze', 'Delta']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'bronze_medallion',
    name: 'bronze_crm_customers',
    type: 'MANAGED',
    owner: 'Data Engineering Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/bronze_crm_customers',
    format: 'DELTA',
    comment: 'Deduplicated CRM profiles with verified timestamps',
    created_at: '2025-01-02T03:00:00Z',
    updated_at: '2026-07-08T02:00:00Z',
    size_bytes: 26843545600, // 25 GB
    row_count: 44998000,
    criticality: 'Medium',
    tags: ['Medallion', 'Bronze', 'Delta']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'bronze_medallion',
    name: 'bronze_transactions',
    type: 'MANAGED',
    owner: 'Data Engineering Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/bronze_transactions',
    format: 'DELTA',
    comment: 'Deduplicated POS terminal transactions with initial structure validations',
    created_at: '2025-01-06T04:00:00Z',
    updated_at: '2026-07-08T22:45:00Z',
    size_bytes: 322122547200, // 300 GB
    row_count: 1204982000,
    criticality: 'Medium',
    tags: ['Medallion', 'Bronze', 'Delta']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'bronze_medallion',
    name: 'bronze_stock_levels',
    type: 'MANAGED',
    owner: 'Data Engineering Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/bronze_stock_levels',
    format: 'DELTA',
    comment: 'Cleaned stock inventory readings from ERP',
    created_at: '2025-02-11T03:00:00Z',
    updated_at: '2026-07-08T20:15:00Z',
    size_bytes: 85899345920, // 80 GB
    row_count: 504495000,
    criticality: 'Low',
    tags: ['Medallion', 'Bronze', 'Delta']
  },

  // --- ENTERPRISE_DW: SILVER ANALYTICS SCHEMA ---
  {
    catalog: 'enterprise_dw',
    schema: 'silver_analytics',
    name: 'silver_customer_master',
    type: 'MANAGED',
    owner: 'Data Engineering Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/silver_customer_master',
    format: 'DELTA',
    comment: 'Unified customer dimension tables. Consolidates CRM profiles, verified checkouts, and details.',
    created_at: '2025-01-05T08:00:00Z',
    updated_at: '2026-07-08T04:00:00Z',
    size_bytes: 18790481920, // 17.5 GB
    row_count: 45200000,
    criticality: 'High',
    tags: ['PII', 'GDPR', 'Silver', 'Customer']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'silver_analytics',
    name: 'silver_user_sessions',
    type: 'MANAGED',
    owner: 'Data Engineering Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/silver_user_sessions',
    format: 'DELTA',
    comment: 'Sessionized click logs mapped to customer identifier tags',
    created_at: '2025-01-05T09:00:00Z',
    updated_at: '2026-07-08T23:30:00Z',
    size_bytes: 429496729600, // 400 GB
    row_count: 2450000000,
    criticality: 'High',
    tags: ['Silver', 'Sessions']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'silver_analytics',
    name: 'silver_transaction_items',
    type: 'MANAGED',
    owner: 'Data Engineering Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/silver_transaction_items',
    format: 'DELTA',
    comment: 'Modelled transaction records joined with SKU product inventory data',
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2026-07-08T23:15:00Z',
    size_bytes: 214748364800, // 200 GB
    row_count: 1204982000,
    criticality: 'High',
    tags: ['Silver', 'Sales']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'silver_analytics',
    name: 'silver_inventory_snapshots',
    type: 'MANAGED',
    owner: 'Supply Chain Operations',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/silver_inventory_snapshots',
    format: 'DELTA',
    comment: 'Cleaned and timestamped warehouse inventories snap logs',
    created_at: '2025-02-15T08:00:00Z',
    updated_at: '2026-07-08T20:30:00Z',
    size_bytes: 53687091200, // 50 GB
    row_count: 504495000,
    criticality: 'Medium',
    tags: ['Silver', 'Supply-Chain']
  },

  // --- ENTERPRISE_DW: GOLD REPORTING SCHEMA ---
  {
    catalog: 'enterprise_dw',
    schema: 'gold_reporting',
    name: 'gold_sales_performance',
    type: 'MANAGED',
    owner: 'BI Analytics Team',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/gold_sales_performance',
    format: 'DELTA',
    comment: 'Daily aggregated sales metrics by category, region, and branch for executive dashboards.',
    created_at: '2025-01-10T12:00:00Z',
    updated_at: '2026-07-08T23:45:00Z',
    size_bytes: 5368709120, // 5 GB
    row_count: 15400000,
    criticality: 'High',
    tags: ['Reporting', 'Gold', 'Financial', 'BI']
  },
  {
    catalog: 'enterprise_dw',
    schema: 'gold_reporting',
    name: 'gold_inventory_predictions',
    type: 'MANAGED',
    owner: 'Supply Chain Operations',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/gold_inventory_predictions',
    format: 'DELTA',
    comment: 'Daily generated safety stock calculations and restock alert parameters',
    created_at: '2025-02-20T10:00:00Z',
    updated_at: '2026-07-08T21:00:00Z',
    size_bytes: 1073741824, // 1 GB
    row_count: 4500000,
    criticality: 'Medium',
    tags: ['Reporting', 'Gold', 'Operations', 'ML-Inputs']
  },

  // --- CUSTOMER_360 CATALOG TABLES ---
  {
    catalog: 'customer_360',
    schema: 'silver_profiles',
    name: 'customer_behavior_metrics',
    type: 'MANAGED',
    owner: 'Customer Analytics Team',
    location: 'dbfs:/user/hive/warehouse/customer_360.db/customer_behavior_metrics',
    format: 'DELTA',
    comment: 'Customer behavioral features including lifetime value (LTV), visit frequency, and return flags',
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2026-07-08T06:00:00Z',
    size_bytes: 10737418240, // 10 GB
    row_count: 45200000,
    criticality: 'High',
    tags: ['Customer-Success', 'LTV', 'Profiles']
  },
  {
    catalog: 'customer_360',
    schema: 'gold_segments',
    name: 'customer_churn_clusters',
    type: 'MANAGED',
    owner: 'Marketing Analytics Team',
    location: 'dbfs:/user/hive/warehouse/customer_360.db/customer_churn_clusters',
    format: 'DELTA',
    comment: 'Weekly refreshed clusters grouping customer profiles by active churn risk values',
    created_at: '2025-01-20T04:00:00Z',
    updated_at: '2026-07-05T02:00:00Z',
    size_bytes: 4294967296, // 4 GB
    row_count: 45200000,
    criticality: 'High',
    tags: ['ML-Output', 'Marketing', 'Gold']
  },

  // --- FINANCE_UC CATALOG TABLES ---
  {
    catalog: 'finance_uc',
    schema: 'gold_accounting',
    name: 'consolidated_ledger',
    type: 'MANAGED',
    owner: 'Accounting Audits Team',
    location: 'dbfs:/user/hive/warehouse/finance_uc.db/consolidated_ledger',
    format: 'DELTA',
    comment: 'Consolidated cashflow ledger, reconciled with daily silver POS records. Audit compliant.',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2026-07-08T00:00:00Z',
    size_bytes: 16106127360, // 15 GB
    row_count: 24500000,
    criticality: 'High',
    tags: ['Finance', 'Audit', 'Gold', 'Core-Accounting']
  },

  // --- STALE / UNUSED TABLES FOR CLEANUP ---
  {
    catalog: 'enterprise_dw',
    schema: 'gold_reporting',
    name: 'deprecated_sales_summary_2024',
    type: 'MANAGED',
    owner: 'Temporary Analyst Group',
    location: 'dbfs:/user/hive/warehouse/enterprise_dw.db/deprecated_sales_summary_2024',
    format: 'DELTA',
    comment: 'Temporary backup generated during late 2024 schema migration. No reads or references.',
    created_at: '2024-11-15T12:00:00Z',
    updated_at: '2024-11-15T12:00:00Z',
    size_bytes: 161061273600, // 150 GB
    row_count: 110500000,
    criticality: 'Low',
    tags: ['Unused', 'Backup', 'Stale']
  }
];

// --- COLUMNS METADATA SYSTEM ---
export const mockColumns = {
  'enterprise_dw.raw_ingest.raw_pos_transactions': [
    { name: 'tx_id', type: 'STRING', comment: 'POS generated UUID transactional reference', nullable: false, pk: true },
    { name: 'terminal_id', type: 'STRING', comment: 'Shop checkout terminal ID', nullable: false, pk: false },
    { name: 'customer_ref', type: 'STRING', comment: 'POS loyalty card identifier', nullable: true, pk: false },
    { name: 'tx_timestamp', type: 'STRING', comment: 'Terminal clock ISO time', nullable: false, pk: false },
    { name: 'items_json', type: 'STRING', comment: 'JSON array of items purchased, prices, and taxes', nullable: true, pk: false }
  ],
  'enterprise_dw.silver_analytics.silver_customer_master': [
    { name: 'customer_id', type: 'STRING', comment: 'Unified customer UUID (Primary Key)', nullable: false, pk: true },
    { name: 'crm_user_id', type: 'STRING', comment: 'Foreign Key referencing sales CRM database', nullable: true, pk: false },
    { name: 'loyalty_ref', type: 'STRING', comment: 'Loyalty card matching POS transactions', nullable: true, pk: false },
    { name: 'full_name', type: 'STRING', comment: 'De-normalized client name (PII)', nullable: true, pk: false, tags: ['PII', 'GDPR'] },
    { name: 'email_address', type: 'STRING', comment: 'Primary contact email (PII)', nullable: true, pk: false, tags: ['PII', 'GDPR'] },
    { name: 'billing_country', type: 'STRING', comment: 'ISO 2-character country code', nullable: true, pk: false },
    { name: 'updated_timestamp', type: 'TIMESTAMP', comment: 'Latest record load time', nullable: false, pk: false }
  ],
  'enterprise_dw.silver_analytics.silver_transaction_items': [
    { name: 'transaction_id', type: 'STRING', comment: 'Unified POS transactional UUID', nullable: false, pk: true },
    { name: 'customer_id', type: 'STRING', comment: 'FK matching unified Customer Master profiles', nullable: true, pk: false },
    { name: 'item_index', type: 'INTEGER', comment: 'Array index item indicator', nullable: false, pk: true },
    { name: 'sku_code', type: 'STRING', comment: 'Product SKU reference code', nullable: false, pk: false },
    { name: 'units_qty', type: 'INTEGER', comment: 'Units count purchased', nullable: false, pk: false },
    { name: 'unit_price', type: 'DECIMAL(18,2)', comment: 'Unit price in local currency', nullable: false, pk: false },
    { name: 'total_amount_usd', type: 'DECIMAL(18,2)', comment: 'USD net purchase amount', nullable: false, pk: false }
  ],
  'enterprise_dw.gold_reporting.gold_sales_performance': [
    { name: 'sales_date', type: 'DATE', comment: 'Aggregated calendar date', nullable: false, pk: true },
    { name: 'region_name', type: 'STRING', comment: 'Business sales region (e.g. AMER, EMEA)', nullable: false, pk: true },
    { name: 'net_sales_usd', type: 'DECIMAL(28,2)', comment: 'Sum gross sales amount minus sales returns', nullable: true, pk: false },
    { name: 'transaction_count', type: 'BIGINT', comment: 'Volume count of checkouts processed', nullable: true, pk: false },
    { name: 'unique_purchasers_count', type: 'INTEGER', comment: 'Active customer master count', nullable: true, pk: false }
  ]
};

// --- DEEP RECURSIVE LINEAGE SYSTEM ---
// Maps a 5-level flow: Raw ➔ Bronze ➔ Silver ➔ Gold ➔ BI Dashboard / ML Models
export const mockTableLineage = {
  upstreams: {
    // Level 2 (Raw -> Bronze)
    'enterprise_dw.bronze_medallion.bronze_clickstream': ['enterprise_dw.raw_ingest.raw_web_clicks'],
    'enterprise_dw.bronze_medallion.bronze_crm_customers': ['enterprise_dw.raw_ingest.raw_crm_users'],
    'enterprise_dw.bronze_medallion.bronze_transactions': ['enterprise_dw.raw_ingest.raw_pos_transactions'],
    'enterprise_dw.bronze_medallion.bronze_stock_levels': ['enterprise_dw.raw_ingest.raw_inventory_status'],

    // Level 3 (Bronze -> Silver)
    'enterprise_dw.silver_analytics.silver_customer_master': ['enterprise_dw.bronze_medallion.bronze_crm_customers'],
    'enterprise_dw.silver_analytics.silver_user_sessions': ['enterprise_dw.bronze_medallion.bronze_clickstream', 'enterprise_dw.silver_analytics.silver_customer_master'],
    'enterprise_dw.silver_analytics.silver_transaction_items': ['enterprise_dw.bronze_medallion.bronze_transactions', 'enterprise_dw.silver_analytics.silver_customer_master'],
    'enterprise_dw.silver_analytics.silver_inventory_snapshots': ['enterprise_dw.bronze_medallion.bronze_stock_levels', 'enterprise_dw.silver_analytics.silver_transaction_items'],

    // Level 4 (Silver -> Gold)
    'enterprise_dw.gold_reporting.gold_sales_performance': ['enterprise_dw.silver_analytics.silver_transaction_items'],
    'enterprise_dw.gold_reporting.gold_inventory_predictions': ['enterprise_dw.silver_analytics.silver_inventory_snapshots'],
    'customer_360.silver_profiles.customer_behavior_metrics': ['enterprise_dw.silver_analytics.silver_customer_master', 'enterprise_dw.silver_analytics.silver_user_sessions'],
    'customer_360.gold_segments.customer_churn_clusters': ['customer_360.silver_profiles.customer_behavior_metrics'],
    'finance_uc.gold_accounting.consolidated_ledger': ['enterprise_dw.gold_reporting.gold_sales_performance'],

    // Level 5 (Gold -> BI / Systems)
    'dashboard_sales_roi': ['enterprise_dw.gold_reporting.gold_sales_performance'],
    'dashboard_customer_retention': ['customer_360.gold_segments.customer_churn_clusters'],
    'ml_model_restock_forecaster': ['enterprise_dw.gold_reporting.gold_inventory_predictions'],
    'report_quarterly_audit': ['finance_uc.gold_accounting.consolidated_ledger'],
    'dashboard_executive_scorecard': ['enterprise_dw.gold_reporting.gold_sales_performance', 'customer_360.gold_segments.customer_churn_clusters']
  },
  
  downstreams: {
    // Level 1 -> 2
    'enterprise_dw.raw_ingest.raw_web_clicks': ['enterprise_dw.bronze_medallion.bronze_clickstream'],
    'enterprise_dw.raw_ingest.raw_crm_users': ['enterprise_dw.bronze_medallion.bronze_crm_customers'],
    'enterprise_dw.raw_ingest.raw_pos_transactions': ['enterprise_dw.bronze_medallion.bronze_transactions'],
    'enterprise_dw.raw_ingest.raw_inventory_status': ['enterprise_dw.bronze_medallion.bronze_stock_levels'],

    // Level 2 -> 3
    'enterprise_dw.bronze_medallion.bronze_clickstream': ['enterprise_dw.silver_analytics.silver_user_sessions'],
    'enterprise_dw.bronze_medallion.bronze_crm_customers': ['enterprise_dw.silver_analytics.silver_customer_master'],
    'enterprise_dw.bronze_medallion.bronze_transactions': ['enterprise_dw.silver_analytics.silver_transaction_items'],
    'enterprise_dw.bronze_medallion.bronze_stock_levels': ['enterprise_dw.silver_analytics.silver_inventory_snapshots'],

    // Level 3 -> 4
    'enterprise_dw.silver_analytics.silver_customer_master': ['enterprise_dw.silver_analytics.silver_user_sessions', 'customer_360.silver_profiles.customer_behavior_metrics'],
    'enterprise_dw.silver_analytics.silver_user_sessions': ['customer_360.silver_profiles.customer_behavior_metrics'],
    'enterprise_dw.silver_analytics.silver_transaction_items': ['enterprise_dw.silver_analytics.silver_inventory_snapshots', 'enterprise_dw.gold_reporting.gold_sales_performance'],
    'enterprise_dw.silver_analytics.silver_inventory_snapshots': ['enterprise_dw.gold_reporting.gold_inventory_predictions'],

    // Level 4 -> 5
    'enterprise_dw.gold_reporting.gold_sales_performance': ['dashboard_sales_roi', 'finance_uc.gold_accounting.consolidated_ledger', 'dashboard_executive_scorecard'],
    'enterprise_dw.gold_reporting.gold_inventory_predictions': ['ml_model_restock_forecaster'],
    'customer_360.silver_profiles.customer_behavior_metrics': ['customer_360.gold_segments.customer_churn_clusters'],
    'customer_360.gold_segments.customer_churn_clusters': ['dashboard_customer_retention', 'dashboard_executive_scorecard'],
    'finance_uc.gold_accounting.consolidated_ledger': ['report_quarterly_audit']
  }
};

// Column dependencies mapping
export const mockColumnLineage = {
  'enterprise_dw.silver_analytics.silver_customer_master.full_name': [
    { upstream: 'enterprise_dw.bronze_medallion.bronze_crm_customers.name', type: 'DIRECT' }
  ],
  'enterprise_dw.silver_analytics.silver_customer_master.email_address': [
    { upstream: 'enterprise_dw.bronze_medallion.bronze_crm_customers.email', type: 'DIRECT' }
  ],
  'enterprise_dw.silver_analytics.silver_transaction_items.total_amount_usd': [
    { upstream: 'enterprise_dw.bronze_medallion.bronze_transactions.items_array.price', type: 'DIRECT' }
  ],
  'enterprise_dw.gold_reporting.gold_sales_performance.net_sales_usd': [
    { upstream: 'enterprise_dw.silver_analytics.silver_transaction_items.total_amount_usd', type: 'AGGREGATED' }
  ]
};

// --- ENTERPRISE JOB RUNS (ETL Workflows) ---
export const mockJobs = [
  {
    id: 101,
    name: 'dbt_medallion_raw_to_bronze',
    owner: 'Data Engineering Team',
    schedule: '*/30 * * * *', // Every 30 mins
    active: true,
    cluster: 'shared-autoscaling-compute',
    runtime: 'Apache Spark 14.3 LTS (Photon enabled)',
    inputs: ['enterprise_dw.raw_ingest.raw_web_clicks', 'enterprise_dw.raw_ingest.raw_crm_users', 'enterprise_dw.raw_ingest.raw_pos_transactions'],
    outputs: ['enterprise_dw.bronze_medallion.bronze_clickstream', 'enterprise_dw.bronze_medallion.bronze_crm_customers', 'enterprise_dw.bronze_medallion.bronze_transactions'],
    recent_runs: [
      { run_id: 29012, status: 'SUCCESS', start_time: '2026-07-08T23:00:00Z', duration_ms: 124000 },
      { run_id: 28980, status: 'SUCCESS', start_time: '2026-07-08T22:30:00Z', duration_ms: 118000 }
    ]
  },
  {
    id: 102,
    name: 'dbt_medallion_bronze_to_silver',
    owner: 'Data Engineering Team',
    schedule: '0 */2 * * *', // Every 2 hours
    active: true,
    cluster: 'large-compute-photon',
    runtime: 'Apache Spark 14.3 LTS (Photon)',
    inputs: ['enterprise_dw.bronze_medallion.bronze_crm_customers', 'enterprise_dw.bronze_medallion.bronze_clickstream', 'enterprise_dw.bronze_medallion.bronze_transactions'],
    outputs: ['enterprise_dw.silver_analytics.silver_customer_master', 'enterprise_dw.silver_analytics.silver_user_sessions', 'enterprise_dw.silver_analytics.silver_transaction_items'],
    recent_runs: [
      { run_id: 15401, status: 'SUCCESS', start_time: '2026-07-08T22:00:00Z', duration_ms: 412000 },
      { run_id: 15309, status: 'FAILED', start_time: '2026-07-08T20:00:00Z', duration_ms: 85000, error: 'Table lock timeout on silver_customer_master.' }
    ]
  },
  {
    id: 103,
    name: 'gold_ledger_reconciliation',
    owner: 'Accounting Audits Team',
    schedule: '0 5 * * *', // Daily 5 AM
    active: true,
    cluster: 'finance-secured-cluster',
    runtime: 'Databricks Serverless Compute',
    inputs: ['enterprise_dw.silver_analytics.silver_transaction_items'],
    outputs: ['finance_uc.gold_accounting.consolidated_ledger'],
    recent_runs: [
      { run_id: 4210, status: 'SUCCESS', start_time: '2026-07-08T05:00:00Z', duration_ms: 195000 },
      { run_id: 4102, status: 'SUCCESS', start_time: '2026-07-07T05:00:00Z', duration_ms: 201000 }
    ]
  },
  {
    id: 104,
    name: 'customer_segment_clusters_generation',
    owner: 'Customer Analytics Team',
    schedule: '0 1 * * 1', // Weekly Monday 1 AM
    active: true,
    cluster: 'gpu-ml-cluster-v2',
    runtime: 'Databricks Runtime 14.3 ML',
    inputs: ['customer_360.silver_profiles.customer_behavior_metrics'],
    outputs: ['customer_360.gold_segments.customer_churn_clusters'],
    recent_runs: [
      { run_id: 859, status: 'SUCCESS', start_time: '2026-07-06T01:00:00Z', duration_ms: 2450000 }
    ]
  }
];

export const mockPipelines = [
  {
    id: 'dlt-772b-88a',
    name: 'dlt_supply_chain_inventory',
    owner: 'Supply Chain Operations',
    status: 'RUNNING',
    cluster_size: '2-4 workers',
    schedule: 'Continuous',
    comment: 'DLT Pipeline delivering stocks and product inventories status updates',
    inputs: ['enterprise_dw.raw_ingest.raw_inventory_status'],
    outputs: ['enterprise_dw.bronze_medallion.bronze_stock_levels', 'enterprise_dw.silver_analytics.silver_inventory_snapshots', 'enterprise_dw.gold_reporting.gold_inventory_predictions']
  }
];

// --- DELTA history version logs ---
export const mockDeltaHistory = {
  'enterprise_dw.silver_analytics.silver_customer_master': [
    { version: 4, timestamp: '2026-07-08T04:00:00Z', userId: 'eng_amy@company.com', operation: 'MERGE', operationParameters: { matchedKeys: '["customer_id"]' }, userName: 'Amy Engineer' },
    { version: 3, timestamp: '2026-07-07T04:00:00Z', userId: 'eng_amy@company.com', operation: 'MERGE', operationParameters: { matchedKeys: '["customer_id"]' }, userName: 'Amy Engineer' },
    { version: 2, timestamp: '2026-07-05T00:00:00Z', userId: 'admin_yogi@company.com', operation: 'OPTIMIZE', operationParameters: { zOrderBy: '["billing_country"]' }, userName: 'Yogesh Admin' },
    { version: 1, timestamp: '2025-01-05T08:15:00Z', userId: 'dbt_runner@company.com', operation: 'WRITE', operationParameters: { mode: 'Append' }, userName: 'dbt job runner' },
    { version: 0, timestamp: '2025-01-05T08:00:00Z', userId: 'arch_deborah@company.com', operation: 'CREATE TABLE', operationParameters: { provider: 'delta' }, userName: 'Deborah Architect' }
  ]
};

// --- DATA PREVIEW ROWS ---
export const mockSampleData = {
  'enterprise_dw.silver_analytics.silver_customer_master': [
    { customer_id: 'e3bb-4011-80a2', crm_user_id: 'crm-9980', loyalty_ref: 'loy-8991', full_name: 'Sarah Connor', email_address: 'sconnor@cyberdyne.org', billing_country: 'US', updated_timestamp: '2026-07-08 04:00:00' },
    { customer_id: 'f9aa-2089-91b3', crm_user_id: 'crm-1024', loyalty_ref: 'loy-7612', full_name: 'John Doe', email_address: 'john.doe@gmail.com', billing_country: 'US', updated_timestamp: '2026-07-08 04:00:00' },
    { customer_id: 'd822-6712-ff81', crm_user_id: 'crm-5402', loyalty_ref: 'loy-9011', full_name: 'Alice Cooper', email_address: 'alice@heavyrock.net', billing_country: 'GB', updated_timestamp: '2026-07-07 04:00:00' },
    { customer_id: 'a028-1192-33dd', crm_user_id: 'crm-8902', loyalty_ref: 'loy-0129', full_name: 'Yuki Sato', email_address: 'yuki@sato-consulting.jp', billing_country: 'JP', updated_timestamp: '2026-07-07 04:00:00' }
  ]
};

// --- TELEMETRY & PLOTS DATA ---
export const mockAnalytics = {
  dbus_consumed_30d: [
    { date: '06-08', DBUs: 215 }, { date: '06-12', DBUs: 256 },
    { date: '06-16', DBUs: 198 }, { date: '06-20', DBUs: 310 },
    { date: '06-24', DBUs: 380 }, { date: '06-28', DBUs: 295 },
    { date: '07-02', DBUs: 480 }, { date: '07-06', DBUs: 390 },
    { date: '07-08', DBUs: 420 }
  ],
  storage_size_tb: [
    { date: '01-25', size: 45.2 }, { date: '02-25', size: 52.8 },
    { date: '03-25', size: 68.1 }, { date: '04-25', size: 84.4 },
    { date: '05-25', size: 99.5 }, { date: '06-25', size: 112.3 },
    { date: '07-08', size: 124.6 }
  ],
  table_size_distribution: [
    { category: 'Under 100KB', count: 28 },
    { category: '100KB - 1MB', count: 15 },
    { category: '1MB - 10MB', count: 9 },
    { category: '10MB - 50MB', count: 4 },
    { category: 'Over 50MB', count: 1 }
  ],
  metadata_growth_rates: [
    { schema: 'raw_ingest', growth: 38 },
    { schema: 'bronze_medallion', growth: 29 },
    { schema: 'silver_analytics', growth: 16 },
    { schema: 'gold_reporting', growth: 8 }
  ],
  active_users_audit: [
    { email: 'amy_eng@company.com', queries: 1240, team: 'Data Engineering' },
    { email: 'yogi_admin@company.com', queries: 850, team: 'Architecture' },
    { email: 'ledger_service_principal', queries: 680, team: 'Secured Accounting' }
  ],
  recentChanges: [
    { type: 'SCHEMA', asset: 'enterprise_dw.silver_analytics.silver_customer_master', action: 'Added load_timestamp date columns', date: '2026-07-08T04:00:00Z', user: 'Amy Engineer' },
    { type: 'OWNER', asset: 'finance_uc.gold_accounting.consolidated_ledger', action: 'Transferred control rights to Accounting Audits Group', date: '2026-07-08T00:00:00Z', user: 'Yogesh Admin' },
    { type: 'PIPELINE', asset: 'enterprise_dw.silver_analytics.silver_inventory_snapshots', action: 'Completed DLT run version 85', date: '2026-07-08T20:30:00Z', user: 'Supply DLT Principal' }
  ]
};
