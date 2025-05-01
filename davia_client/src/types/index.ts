export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    organization?: string;
    profile_image?: string | null;
  }
  
  export interface DataSource {
    id: number;
    name: string;
    description?: string;
    source_type: 'csv' | 'json' | 'api' | 'database';
    connection_string?: string;
    schema?: any;
    created_at: string;
    updated_at: string;
  }
  
  export interface Visualization {
    id: number;
    title: string;
    description?: string;
    viz_type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'table';
    config: any;
    data_source: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface DashboardVisualization {
    visualization: number;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
  }
  
  export interface Dashboard {
    id: number;
    title: string;
    description?: string;
    layout: any;
    visualizations: DashboardVisualization[];
    created_at: string;
    updated_at: string;
  }
  
  export interface NaturalLanguageCommand {
    id: number;
    text: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    result_visualization?: number;
    created_at: string;
  }