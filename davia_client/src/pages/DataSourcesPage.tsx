import React, { useEffect, useState } from 'react';
import { DataSource } from '../types';
import { dataSourceService } from '../services/api';

const DataSourcesPage: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDataSource, setNewDataSource] = useState<Partial<DataSource>>({
    name: '',
    description: '',
    source_type: 'csv'
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDataSource({ ...newDataSource, [name]: value });
  };

  const handleCreateDataSource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const createdDataSource = await dataSourceService.create(newDataSource);
      setDataSources([...dataSources, createdDataSource]);
      setNewDataSource({
        name: '',
        description: '',
        source_type: 'csv'
      });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create data source');
    }
  };

  const handleDeleteDataSource = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this data source?')) {
      return;
    }
    
    try {
      await dataSourceService.delete(id);
      setDataSources(dataSources.filter(ds => ds.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete data source');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading data sources...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          {showAddForm ? 'Cancel' : 'Add Data Source'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Data Source</h2>
          <form onSubmit={handleCreateDataSource}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="source_type">
                Source Type
              </label>
              <select
                id="source_type"
                name="source_type"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newDataSource.source_type}
                onChange={handleInputChange}
                required
              >
                <option value="csv">CSV File</option>
                <option value="json">JSON File</option>
                <option value="api">API Endpoint</option>
                <option value="database">Database</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="connection_string">
                Connection String / File Path
              </label>
              <input
                id="connection_string"
                name="connection_string"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newDataSource.connection_string || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                Create Data Source
              </button>
            </div>
          </form>
        </div>
      )}

      {dataSources.length === 0 && !showAddForm ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No data sources yet</h2>
          <p className="text-gray-600 mb-6">Add your first data source to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Add Data Source
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataSources.map(dataSource => (
            <div key={dataSource.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{dataSource.name}</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {dataSource.source_type.toUpperCase()}
                  </span>
                </div>
                
                {dataSource.description && (
                  <p className="text-gray-600 mb-4">{dataSource.description}</p>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-semibold">Created:</span>{' '}
                    {new Date(dataSource.created_at).toLocaleDateString()}
                  </p>
                  
                  {dataSource.connection_string && (
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-semibold">Connection:</span>{' '}
                      {dataSource.connection_string}
                    </p>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleDeleteDataSource(dataSource.id)}
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

export default DataSourcesPage;