import re
import random
from ..models import DataSource

class NLPService:
    """
    NLP service for processing natural language commands.
    This is a simplified implementation that uses basic pattern matching.
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
        command_lower = command_text.lower()
        
        # Detect chart type
        viz_type = self._detect_chart_type(command_lower)
        
        # Detect data source (in real implementation, this would be more sophisticated)
        data_source_id = self._detect_data_source(command_lower)
        
        # If no data source is explicitly mentioned, pick one based on the command
        if not data_source_id:
            data_source_id = self._suggest_data_source_by_topic(command_lower)
        
        # Create a config based on the command
        config = self._create_config(command_lower, viz_type)
        
        return {
            'viz_type': viz_type,
            'data_source_id': data_source_id,
            'config': config
        }
    
    def _detect_chart_type(self, command):
        """Detect the chart type from the command text."""
        # Map keywords to chart types
        chart_type_keywords = {
            'bar': ['bar', 'compare', 'comparison', 'comparing'],
            'line': ['line', 'trend', 'over time', 'timeline', 'historical'],
            'pie': ['pie', 'distribution', 'percentage', 'proportion', 'share']
        }
        
        # Check for explicit chart type mentions
        for chart_type, keywords in chart_type_keywords.items():
            for keyword in keywords:
                if keyword in command:
                    return chart_type
        
        # If no explicit chart type is mentioned, infer from the command
        if any(word in command for word in ['monthly', 'yearly', 'quarterly', 'week', 'day', 'annual']):
            return 'line'  # Time series data is best shown with a line chart
        
        if any(word in command for word in ['by category', 'by region', 'by product', 'breakdown']):
            if 'top' in command or 'bottom' in command or 'highest' in command or 'lowest' in command:
                return 'bar'  # Rankings are best shown with bar charts
            else:
                return 'pie'  # Distributions are often shown with pie charts
        
        # Default to bar chart if we can't determine
        return 'bar'
    
    def _detect_data_source(self, command):
        """
        Detect the data source from the command text.
        Checks if any data source names are explicitly mentioned.
        """
        try:
            # Get all data sources
            data_sources = DataSource.objects.all()
            
            # Check if any data source name is mentioned in the command
            for ds in data_sources:
                # Convert to lowercase for case-insensitive matching
                ds_name_lower = ds.name.lower()
                if ds_name_lower in command:
                    return ds.id
            
            # If no match, return the first data source
            if data_sources.exists():
                return data_sources.first().id
                
            return None
        except Exception:
            return None
    
    def _suggest_data_source_by_topic(self, command):
        """
        Suggest a data source based on the topic mentioned in the command.
        If no appropriate data source exists, create one.
        """
        try:
            # Extract potential topics from the command
            topics = []
            
            # Check for sales-related topics
            if any(word in command for word in ['sales', 'revenue', 'income']):
                topics.append('sales')
            
            # Check for product-related topics
            if any(word in command for word in ['product', 'item', 'merchandise']):
                topics.append('products')
            
            # Check for regional or geographic topics
            if any(word in command for word in ['region', 'country', 'location', 'geographic', 'area']):
                topics.append('regions')
            
            # Check if any matching data sources exist
            data_sources = DataSource.objects.all()
            
            # Try to find a match based on extracted topics
            for topic in topics:
                for ds in data_sources:
                    if topic in ds.name.lower():
                        return ds.id
            
            # If we have data sources but no match, return the first one
            if data_sources.exists():
                return data_sources.first().id
                
            return None
        except Exception:
            return None
    
    def _create_config(self, command, viz_type):
        """Create a visualization config based on the command and viz type."""
        # Extract a title from the command
        title = self._extract_title(command)
        
        # Create a basic config
        config = {
            'title': title,
            'description': '',
        }
        
        # Add chart-specific config
        if viz_type == 'bar':
            config.update({
                'xAxisLabel': self._extract_category_axis_label(command) or 'Category',
                'yAxisLabel': self._extract_value_axis_label(command) or 'Value',
                'orientation': 'vertical'
            })
        elif viz_type == 'line':
            config.update({
                'xAxisLabel': self._extract_time_axis_label(command) or 'Time',
                'yAxisLabel': self._extract_value_axis_label(command) or 'Value',
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
        # Clean up the command to create a title
        title = command.capitalize()
        
        # Remove question marks
        title = title.replace('?', '')
        
        # Remove common command phrases
        common_phrases = [
            'show me', 'display', 'create', 'generate', 'visualize', 
            'chart', 'graph', 'plot', 'can you', 'please'
        ]
        for phrase in common_phrases:
            title = re.sub(r'\b' + phrase + r'\b', '', title, flags=re.IGNORECASE)
        
        # Clean up multiple spaces
        title = re.sub(r'\s+', ' ', title).strip()
        
        # Add appropriate prefix if the title doesn't start with a common topic
        if not any(title.lower().startswith(topic) for topic in ['sales', 'revenue', 'product', 'region']):
            topics = {
                'sales': ['sales', 'revenue', 'income'],
                'products': ['product', 'item'],
                'regions': ['region', 'geographic', 'location']
            }
            
            for topic, keywords in topics.items():
                if any(keyword in command.lower() for keyword in keywords):
                    title = topic.capitalize() + ': ' + title
                    break
        
        # If the title is too long, truncate it
        if len(title) > 50:
            title = title[:47] + '...'
            
        return title
    
    def _extract_category_axis_label(self, command):
        """Extract a label for the category axis."""
        # Look for phrases that indicate the category
        category_patterns = [
            r'by\s+(\w+)',
            r'(\w+)\s+breakdown',
            r'across\s+(\w+)'
        ]
        
        for pattern in category_patterns:
            match = re.search(pattern, command, re.IGNORECASE)
            if match:
                return match.group(1).capitalize()
        
        return None
    
    def _extract_value_axis_label(self, command):
        """Extract a label for the value axis."""
        # Look for phrases that indicate the value being measured
        value_patterns = [
            r'(sales|revenue|profit|income|cost|expense)',
            r'(quantity|amount|count|number) of (\w+)'
        ]
        
        for pattern in value_patterns:
            match = re.search(pattern, command, re.IGNORECASE)
            if match:
                if match.group(2):
                    return match.group(1).capitalize() + ' of ' + match.group(2).capitalize()
                return match.group(1).capitalize()
        
        return None
    
    def _extract_time_axis_label(self, command):
        """Extract a label for the time axis."""
        # Look for phrases that indicate the time period
        time_patterns = [
            r'(monthly|yearly|quarterly|weekly|daily)',
            r'by\s+(month|year|quarter|week|day)',
            r'per\s+(month|year|quarter|week|day)'
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, command, re.IGNORECASE)
            if match:
                if match.group(1):
                    return match.group(1).capitalize() + ' Period'
                return match.group(1).capitalize()
        
        return None