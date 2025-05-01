from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DataSource, Visualization, Dashboard, NaturalLanguageCommand
from .serializers import (
    DataSourceSerializer, 
    VisualizationSerializer, 
    DashboardSerializer,
    NaturalLanguageCommandSerializer
)
# Import both NLP services - we'll try OpenAI first, then fall back to the basic one if needed
from .services.openai_nlp_service import OpenAINLPService
from .services.nlp_service import NLPService
from .services.visualization_service import VisualizationService
import threading
import os

class DataSourceViewSet(viewsets.ModelViewSet):
    serializer_class = DataSourceSerializer
    
    def get_queryset(self):
        return DataSource.objects.filter(owner=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class VisualizationViewSet(viewsets.ModelViewSet):
    serializer_class = VisualizationSerializer
    
    def get_queryset(self):
        return Visualization.objects.filter(owner=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        """
        Get the data for a visualization.
        """
        try:
            visualization = self.get_object()
            viz_service = VisualizationService()
            data = viz_service.get_visualization_data(visualization.id, request.user)
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DashboardViewSet(viewsets.ModelViewSet):
    serializer_class = DashboardSerializer
    
    def get_queryset(self):
        return Dashboard.objects.filter(owner=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        
class NaturalLanguageCommandViewSet(viewsets.ModelViewSet):
    serializer_class = NaturalLanguageCommandSerializer
    
    def get_queryset(self):
        return NaturalLanguageCommand.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        command = serializer.save(user=self.request.user)
        # Process the command asynchronously
        threading.Thread(target=self.process_command, args=(command,)).start()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def process_command(self, command):
        # In real implementation, this would be a background task
        command.status = 'processing'
        command.save()
        
        try:
            # Try to use OpenAI NLP service first
            try:
                # Check if OpenAI API key is available
                if os.environ.get('OPENAI_API_KEY') or os.path.exists('.env'):
                    nlp_service = OpenAINLPService()
                    viz_params = nlp_service.process_command(command.text)
                else:
                    # No API key, use fallback
                    raise ValueError("OpenAI API key not available")
            except Exception as e:
                print(f"OpenAI NLP service failed: {str(e)}. Falling back to basic NLP.")
                # Fall back to basic NLP service
                nlp_service = NLPService()
                viz_params = nlp_service.process_command(command.text)
            
            # Check if we have a data source
            if not viz_params['data_source_id']:
                # Create a default data source if none exists
                if not DataSource.objects.filter(owner=command.user).exists():
                    data_source = DataSource.objects.create(
                        name="Default Sales Data",
                        description="Automatically created data source for visualizations",
                        source_type="csv",
                        connection_string="/data/default.csv",
                        schema={
                            'fields': [
                                {'name': 'date', 'type': 'date'},
                                {'name': 'value', 'type': 'number'}
                            ]
                        },
                        owner=command.user
                    )
                    viz_params['data_source_id'] = data_source.id
                else:
                    viz_params['data_source_id'] = DataSource.objects.filter(owner=command.user).first().id
            
            # Create visualization based on NLP interpretation
            viz_service = VisualizationService()
            visualization = viz_service.create_visualization(
                user=command.user,
                data_source_id=viz_params['data_source_id'],
                viz_type=viz_params['viz_type'],
                config=viz_params['config']
            )
            
            # Update command with result
            command.result_visualization = visualization
            command.status = 'completed'
            command.save()
            
        except Exception as e:
            command.status = 'error'
            command.save()
            print(f"Error processing command: {str(e)}")