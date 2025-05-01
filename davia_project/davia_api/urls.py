from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DataSourceViewSet, 
    VisualizationViewSet, 
    DashboardViewSet,
    NaturalLanguageCommandViewSet
)

router = DefaultRouter()
router.register(r'datasources', DataSourceViewSet, basename='datasource')
router.register(r'visualizations', VisualizationViewSet, basename='visualization')
router.register(r'dashboards', DashboardViewSet, basename='dashboard')
router.register(r'commands', NaturalLanguageCommandViewSet, basename='command')

urlpatterns = [
    path('', include(router.urls)),
]
