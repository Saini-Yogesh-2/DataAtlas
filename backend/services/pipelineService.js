import axios from 'axios';
import { mockPipelines } from './mockData.js';

export class PipelineService {
  /**
   * Fetch all DLT pipelines
   */
  static async getPipelines(config) {
    if (config.simulation) {
      return mockPipelines;
    }

    try {
      const response = await axios.get(`${config.host}/api/2.0/pipelines`, {
        headers: { Authorization: config.token }
      });
      const pipelines = response.data.statuses || [];
      return pipelines.map(p => ({
        id: p.pipeline_id,
        name: p.name,
        owner: p.creator_user_name || 'System',
        status: p.state || 'UNKNOWN',
        cluster_size: 'Dynamic Auto-scaling',
        schedule: p.continuous ? 'Continuous' : 'Triggered',
        comment: p.cluster_id || 'Delta Live Tables pipeline',
        inputs: [],
        outputs: []
      }));
    } catch (error) {
      console.error('Error fetching pipelines from Databricks API:', error.message);
      // Return empty array instead of throwing to prevent crashing the dashboard if DLT is disabled in user workspace
      return [];
    }
  }

  /**
   * Fetch details of a single pipeline
   */
  static async getPipelineDetails(config, pipelineId) {
    if (config.simulation) {
      return mockPipelines.find(p => p.id === pipelineId) || null;
    }

    try {
      const response = await axios.get(`${config.host}/api/2.0/pipelines/${pipelineId}`, {
        headers: { Authorization: config.token }
      });
      const p = response.data;
      return {
        id: p.pipeline_id,
        name: p.spec?.name || 'Unnamed Pipeline',
        owner: p.creator_user_name || 'System',
        status: p.state || 'UNKNOWN',
        cluster_size: p.spec?.clusters?.[0]?.num_workers ? `${p.spec.clusters[0].num_workers} workers` : 'Auto-scaling',
        schedule: p.spec?.continuous ? 'Continuous' : 'Triggered',
        comment: p.spec?.comment || 'Delta Live Tables pipeline',
        inputs: [],
        outputs: []
      };
    } catch (error) {
      console.error(`Error fetching pipeline details for ${pipelineId}:`, error.message);
      throw new Error(`Databricks Pipeline Details Fetch Failed: ${error.message}`);
    }
  }
}
