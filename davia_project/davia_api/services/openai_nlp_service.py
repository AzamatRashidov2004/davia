import json
import os
from decouple import config
from openai import OpenAI
from ..models import DataSource

class OpenAINLPService:
    """
    NLP service using OpenAI's API for processing natural language commands.
    This provides much more sophisticated natural language understanding than
    the simple regex-based approach.
    """
    
    def __init__(self):
        """Initialize the OpenAI client."""
        # Try to get the API key from environment variables or .env file
        api_key = config('OPENAI_API_KEY', default=None)
        
        if not api_key:
            raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=api_key)
    
    def process_command(self, command_text):
        """
        Process a natural language command and extract visualization parameters.
        
        Args:
            command_text (str): The natural language command from the user
            
        Returns:
            dict: Parameters for creating a visualization
        """
        # Get available data sources to provide context
        data_sources = self._get_data_source_info()
        
        # Create the prompt for OpenAI
        system_prompt = f"""
        You are a data visualization assistant that helps users create charts and visualizations.
        Given a natural language request, your task is to identify:
        1. The most appropriate chart type (bar, line, pie)
        2. The most relevant data source from the available options
        3. A suitable configuration for the visualization

        The available data sources are:
        {data_sources}

        Respond with a JSON object in the following format:
        {{
            "viz_type": "bar|line|pie",
            "data_source_name": "name of the chosen data source",
            "config": {{
                "title": "appropriate title for the visualization",
                "description": "brief description of what the visualization shows",
                "xAxisLabel": "label for x-axis if applicable",
                "yAxisLabel": "label for y-axis if applicable",
                "showPoints": true/false (for line charts),
                "showLegend": true/false (for pie charts),
                "showLabels": true/false (for pie charts),
                "orientation": "vertical|horizontal" (for bar charts)
            }}
        }}

        Chart type selection guidelines:
        - Use line charts for time series data, trends, or changes over time
        - Use bar charts for comparing categories or discrete values
        - Use pie charts for showing proportions or distributions of a whole

        Make sure the chosen data source is appropriate for the user's request.
        If the request is ambiguous, choose the most likely interpretation.
        """
        
        try:
            # Call the OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # You can use gpt-4 for better results if available
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": command_text}
                ],
                temperature=0.2,  # Lower temperature for more deterministic outputs
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            result = json.loads(response.choices[0].message.content)
            
            # Translate data_source_name to data_source_id
            data_source_id = self._get_data_source_id(result["data_source_name"])
            if not data_source_id:
                # Fallback to the first available data source
                data_sources = DataSource.objects.all()
                if data_sources.exists():
                    data_source_id = data_sources.first().id
                else:
                    raise ValueError("No data sources available")
            
            return {
                'viz_type': result["viz_type"],
                'data_source_id': data_source_id,
                'config': result["config"]
            }
            
        except Exception as e:
            # Fallback to a simple default if OpenAI fails
            # In a real application, you would want better error handling
            print(f"Error in OpenAI NLP service: {str(e)}")
            
            # Return a default visualization
            return self._fallback_process(command_text)
    
    def _get_data_source_info(self):
        """
        Get information about available data sources to include in the prompt.
        
        Returns:
            str: Text description of available data sources
        """
        data_sources = DataSource.objects.all()
        if not data_sources.exists():
            return "No data sources available. You'll need to choose a default visualization type."
        
        result = []
        for ds in data_sources:
            fields = ""
            if ds.schema and 'fields' in ds.schema:
                fields = ", ".join([f["name"] for f in ds.schema["fields"]])
            
            result.append(f"- {ds.name}: {ds.description or 'No description'} (Fields: {fields})")
        
        return "\n".join(result)
    
    def _get_data_source_id(self, data_source_name):
        """
        Get the ID of a data source by name.
        
        Args:
            data_source_name (str): The name of the data source
            
        Returns:
            int: The ID of the data source, or None if not found
        """
        try:
            # First, try exact match
            ds = DataSource.objects.filter(name=data_source_name).first()
            if ds:
                return ds.id
            
            # If no exact match, try case-insensitive match
            ds = DataSource.objects.filter(name__iexact=data_source_name).first()
            if ds:
                return ds.id
            
            # If still no match, try contains match
            ds = DataSource.objects.filter(name__icontains=data_source_name).first()
            if ds:
                return ds.id
            
            return None
        except Exception:
            return None
    
    def _fallback_process(self, command_text):
        """
        Process a command without using OpenAI (fallback method).
        This is a simplified version of the original NLPService.
        
        Args:
            command_text (str): The natural language command
            
        Returns:
            dict: Parameters for creating a visualization
        """
        command_lower = command_text.lower()
        
        # Simple chart type detection
        if any(word in command_lower for word in ['trend', 'over time', 'monthly', 'yearly', 'history']):
            viz_type = 'line'
        elif any(word in command_lower for word in ['distribution', 'proportion', 'percentage', 'share']):
            viz_type = 'pie'
        else:
            viz_type = 'bar'
        
        # Try to find a matching data source
        data_source_id = None
        try:
            # Look for sales-related queries
            if any(word in command_lower for word in ['sales', 'revenue']):
                ds = DataSource.objects.filter(name__icontains='sales').first()
                if ds:
                    data_source_id = ds.id
            
            # Look for product-related queries
            elif any(word in command_lower for word in ['product']):
                ds = DataSource.objects.filter(name__icontains='product').first()
                if ds:
                    data_source_id = ds.id
            
            # Look for regional queries
            elif any(word in command_lower for word in ['region', 'area', 'location']):
                ds = DataSource.objects.filter(name__icontains='region').first()
                if ds:
                    data_source_id = ds.id
            
            # If no match, use the first data source
            if not data_source_id:
                ds = DataSource.objects.first()
                if ds:
                    data_source_id = ds.id
        except Exception:
            # If all else fails, return None and let the caller handle it
            data_source_id = None
        
        # Create a config
        title = command_text.capitalize()
        
        config = {
            'title': title,
            'description': f'Visualization generated from: "{command_text}"'
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
        
        return {
            'viz_type': viz_type,
            'data_source_id': data_source_id,
            'config': config
        }