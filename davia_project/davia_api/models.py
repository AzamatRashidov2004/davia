from django.db import models
from django.contrib.auth.models import User

class DataSource(models.Model):
    SOURCE_TYPES = (
        ('csv', 'CSV File'),
        ('json', 'JSON File'),
        ('api', 'API Endpoint'),
        ('database', 'Database'),
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    connection_string = models.CharField(max_length=255, blank=True, null=True)
    api_key = models.CharField(max_length=255, blank=True, null=True)
    schema = models.JSONField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data_sources')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
        
class Visualization(models.Model):
    VIZ_TYPES = (
        ('bar', 'Bar Chart'),
        ('line', 'Line Chart'),
        ('pie', 'Pie Chart'),
        ('scatter', 'Scatter Plot'),
        ('heatmap', 'Heat Map'),
        ('table', 'Table'),
    )
    
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    viz_type = models.CharField(max_length=20, choices=VIZ_TYPES)
    config = models.JSONField()  # Stores chart configuration 
    data_source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='visualizations')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visualizations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
        
class Dashboard(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    layout = models.JSONField(default=dict)  # Stores dashboard layout configuration
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboards')
    visualizations = models.ManyToManyField(Visualization, through='DashboardVisualization')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
        
class DashboardVisualization(models.Model):
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    position_x = models.IntegerField(default=0)
    position_y = models.IntegerField(default=0)
    width = models.IntegerField(default=4)  # Default grid width
    height = models.IntegerField(default=3)  # Default grid height
    
    class Meta:
        unique_together = ('dashboard', 'visualization')
        
class NaturalLanguageCommand(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('error', 'Error'),
    )
    
    text = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commands')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    result_visualization = models.ForeignKey(Visualization, on_delete=models.SET_NULL, 
                                           null=True, blank=True, related_name='commands')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.text[:50]}..."
