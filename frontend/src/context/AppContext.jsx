import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state (check local storage or default dark)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  // Databricks credential settings (held in session storage for security)
  const [credentials, setCredentials] = useState(() => {
    const host = sessionStorage.getItem('db_host');
    const token = sessionStorage.getItem('db_token');
    const warehousePath = sessionStorage.getItem('db_warehouse_path');
    
    if (host && token) {
      return { host, token, warehousePath };
    }
    return null;
  });

  const [connectionDetails, setConnectionDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync connectionDetails on credential update or initial mount
  useEffect(() => {
    verifyConnection();
  }, [credentials]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addNotification = (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 5000);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const verifyConnection = async () => {
    try {
      const headers = credentials ? {
        'X-Databricks-Host': credentials.host,
        'X-Databricks-Token': credentials.token,
        'X-Databricks-Warehouse-Path': credentials.warehousePath
      } : {};

      const response = await axios.post('/api/auth/test', {}, { headers });
      setConnectionDetails(response.data);
      addNotification(`Connected successfully under ${response.data.mode} mode`, 'success');
      return true;
    } catch (error) {
      console.error('Connection verification failed:', error);
      const errMsg = error.response?.data?.message || error.message;
      addNotification(`Connection Failed: ${errMsg}`, 'error');
      
      setConnectionDetails({
        success: false,
        mode: 'Live Workspace (Error)',
        user: 'None',
        error: errMsg,
        workspace: credentials?.host?.replace('https://', '') || 'unknown-workspace'
      });
      return false;
    }
  };

  const login = async (host, token, warehousePath) => {
    try {
      const headers = {
        'X-Databricks-Host': host,
        'X-Databricks-Token': token,
        'X-Databricks-Warehouse-Path': warehousePath || ''
      };

      const response = await axios.post('/api/auth/test', {}, { headers });

      sessionStorage.setItem('db_host', host);
      sessionStorage.setItem('db_token', token);
      if (warehousePath) {
        sessionStorage.setItem('db_warehouse_path', warehousePath);
      } else {
        sessionStorage.removeItem('db_warehouse_path');
      }

      setCredentials({ host, token, warehousePath });
      setConnectionDetails(response.data);
      addNotification(`Connected successfully under ${response.data.mode} mode`, 'success');
      return true;
    } catch (error) {
      console.error('Connection verification failed:', error);
      const errMsg = error.response?.data?.message || error.message;
      addNotification(`Connection Failed: ${errMsg}`, 'error');
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setCredentials(null);
    setConnectionDetails(null);
    addNotification('Logged out. Running in Simulation mode.', 'info');
  };

  // Helper to build Axios configurations containing headers
  const getRequestConfig = () => {
    if (!credentials) return {};
    return {
      headers: {
        'X-Databricks-Host': credentials.host,
        'X-Databricks-Token': credentials.token,
        'X-Databricks-Warehouse-Path': credentials.warehousePath || ''
      }
    };
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      credentials,
      connectionDetails,
      login,
      logout,
      notifications,
      addNotification,
      dismissNotification,
      getRequestConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
