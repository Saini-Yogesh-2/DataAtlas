import axios from 'axios';

export class AuthService {
  /**
   * Tests connection and verifies if credentials are valid
   * 
   * @param {object} config - Databricks host/token configuration
   */
  static async verifyCredentials(config) {
    if (config.simulation) {
      return {
        success: true,
        mode: 'Simulation',
        user: 'Demo Administrator',
        workspace: 'simulation-workspace-medallion'
      };
    }

    try {
      // SCIM Me endpoint or catalogs endpoint is standard for validating PATs
      const response = await axios.get(`${config.host}/api/2.0/preview/scim/v2/Me`, {
        headers: { Authorization: config.token }
      }).catch(async () => {
        // Fallback check if SCIM is disabled: attempt listing catalogs (much safer UC permission)
        return await axios.get(`${config.host}/api/2.1/unity-catalog/catalogs`, {
          headers: { Authorization: config.token }
        });
      });

      return {
        success: true,
        mode: 'Live Workspace',
        user: response.data?.userName || response.data?.emails?.[0]?.value || 'Unity Catalog Analyst',
        workspace: config.host.replace('https://', '')
      };
    } catch (error) {
      console.error('Authentication check failed against Databricks API:', error.message);
      throw new Error(`Authentication check failed. Please verify Host and PAT token are correct: ${error.message}`);
    }
  }
}
