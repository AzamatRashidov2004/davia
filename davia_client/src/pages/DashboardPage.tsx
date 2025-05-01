import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dashboard, Visualization } from '../types';
import { dashboardService, visualizationService } from '../services/api';
import DashboardGrid from '../components/dashboard/DashboardGrid';

const DashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (!id) throw new Error('Dashboard ID is required');
        
        const dashboardData = await dashboardService.getById(parseInt(id));
        setDashboard(dashboardData);
        
        // Fetch all visualizations for this dashboard
        const vizIds = dashboardData.visualizations.map(v => v.visualization);
        const vizPromises = vizIds.map(vizId => visualizationService.getById(vizId));
        
        const vizData = await Promise.all(vizPromises);
        setVisualizations(vizData);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  const handleLayoutChange = async (newLayout: any) => {
    if (dashboard) {
      try {
        const updatedDashboard = {
          ...dashboard,
          visualizations: newLayout,
        };
        
        await dashboardService.update(dashboard.id, updatedDashboard);
        setDashboard(updatedDashboard);
      } catch (err) {
        console.error('Failed to update dashboard layout', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">{error || 'Dashboard not found'}</div>
        <Link to="/dashboards" className="text-blue-500 hover:underline">
          Back to Dashboards
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.title}</h1>
          {dashboard.description && (
            <p className="text-gray-600 mt-1">{dashboard.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              editMode 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Save Layout' : 'Edit Layout'}
          </button>
          <Link
            to="/visualizations/new"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
          >
            Add Visualization
          </Link>
        </div>
      </div>

      {visualizations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No visualizations yet</h2>
          <p className="text-gray-600 mb-6">Create your first visualization to add to this dashboard</p>
          <Link
            to="/visualizations/new"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Create Visualization
          </Link>
        </div>
      ) : (
        <DashboardGrid
          dashboard={dashboard}
          visualizations={visualizations}
          onLayoutChange={handleLayoutChange}
          editable={editMode}
        />
      )}
    </div>
  );
};

export default DashboardPage;