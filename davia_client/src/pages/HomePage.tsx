import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommandInput from '../components/nlp/CommandInput';
import { NaturalLanguageCommand, Visualization } from '../types';
import { commandService, visualizationService } from '../services/api';
import ChartComponent from '../components/visualization/ChartComponent';

const HomePage: React.FC = () => {
  const [recentCommands, setRecentCommands] = useState<NaturalLanguageCommand[]>([]);
  const [recentVisualizations, setRecentVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commands, visualizations] = await Promise.all([
          commandService.getAll(),
          visualizationService.getAll(),
        ]);
        
        setRecentCommands(commands.slice(0, 5));
        setRecentVisualizations(visualizations.slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCommandSubmit = (command: NaturalLanguageCommand) => {
    setRecentCommands([command, ...recentCommands.slice(0, 4)]);
    
    // Poll for the command status and result
    const interval = setInterval(async () => {
      try {
        const updatedCommand = await commandService.getById(command.id);
        
        if (updatedCommand.status === 'completed' || updatedCommand.status === 'error') {
          clearInterval(interval);
          
          setRecentCommands(current => 
            current.map(cmd => cmd.id === updatedCommand.id ? updatedCommand : cmd)
          );
          
          if (updatedCommand.status === 'completed' && updatedCommand.result_visualization) {
            const newViz = await visualizationService.getById(updatedCommand.result_visualization);
            setRecentVisualizations([newViz, ...recentVisualizations.slice(0, 3)]);
          }
        }
      } catch (err) {
        console.error('Failed to poll command status', err);
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to DAVIA</h1>
        <p className="text-xl text-gray-600">
          Your Data Visualization AI Assistant
        </p>
      </div>
      
      <div className="mb-8">
        <CommandInput onCommandSubmit={handleCommandSubmit} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Recent Visualizations</h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p>Loading recent visualizations...</p>
            </div>
          ) : recentVisualizations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">No visualizations yet</h3>
              <p className="text-gray-600 mb-6">
                Type a command above to create your first visualization
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentVisualizations.map(viz => (
                <Link key={viz.id} to={`/visualizations/${viz.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <ChartComponent visualization={viz} height={200} />
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-right">
            <Link to="/visualizations" className="text-blue-500 hover:underline">
              View all visualizations →
            </Link>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Commands</h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p>Loading recent commands...</p>
            </div>
          ) : recentCommands.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-gray-600">No commands yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <ul className="divide-y divide-gray-200">
                {recentCommands.map(command => (
                  <li key={command.id} className="p-4">
                    <p className="font-medium">{command.text}</p>
                    <div className="flex items-center mt-2">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          command.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : command.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : command.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {command.status.charAt(0).toUpperCase() + command.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(command.created_at).toLocaleTimeString()}
                      </span>
                      {command.result_visualization && (
                        <Link 
                          to={`/visualizations/${command.result_visualization}`}
                          className="ml-auto text-blue-500 text-sm hover:underline"
                        >
                          View Visualization
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;