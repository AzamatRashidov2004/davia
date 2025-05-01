from ..models import DataSource, Visualization
from .mock_data_service import MockDataService

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
        # For now, we'll return mock data based on the visualization type and data source
        data_source_name = visualization.data_source.name
        
        if visualization.viz_type == 'bar':
            return MockDataService.get_bar_chart_data(data_source_name)
        elif visualization.viz_type == 'line':
            return MockDataService.get_line_chart_data(data_source_name)
        elif visualization.viz_type == 'pie':
            return MockDataService.get_pie_chart_data(data_source_name)
        else:
            # Default to bar chart data
            return MockDataService.get_bar_chart_data(data_source_name)