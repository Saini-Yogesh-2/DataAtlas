import { mockTables, mockJobs, mockPipelines, mockSchemas, mockCatalogs } from './mockData.js';
import { CatalogService } from './catalogService.js';
import { JobService } from './jobService.js';
import { PipelineService } from './pipelineService.js';

export class SearchService {
  /**
   * Performs instant search across all catalog assets, jobs, and pipelines.
   * In Simulation mode → searches mock data only.
   * In Live mode → searches live workspace only. Never mixes.
   */
  static async search(config, query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];

    let tables = [];
    let jobs = [];
    let pipelines = [];
    let schemas = [];
    let catalogs = [];

    if (config.simulation) {
      tables = mockTables;
      jobs = mockJobs;
      pipelines = mockPipelines;

      Object.keys(mockSchemas).forEach(cat => {
        mockSchemas[cat].forEach(s => {
          schemas.push({ name: s.name, catalog: cat, owner: s.owner, comment: s.comment });
        });
      });

      catalogs = mockCatalogs;
    } else {
      // Live workspace: fetch real data, throw on error so the controller can return proper 500
      const allCats = await CatalogService.getCatalogs(config);
      catalogs = allCats;

      for (const cat of allCats) {
        try {
          const catSchemas = await CatalogService.getSchemas(config, cat.name);
          catSchemas.forEach(s => {
            schemas.push({ name: s.name, catalog: cat.name, owner: s.owner, comment: s.comment });
          });

          for (const s of catSchemas.slice(0, 3)) {
            const sTables = await CatalogService.getTables(config, cat.name, s.name);
            tables.push(...sTables);
          }
        } catch (e) {
          console.error(`Search: skipping catalog ${cat.name}:`, e.message);
        }
      }

      jobs = await JobService.getJobs(config);
      pipelines = await PipelineService.getPipelines(config);
    }

    const results = [];

    // Search Catalogs
    catalogs.forEach(cat => {
      const name = cat.name;
      if (name.toLowerCase().includes(q) || (cat.comment && cat.comment.toLowerCase().includes(q))) {
        results.push({
          type: 'catalog',
          id: `catalog:${name}`,
          name: name,
          subtitle: `Catalog • ${cat.owner || 'System'}`,
          comment: cat.comment,
          link: `/catalog?catalog=${name}`
        });
      }
    });

    // Search Schemas
    schemas.forEach(s => {
      const name = s.name;
      const fullName = `${s.catalog}.${name}`;
      if (name.toLowerCase().includes(q) || s.catalog.toLowerCase().includes(q)) {
        results.push({
          type: 'schema',
          id: `schema:${fullName}`,
          name: fullName,
          subtitle: `Schema • Owned by ${s.owner || 'System'}`,
          comment: s.comment,
          link: `/catalog?catalog=${s.catalog}&schema=${name}`
        });
      }
    });

    // Search Tables
    tables.forEach(t => {
      const name = t.name;
      const fullName = `${t.catalog}.${t.schema}.${name}`;
      const matchesName = name.toLowerCase().includes(q) || fullName.toLowerCase().includes(q);
      const matchesOwner = t.owner && t.owner.toLowerCase().includes(q);
      const matchesComment = t.comment && t.comment.toLowerCase().includes(q);
      const matchesTags = t.tags && t.tags.some(tag => tag.toLowerCase().includes(q));

      if (matchesName || matchesOwner || matchesComment || matchesTags) {
        results.push({
          type: 'table',
          id: `table:${fullName}`,
          name: fullName,
          subtitle: `Table • ${t.format || 'DELTA'} • ${t.type || 'MANAGED'}`,
          comment: t.comment,
          tags: t.tags || [],
          owner: t.owner,
          link: `/catalog/${t.catalog}/${t.schema}/${name}`
        });
      }
    });

    // Search Jobs
    jobs.forEach(j => {
      const name = j.name || '';
      const owner = j.owner || '';
      if (name.toLowerCase().includes(q) || owner.toLowerCase().includes(q)) {
        results.push({
          type: 'job',
          id: `job:${j.id}`,
          name: name,
          subtitle: `Job • Schedule: ${j.schedule || 'Manual'} • Owned by ${owner || 'System'}`,
          comment: `Cluster: ${j.cluster || 'Default'} (${j.active ? 'Active' : 'Paused'})`,
          link: `/jobs?jobId=${j.id}`
        });
      }
    });

    // Search Pipelines
    pipelines.forEach(p => {
      const name = p.name || '';
      const owner = p.owner || '';
      if (name.toLowerCase().includes(q) || owner.toLowerCase().includes(q)) {
        results.push({
          type: 'pipeline',
          id: `pipeline:${p.id}`,
          name: name,
          subtitle: `DLT Pipeline • Status: ${p.status || 'UNKNOWN'}`,
          comment: p.comment,
          link: `/pipelines?pipelineId=${p.id}`
        });
      }
    });

    return results.slice(0, 30);
  }
}
