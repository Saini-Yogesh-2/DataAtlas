import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
// Support myenv loading as fallback if user named file myenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../myenv') });
dotenv.config({ path: path.resolve(__dirname, '../../myenv') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Extracts and returns the Databricks configuration based on incoming request headers
 * or environment variables. If no configuration is provided, it returns Simulation Mode.
 * 
 * @param {import('express').Request} req - The Express request object
 * @returns {object} The configuration containing host, token, warehousePath, and simulation flag
 */
export function getDatabricksConfig(req) {
  // Check headers first (allows frontend-configured credentials)
  let host = req?.headers['x-databricks-host'];
  let token = req?.headers['x-databricks-token'];
  let warehousePath = req?.headers['x-databricks-warehouse-path'];

  // Fallback to environment variables
  if (!host) host = process.env.DATABRICKS_HOST;
  if (!token) token = process.env.DATABRICKS_TOKEN;
  if (!warehousePath) warehousePath = process.env.DATABRICKS_SQL_HTTP_PATH;

  // Clean host URL (ensure it starts with https:// and has no trailing slash)
  if (host) {
    host = host.trim();
    if (!host.startsWith('http://') && !host.startsWith('https://')) {
      host = `https://${host}`;
    }
    if (host.endsWith('/')) {
      host = host.slice(0, -1);
    }
  }

  const hasCredentials = host && token;

  return {
    host: host || null,
    token: token ? `Bearer ${token.trim()}` : null,
    warehousePath: warehousePath || null,
    simulation: !hasCredentials
  };
}
