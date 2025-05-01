import re
import random
from ..models import DataSource

class NLPService:
    """
    Simple NLP service for processing natural language commands.
    In a real implementation, this would use more sophisticated NLP techniques.
    """
    
    def process_command(self, command_text):
        """
        Process a natural language command and extract visualization parameters.
        
        Args:
            command_text (str): The natural language command from the user
            
        Returns:
            dict: Parameters for creating a visualization
        """
        # This is a simplified mock implementation
        command_lower = command_text.lower()
        
        # Detect chart type
        viz_type = self._detect_chart_type(command_lower)
        
        # Detect data source (in real implementation, this would be more sophisticated)
        data_source_id = self._detect_data_source(command_lower)
        
        # Create a config based on the command
        config = self._create_config(command_lower, viz_type)
        
        return {
            'viz_type': viz_type,
            'data_source_id': data_source_id,
            'config': config
        }
    
    def _detect_chart_type(self, command):
        """Detect the chart type from the command text."""
        if 'bar' in command or 'compare' in command:
            return 'bar'
        elif 'line' in command or 'trend' in command or 'over time' in command:
            return 'line'
        elif 'pie' in command or 'distribution' in command or 'percentage' in command:
            return 'pie'
        elif 'scatter' in command or 'correlation' in command:
            return 'scatter'
        elif 'heat' in command or 'map' in command:
            return 'heatmap'
        elif 'table' in command:
            return 'table'
        else:
            # Default to bar chart if we can't determine
            return 'bar'
    
    def _detect_data_source(self, command):
        """
        Detect the data source from the command text.
        In a real implementation, this would query available data sources.
        """
        # Mock implementation - would be replaced with actual logic
        try:
            # Try to find a data source that matches the command
            data_sources = DataSource.objects.all()
            for ds in data_sources:
                if ds.name.lower() in command:
                    return ds.id
            
            # If no match, return the first data source
            if data_sources.exists():
                return data_sources.first().id
                
            return None
        except:
            return None
    
    def _create_config(self, command, viz_type):
        """Create a visualization config based on the command and viz type."""
        # This is a simplified mock implementation
        config = {
            'title': self._extract_title(command),
            'description': '',
        }
        
        if viz_type == 'bar':
            config.update({
                'xAxisLabel': 'Category',
                'yAxisLabel': 'Value',
                'orientation': 'vertical'
            })
        elif viz_type == 'line':
            config.update({
                'xAxisLabel': 'Time',
                'yAxisLabel': 'Value',
                'showPoints': True
            })
        elif viz_type == 'pie':
            config.update({
                'showLegend': True,
                'showLabels': True
            })
        
        return config
    
    def _extract_title(self, command):
        """Extract a title from the command."""
        # Simple heuristic - use the command as the title but clean it up
        title = command.capitalize()
        if title.endswith('?'):
            title = title[:-1]
        
        # If the title is too long, truncate it
        if len(title) > 50:
            title = title[:47] + '...'
            
        return title