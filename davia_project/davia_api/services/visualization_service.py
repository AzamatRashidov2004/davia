from ..models import DataSource, Visualization

class VisualizationService:
    """Service for creating and manipulating visualizations."""
    
    def create_visualization(self, user, data_source_id, viz_type, config):
        """
        Create a new visualization.
        
        Args:
            user: The user who owns the visualization
            data_source_id: ID of the data source
            viz_type: Type of visualization
            config: Visualization configuration
            
        Returns:
            Visualization: The created visualization object
        """
        try:
            data_source = DataSource.objects.get(id=data_source_id, owner=user)
        except DataSource.DoesNotExist:
            raise ValueError(f"Data source with ID {data_source_id} not found")
        
        # Create the visualization
        visualization = Visualization.objects.create(
            title=config.get('title', 'Untitled Visualization'),
            description=config.get('description', ''),
            viz_type=viz_type,
            config=config,
            data_source=data_source,
            owner=user
        )
        
        return visualization
    
    def get_visualization_data(self, visualization_id, user):
        """
        Get the data for a visualization.
        
        Args:
            visualization_id: ID of the visualization
            user: The user requesting the data
            
        Returns:
            dict: The visualization data
        """
        try:
            visualization = Visualization.objects.get(id=visualization_id, owner=user)
        except Visualization.DoesNotExist:
            raise ValueError(f"Visualization with ID {visualization_id} not found")
        
        # In a real implementation, this would fetch and process data from the data source
        # For now, we'll return mock data based on the visualization type
        if visualization.viz_type == 'bar':
            return self._generate_bar_chart_data()
        elif visualization.viz_type == 'line':
            return self._generate_line_chart_data()
        elif visualization.viz_type == 'pie':
            return self._generate_pie_chart_data()
        else:
            return {'error': 'Unsupported visualization type'}
    
    def _generate_bar_chart_data(self):
        """Generate mock data for a bar chart."""
        return {
            'labels': ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
            'datasets': [{
                'data': [65, 59, 80, 81, 56]
            }]
        }
    
    def _generate_line_chart_data(self):
        """Generate mock data for a line chart."""
        return {
            'labels': ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            'datasets': [{
                'data': [65, 59, 80, 81, 56, 55, 40]
            }]
        }
    
    def _generate_pie_chart_data(self):
        """Generate mock data for a pie chart."""
        return {
            'labels': ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
            'datasets': [{
                'data': [300, 50, 100, 40, 120]
            }]
        }