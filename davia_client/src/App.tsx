// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardsListPage from './pages/DashboardListPage';
import DashboardPage from './pages/DashboardPage';
import VisualizationsListPage from './pages/VisualizationsListPage';
import VisualizationPage from './pages/VisualizationPage';
import CreateVisualizationPage from './pages/CreateVisualizationPage';
import DataSourcesPage from './pages/DataSourcesPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Header from './components/layout/Header';
import ProtectedRoute from './auth/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16 pb-8">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
            <Route path="/dashboards" element={<ProtectedRoute element={<DashboardsListPage />} />} />
            <Route path="/dashboards/:id" element={<ProtectedRoute element={<DashboardPage />} />} />
            <Route path="/visualizations" element={<ProtectedRoute element={<VisualizationsListPage />} />} />
            <Route path="/visualizations/:id" element={<ProtectedRoute element={<VisualizationPage />} />} />
            <Route path="/visualizations/new" element={<ProtectedRoute element={<CreateVisualizationPage />} />} />
            <Route path="/datasources" element={<ProtectedRoute element={<DataSourcesPage />} />} />
            
            {/* Fallback routes */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}