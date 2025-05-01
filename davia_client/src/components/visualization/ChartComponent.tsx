import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Visualization } from '../../types';
import { visualizationService } from '../../services/api';

interface ChartComponentProps {
  visualization: Visualization;
  height?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ visualization, height = 300 }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chartData = await visualizationService.getData(visualization.id);
        setData(chartData.datasets[0].data.map((value: any, index: number) => ({
          name: chartData.labels[index],
          value
        })));
        setLoading(false);
      } catch (err) {
        setError('Failed to load chart data');
        setLoading(false);
      }
    };

    fetchData();
  }, [visualization.id]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading chart...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const renderChart = () => {
    switch (visualization.viz_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type: {visualization.viz_type}</div>;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{visualization.title}</h3>
      {visualization.description && <p className="text-sm text-gray-600 mb-4">{visualization.description}</p>}
      {renderChart()}
    </div>
  );
};

export default ChartComponent;