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
from .services.nlp_service import NLPService
from .services.visualization_service import VisualizationService

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
        self.process_command(command)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def process_command(self, command):
        # In real implementation, this would be a background task
        command.status = 'processing'
        command.save()
        
        try:
            # Use NLP service to interpret the command
            nlp_service = NLPService()
            viz_params = nlp_service.process_command(command.text)
            
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
            # Log error here