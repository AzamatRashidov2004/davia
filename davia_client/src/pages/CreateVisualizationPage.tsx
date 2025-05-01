import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataSource } from '../types';
import { visualizationService, dataSourceService } from '../services/api';
import CommandInput from '../components/nlp/CommandInput';

const CreateVisualizationPage: React.FC = () => {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const data = await dataSourceService.getAll();
        setDataSources(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data sources');
        setLoading(false);
      }
    };

    fetchDataSources();
  }, []);

  const handleCommandSubmit = async (command: { id: number; text: string }) => {
    // Navigate to home page to see the command processing status
    navigate('/');
  };

  const handleManualCreate = async () => {
    try {
      // This would be a form in a real implementation
      const newVisualization = await visualizationService.create({
        title: 'New Visualization',
        description: 'A manually created visualization',
        viz_type: 'bar',
        config: {
          xAxisLabel: 'Category',
          yAxisLabel: 'Value',
          orientation: 'vertical'
        },
        data_source: dataSources[0]?.id || 1 // Use the first data source or default to 1
      });
      
      navigate(`/visualizations/${newVisualization.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create visualization');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Visualization</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create with Natural Language</h2>
            <CommandInput onCommandSubmit={handleCommandSubmit} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create Manually</h2>
          <p className="text-gray-600 mb-6">
            You can also create a visualization manually by selecting a data source and chart type.
          </p>
          
          {dataSources.length === 0 ? (
            <div>
              <p className="text-red-500 mb-4">No data sources available</p>
              <p className="text-gray-600">
                Please create a data source first to use manual creation.
              </p>
            </div>
          ) : (
            <button
              onClick={handleManualCreate}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Create Visualization
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateVisualizationPage;
