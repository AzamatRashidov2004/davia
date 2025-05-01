import React, { useState } from 'react';
import { commandService } from '../../services/api';

interface CommandInputProps {
  onCommandSubmit?: (command: { id: number; text: string }) => void;
}

const CommandInput: React.FC<CommandInputProps> = ({ onCommandSubmit }) => {
  const [commandText, setCommandText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await commandService.create({ text: commandText });
      setCommandText('');
      if (onCommandSubmit) {
        onCommandSubmit(response);
      }
    } catch (err) {
      setError('Failed to process command. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2">
          <label htmlFor="commandInput" className="font-medium text-gray-700">
            What would you like to visualize?
          </label>
          <div className="flex space-x-2">
            <input
              id="commandInput"
              type="text"
              className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Show me the sales trend for last quarter"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || !commandText.trim()}
            >
              {loading ? 'Processing...' : 'Visualize'}
            </button>
          </div>
        </div>
      </form>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      <div className="mt-3 text-sm text-gray-600">
        <p>Try these examples:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Show me the monthly sales for 2023</li>
          <li>Compare revenue by product category</li>
          <li>What's the distribution of customers by region?</li>
        </ul>
      </div>
    </div>
  );
};

export default CommandInput;