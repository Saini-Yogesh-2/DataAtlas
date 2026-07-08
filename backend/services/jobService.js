import axios from 'axios';
import { mockJobs } from './mockData.js';

export class JobService {
  /**
   * Get all workspace jobs
   */
  static async getJobs(config) {
    if (config.simulation) {
      return mockJobs;
    }

    try {
      const response = await axios.get(`${config.host}/api/2.1/jobs/list`, {
        headers: { Authorization: config.token }
      });
      const jobs = response.data.jobs || [];
      return jobs.map(j => ({
        id: j.job_id,
        name: j.settings?.name || 'Unnamed Job',
        owner: j.creator_user_name || 'System',
        schedule: j.settings?.schedule?.cron_expression || 'Manual',
        active: j.settings?.schedule?.pause_status === 'UNPAUSED',
        cluster: j.settings?.tasks?.[0]?.new_cluster ? 'Job-Specific Cluster' : 'Existing Shared Cluster',
        runtime: j.settings?.tasks?.[0]?.new_cluster?.spark_version || 'Default',
        inputs: [], // Real environment requires scanning tasks
        outputs: [],
        recent_runs: []
      }));
    } catch (error) {
      console.error('Error fetching jobs from Databricks API:', error.message);
      throw new Error(`Databricks Job Fetch Failed: ${error.message}`);
    }
  }

  /**
   * Get detail information for a single job including recent runs
   */
  static async getJobDetails(config, jobId) {
    const parsedId = parseInt(jobId);
    
    if (config.simulation) {
      return mockJobs.find(j => j.id === parsedId) || null;
    }

    try {
      // Fetch details of the specific job
      const detailsRes = await axios.get(`${config.host}/api/2.1/jobs/get`, {
        headers: { Authorization: config.token },
        params: { job_id: parsedId }
      });
      const j = detailsRes.data;

      // Fetch runs of the specific job
      const runsRes = await axios.get(`${config.host}/api/2.1/jobs/runs/list`, {
        headers: { Authorization: config.token },
        params: { job_id: parsedId, limit: 5 }
      }).catch(() => ({ data: { runs: [] } }));

      const recent_runs = (runsRes.data.runs || []).map(r => ({
        run_id: r.run_id,
        status: r.state?.result_state || r.state?.life_cycle_state || 'UNKNOWN',
        start_time: new Date(r.start_time).toISOString(),
        duration_ms: r.run_duration || 0,
        error: r.state?.state_message || null
      }));

      return {
        id: j.job_id,
        name: j.settings?.name || 'Unnamed Job',
        owner: j.creator_user_name || 'System',
        schedule: j.settings?.schedule?.cron_expression || 'Manual',
        active: j.settings?.schedule?.pause_status === 'UNPAUSED',
        cluster: j.settings?.tasks?.[0]?.new_cluster ? 'Job Cluster' : 'Shared Compute',
        runtime: j.settings?.tasks?.[0]?.new_cluster?.spark_version || 'Databricks Runtime',
        inputs: [],
        outputs: [],
        recent_runs
      };
    } catch (error) {
      console.error(`Error fetching job details for ID ${jobId}:`, error.message);
      throw new Error(`Databricks Job Details Fetch Failed: ${error.message}`);
    }
  }
}
