from rest_framework import serializers
from .models import DataSource, Visualization, Dashboard, DashboardVisualization, NaturalLanguageCommand

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        exclude = ['owner']
        
class VisualizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visualization
        exclude = ['owner']
        
class DashboardVisualizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardVisualization
        fields = ['visualization', 'position_x', 'position_y', 'width', 'height']
        
class DashboardSerializer(serializers.ModelSerializer):
    visualizations = DashboardVisualizationSerializer(source='dashboardvisualization_set', many=True, read_only=False)
    
    class Meta:
        model = Dashboard
        exclude = ['owner']
        
    def create(self, validated_data):
        visualizations_data = validated_data.pop('dashboardvisualization_set', [])
        dashboard = Dashboard.objects.create(**validated_data)
        
        for viz_data in visualizations_data:
            DashboardVisualization.objects.create(dashboard=dashboard, **viz_data)
            
        return dashboard
        
    def update(self, instance, validated_data):
        visualizations_data = validated_data.pop('dashboardvisualization_set', [])
        
        # Update dashboard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Clear existing visualizations and add new ones
        instance.dashboardvisualization_set.all().delete()
        for viz_data in visualizations_data:
            DashboardVisualization.objects.create(dashboard=instance, **viz_data)
            
        return instance
        
class NaturalLanguageCommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = NaturalLanguageCommand
        fields = ['id', 'text', 'status', 'result_visualization', 'created_at']
        read_only_fields = ['status', 'result_visualization', 'created_at']