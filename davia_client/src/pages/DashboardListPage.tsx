import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dashboard } from '../types';
import { dashboardService } from '../services/api';

const DashboardsListPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await dashboardService.getAll();
        setDashboards(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboards');
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const handleCreateDashboard = async () => {
    try {
      const newDashboard = await dashboardService.create({
        title: 'New Dashboard',
        description: 'A new dashboard',
        layout: {},
        visualizations: []
      });
      
      setDashboards([...dashboards, newDashboard]);
    } catch (err: any) {
      setError(err.message || 'Failed to create dashboard');
    }
  };

  const handleDeleteDashboard = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this dashboard?')) {
      return;
    }
    
    try {
      await dashboardService.delete(id);
      setDashboards(dashboards.filter(dashboard => dashboard.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading dashboards...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <button
          onClick={handleCreateDashboard}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          Create New Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {dashboards.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No dashboards yet</h2>
          <p className="text-gray-600 mb-6">Create your first dashboard to get started</p>
          <button
            onClick={handleCreateDashboard}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Create Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map(dashboard => (
            <div key={dashboard.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{dashboard.title}</h2>
                {dashboard.description && (
                  <p className="text-gray-600 mb-4">{dashboard.description}</p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  Created on {new Date(dashboard.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  {dashboard.visualizations.length} visualizations
                </p>
                <div className="flex justify-between">
                  <Link
                    to={`/dashboards/${dashboard.id}`}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteDashboard(dashboard.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardsListPage;