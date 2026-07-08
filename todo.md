# Databricks Live Integration Guide

Follow these steps to connect DataAtlas to your actual Databricks workspace and fetch live metadata, lineage records, and SQL query previews.

---

## 📋 Prerequisites & Steps

### 1. Gather your Databricks Parameters
You need three values from your active Databricks workspace:

1. **Workspace Host URL**:
   - The base URL of your workspace.
   - Format: `https://dbc-xxxxxx-xxxx.cloud.databricks.com`
   - Grab this directly from your browser's address bar when logged in.

2. **Personal Access Token (PAT)**:
   - Navigate to your Databricks workspace.
   - Click on your profile email in the top right corner ➔ **User Settings**.
   - Go to **Developer** ➔ **Access Tokens** ➔ Click **Generate token**.
   - Copy and save this token (starts with `dapi...`).

3. **SQL Warehouse HTTP Path** *(Optional - required for data previews & Delta history)*:
   - In Databricks, switch to the **SQL** persona.
   - Click **SQL Warehouses** in the sidebar.
   - Click on your active warehouse ➔ Go to the **Connection details** tab.
   - Copy the value under **HTTP path** (looks like `/sql/1.0/warehouses/1234567890abcdef`).

---

### 2. Configure Credentials

You can supply these credentials in one of two ways:

#### Option A: Server-Side environment variables (Permanent Configuration)
Open the [backend/.env](file:///c:/Users/yoges/Desktop/GitHub/DataScope/backend/.env) file and add your parameters:
```env
PORT=5000
DATABRICKS_HOST=https://dbc-xxxxxx-xxxx.cloud.databricks.com
DATABRICKS_TOKEN=dapixxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABRICKS_SQL_HTTP_PATH=/sql/1.0/warehouses/1234567890abcdef
```

#### Option B: Dynamic Client-Side login (Session Configuration)
1. Run the application and open `http://localhost:3000/login`.
2. Input your **Host URL**, **PAT Token**, and **SQL Warehouse Path** directly into the form fields.
3. Click **Connect Workspace**. (These credentials are held safely in your browser session and never saved on disk).

---

### 3. Setup and Launch the App
In your terminal, run the following commands at the root directory:
```bash
# 1. Install all dependencies for both frontend and backend
npm run setup

# 2. Start the Express API server and Vite React dev server concurrently
npm run dev
```

---

## 🔍 What It Will Show (Live Mode vs. Simulation)

Once connected to your live workspace, the application queries official REST APIs and executes SQL commands to show:

| Feature Section | Databricks REST API Endpoint / SQL Query | Live Telemetry Shown in UI |
| :--- | :--- | :--- |
| **Home Dashboard** | `/api/2.1/unity-catalog/catalogs` | Real counts of active catalogs, schemas, tables, and views registered inside Unity Catalog. |
| **Data Catalog** | `/api/2.1/unity-catalog/tables` | Browsable directories mapping tables. Selecting one shows actual columns, comments, data types, and primary keys. |
| **Data Preview** | `SELECT * FROM table LIMIT 5` *(via Warehouse)* | Renders 5 live preview records of table rows. |
| **Delta History** | `DESCRIBE HISTORY table LIMIT 10` *(via Warehouse)* | Renders version numbers, merge/write operations, timestamps, and usernames of who modified the table. |
| **Lineage Explorer** | `/api/2.0/lineage-tracking/table-lineage` | Renders a visual React Flow graph mapping actual upstream and downstream table dependencies. |
| **Scheduled Jobs** | `/api/2.1/jobs/list` & `/api/2.1/jobs/runs/list` | Shows actual Databricks workflows list, task status (SUCCESS/FAILED), schedules, and runtime engine versions. |
| **AI Assistant** | Centralized controller calls | Chatbot answers questions by fetching active table schemas, owners, and calculating blast radius on your live tables. |
