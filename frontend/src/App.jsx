import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Catalog from './pages/Catalog';
import TableDetail from './pages/TableDetail';
import Lineage from './pages/Lineage';
import ImpactAnalysis from './pages/ImpactAnalysis';
import JobExplorer from './pages/JobExplorer';
import PipelineExplorer from './pages/PipelineExplorer';
import OwnershipCenter from './pages/OwnershipCenter';
import MetadataAnalytics from './pages/MetadataAnalytics';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Connection Setup route */}
          <Route path="/login" element={<Login />} />
          
          {/* Main platform shell routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="search" element={<Search />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/:catalog/:schema/:table" element={<TableDetail />} />
            <Route path="lineage" element={<Lineage />} />
            <Route path="impact" element={<ImpactAnalysis />} />
            <Route path="jobs" element={<JobExplorer />} />
            <Route path="pipelines" element={<PipelineExplorer />} />
            <Route path="ownership" element={<OwnershipCenter />} />
            <Route path="analytics" element={<MetadataAnalytics />} />
          </Route>
          
          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
