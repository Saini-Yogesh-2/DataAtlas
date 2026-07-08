import { mockTableLineage, mockTables, mockJobs, mockPipelines } from './mockData.js';
import { LineageService } from './lineageService.js';

export class ImpactService {
  /**
   * Calculates the downstream blast radius and risk index for an asset.
   * In Simulation mode → uses mock lineage only.
   * In Live mode → uses real lineage API only. No mock data leaks.
   */
  static async getImpactAnalysis(config, tableName) {
    const visited = new Set();
    const downstreamTables = [];
    const queue = [{ id: tableName, depth: 0 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      if (depth > maxDepth) maxDepth = depth;

      let downstreams = [];
      if (config.simulation) {
        downstreams = mockTableLineage.downstreams[id] || [];
      } else {
        const lineage = await LineageService.getTableLineage(config, id);
        downstreams = lineage.downstreams || [];
      }

      downstreams.forEach(down => {
        if (!visited.has(down)) {
          queue.push({ id: down, depth: depth + 1 });
          if (!downstreamTables.includes(down)) {
            downstreamTables.push(down);
          }
        }
      });
    }

    const filteredTables = downstreamTables.filter(t => t !== tableName);

    // Fetch jobs and pipelines — strictly from correct source per mode
    let jobs = [];
    let pipelines = [];
    if (config.simulation) {
      jobs = mockJobs;
      pipelines = mockPipelines;
    } else {
      try {
        const { JobService } = await import('./jobService.js');
        const { PipelineService } = await import('./pipelineService.js');
        jobs = await JobService.getJobs(config);
        pipelines = await PipelineService.getPipelines(config);
      } catch (e) {
        console.error('Impact: could not fetch jobs/pipelines:', e.message);
        jobs = [];
        pipelines = [];
      }
    }

    const affectedTables = [tableName, ...filteredTables];
    const downstreamJobs = [];
    const downstreamPipelines = [];

    jobs.forEach(job => {
      const isAffected = job.inputs?.some(input => affectedTables.includes(input));
      if (isAffected) {
        downstreamJobs.push({
          id: job.id,
          name: job.name,
          owner: job.owner,
          schedule: job.schedule,
          status: job.active ? 'ACTIVE' : 'PAUSED'
        });
      }
    });

    pipelines.forEach(pipe => {
      const isAffected = pipe.inputs?.some(input => affectedTables.includes(input));
      if (isAffected) {
        downstreamPipelines.push({
          id: pipe.id,
          name: pipe.name,
          owner: pipe.owner,
          status: pipe.status
        });
      }
    });

    // directDownstreams = first level downstream count — same calculation for both modes
    const directDownstreams = config.simulation
      ? (mockTableLineage.downstreams[tableName] || []).length
      : filteredTables.length;

    const indirectDownstreams = Math.max(0, filteredTables.length - directDownstreams);

    const baseScore =
      (directDownstreams * 12) +
      (indirectDownstreams * 6) +
      (downstreamJobs.length * 15) +
      (downstreamPipelines.length * 20) +
      (maxDepth * 10);

    const criticalityScore = Math.min(100, Math.max(10, baseScore));

    return {
      tableName,
      criticalityScore,
      blastRadius: {
        affectedAssetsCount: filteredTables.length + downstreamJobs.length + downstreamPipelines.length,
        maxDependencyDepth: maxDepth,
        tablesCount: filteredTables.length,
        jobsCount: downstreamJobs.length,
        pipelinesCount: downstreamPipelines.length
      },
      downstreamTables: filteredTables,
      downstreamJobs,
      downstreamPipelines
    };
  }

  /**
   * Returns datasets ranked by criticality score.
   * In Simulation mode → ranks mock tables only.
   * In Live mode → ranks live workspace tables only. Never mixes.
   */
  static async getCriticalDatasets(config) {
    let tables = [];

    if (config.simulation) {
      tables = mockTables;
    } else {
      try {
        const { CatalogService } = await import('./catalogService.js');
        const catalogs = await CatalogService.getCatalogs(config);
        for (const cat of catalogs.slice(0, 3)) {
          try {
            const schemas = await CatalogService.getSchemas(config, cat.name);
            for (const s of schemas.slice(0, 2)) {
              const schemaTables = await CatalogService.getTables(config, cat.name, s.name);
              tables.push(...schemaTables);
            }
          } catch (e) {
            console.error(`getCriticalDatasets: skipping catalog ${cat.name}:`, e.message);
          }
        }
      } catch (err) {
        console.error('getCriticalDatasets: live fetch failed:', err.message);
        // In live mode we propagate the error — do not fall back to mock data
        throw new Error(`Critical datasets fetch failed: ${err.message}`);
      }
    }

    const rankings = [];
    for (const t of tables.slice(0, 10)) {
      const fullName = `${t.catalog}.${t.schema}.${t.name}`;
      const impact = await this.getImpactAnalysis(config, fullName);
      rankings.push({
        fullName,
        name: t.name,
        catalog: t.catalog,
        schema: t.schema,
        owner: t.owner,
        criticalityScore: impact.criticalityScore,
        blastRadiusCount: impact.blastRadius.affectedAssetsCount,
        maxDepth: impact.blastRadius.maxDependencyDepth
      });
    }

    return rankings.sort((a, b) => b.criticalityScore - a.criticalityScore);
  }
}
