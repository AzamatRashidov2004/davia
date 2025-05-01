import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Visualization } from '../types';
import { visualizationService } from '../services/api';
import ChartComponent from '../components/visualization/ChartComponent';

const VisualizationsListPage: React.FC = () => {
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisualizations = async () => {
      try {
        const data = await visualizationService.getAll();
        setVisualizations(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load visualizations');
        setLoading(false);
      }
    };

    fetchVisualizations();
  }, []);

  const handleDeleteVisualization = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this visualization?')) {
      return;
    }
    
    try {
      await visualizationService.delete(id);
      setVisualizations(visualizations.filter(viz => viz.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete visualization');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading visualizations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Visualizations</h1>
        <Link
          to="/visualizations/new"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          Create New Visualization
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {visualizations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No visualizations yet</h2>
          <p className="text-gray-600 mb-6">Create your first visualization to get started</p>
          <Link
            to="/visualizations/new"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Create Visualization
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualizations.map(visualization => (
            <div key={visualization.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{visualization.title}</h2>
                <div className="h-48 mb-4">
                  <ChartComponent visualization={visualization} height={180} />
                </div>
                <div className="flex justify-between">
                  <Link
                    to={`/visualizations/${visualization.id}`}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteVisualization(visualization.id)}
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

export default VisualizationsListPage;