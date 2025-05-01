import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Dashboard, Visualization } from '../../types';
import ChartComponent from '../visualization/ChartComponent';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  dashboard: Dashboard;
  visualizations: Visualization[];
  onLayoutChange?: (layout: any) => void;
  editable?: boolean;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  dashboard, 
  visualizations, 
  onLayoutChange,
  editable = false
}) => {
  // Create a mapping of visualization IDs to their actual objects
  const vizMap = visualizations.reduce((acc, viz) => {
    acc[viz.id] = viz;
    return acc;
  }, {} as Record<number, Visualization>);

  // Transform dashboard visualizations to layout format
  const layouts = {
    lg: dashboard.visualizations.map(item => ({
      i: item.visualization.toString(),
      x: item.position_x,
      y: item.position_y,
      w: item.width,
      h: item.height,
      minW: 2,
      minH: 2,
    }))
  };

  const handleLayoutChange = (layout: any) => {
    if (onLayoutChange) {
      // Transform the layout back to the dashboard visualization format
      const updatedVisualizations = layout.map((item: any) => ({
        visualization: parseInt(item.i),
        position_x: item.x,
        position_y: item.y,
        width: item.w,
        height: item.h,
      }));
      
      onLayoutChange(updatedVisualizations);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={editable}
        isResizable={editable}
        onLayoutChange={handleLayoutChange}
      >
        {dashboard.visualizations.map(item => (
          <div key={item.visualization.toString()}>
            {vizMap[item.visualization] ? (
              <ChartComponent 
                visualization={vizMap[item.visualization]} 
                height={item.height * 100 - 40} // Adjust for padding
              />
            ) : (
              <div className="bg-white p-4 rounded-lg shadow h-full flex items-center justify-center">
                <p className="text-red-500">Visualization not found</p>
              </div>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardGrid;