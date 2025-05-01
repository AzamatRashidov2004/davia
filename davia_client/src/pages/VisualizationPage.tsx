import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Visualization, Dashboard } from '../types';
import { visualizationService, dashboardService } from '../services/api';
import ChartComponent from '../components/visualization/ChartComponent';

const VisualizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visualization, setVisualization] = useState<Visualization | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error('Visualization ID is required');
        
        const [vizData, dashboardsData] = await Promise.all([
          visualizationService.getById(parseInt(id)),
          dashboardService.getAll()
        ]);
        
        setVisualization(vizData);
        setDashboards(dashboardsData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load visualization');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToDashboard = async () => {
    if (!visualization || selectedDashboard === '') return;
    
    try {
      const dashboardId = parseInt(selectedDashboard.toString());
      const dashboard = dashboards.find(d => d.id === dashboardId);
      
      if (!dashboard) throw new Error('Dashboard not found');
      
      // Create a new dashboard visualization entry
      const newVisualization = {
        visualization: visualization.id,
        position_x: 0, // Default position
        position_y: 0, // Will be adjusted based on existing items
        width: 6, // Default width (half of a 12-column grid)
        height: 4, // Default height
      };
      
      // Find the maximum y position to place this at the bottom
      const maxY = dashboard.visualizations.reduce(
        (max, viz) => Math.max(max, viz.position_y + viz.height),
        0
      );
      
      newVisualization.position_y = maxY;
      
      // Add the new visualization to the dashboard
      const updatedDashboard = {
        ...dashboard,
        visualizations: [...dashboard.visualizations, newVisualization],
      };
      
      await dashboardService.update(dashboardId, updatedDashboard);
      
      // Navigate to the dashboard
      navigate(`/dashboards/${dashboardId}`);
    } catch (err: any) {
      console.error('Failed to add to dashboard', err);
      setError(err.message || 'Failed to add visualization to dashboard');
    }
  };

  const handleExport = () => {
    // In a real implementation, this would generate and download the chart as an image
    alert('Export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading visualization...</div>
      </div>
    );
  }

  if (error || !visualization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">{error || 'Visualization not found'}</div>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{visualization.title}</h1>
          {visualization.description && (
            <p className="text-gray-600 mt-1">{visualization.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            Export
          </button>
          <button
            onClick={() => navigate(`/visualizations/${visualization.id}/edit`)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <ChartComponent visualization={visualization} height={500} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Add to Dashboard</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dashboard">
              Select Dashboard
            </label>
            <select
              id="dashboard"
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              value={selectedDashboard}
              onChange={(e) => setSelectedDashboard(parseInt(e.target.value) || '')}
            >
              <option value="">Select a dashboard</option>
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddToDashboard}
            disabled={selectedDashboard === ''}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            Add to Dashboard
          </button>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Visualization Details</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Type:</span>{' '}
                {visualization.viz_type.charAt(0).toUpperCase() + visualization.viz_type.slice(1)} Chart
              </p>
              <p>
                <span className="font-semibold">Created:</span>{' '}
                {new Date(visualization.created_at).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Last Updated:</span>{' '}
                {new Date(visualization.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;