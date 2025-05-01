"""
Mock data service for testing purposes.
This service provides sample data for visualizations when no real data source is available.
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

class MockDataService:
    """Service for generating mock data for testing."""
    
    @staticmethod
    def get_sales_data():
        """
        Generate mock sales data.
        
        Returns:
            dict: A dictionary with sales data suitable for visualizations
        """
        # Generate dates for the last 12 months
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        dates = pd.date_range(start=start_date, end=end_date, freq='M')
        
        # Generate random sales data
        sales_data = {
            'dates': [d.strftime('%Y-%m-%d') for d in dates],
            'sales': np.random.randint(5000, 15000, size=len(dates)).tolist(),
            'expenses': np.random.randint(3000, 8000, size=len(dates)).tolist(),
            'profit': []
        }
        
        # Calculate profit
        for i in range(len(sales_data['sales'])):
            sales_data['profit'].append(sales_data['sales'][i] - sales_data['expenses'][i])
        
        return sales_data
    
    @staticmethod
    def get_product_data():
        """
        Generate mock product sales data.
        
        Returns:
            dict: A dictionary with product sales data
        """
        products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
        
        return {
            'products': products,
            'sales': np.random.randint(100, 1000, size=len(products)).tolist(),
            'returns': np.random.randint(5, 50, size=len(products)).tolist()
        }
    
    @staticmethod
    def get_regional_data():
        """
        Generate mock regional sales data.
        
        Returns:
            dict: A dictionary with regional sales data
        """
        regions = ['North', 'South', 'East', 'West', 'Central']
        
        return {
            'regions': regions,
            'sales': np.random.randint(10000, 50000, size=len(regions)).tolist(),
            'market_share': np.random.uniform(0.1, 0.3, size=len(regions)).tolist()
        }
    
    @staticmethod
    def get_mock_data_for_source(source_name):
        """
        Get mock data based on the source name.
        
        Args:
            source_name (str): The name of the data source
            
        Returns:
            dict: The appropriate mock data
        """
        source_name_lower = source_name.lower()
        
        if 'sales' in source_name_lower:
            return MockDataService.get_sales_data()
        elif 'product' in source_name_lower:
            return MockDataService.get_product_data()
        elif 'region' in source_name_lower:
            return MockDataService.get_regional_data()
        else:
            # Default to sales data
            return MockDataService.get_sales_data()
    
    @staticmethod
    def get_bar_chart_data(data_source_name):
        """Generate data for a bar chart."""
        mock_data = MockDataService.get_mock_data_for_source(data_source_name)
        
        if 'products' in mock_data:
            return {
                'labels': mock_data['products'],
                'datasets': [{
                    'data': mock_data['sales']
                }]
            }
        elif 'regions' in mock_data:
            return {
                'labels': mock_data['regions'],
                'datasets': [{
                    'data': mock_data['sales']
                }]
            }
        else:
            # Use the last 6 months of sales data
            return {
                'labels': mock_data['dates'][-6:],
                'datasets': [{
                    'data': mock_data['sales'][-6:]
                }]
            }
    
    @staticmethod
    def get_line_chart_data(data_source_name):
        """Generate data for a line chart."""
        mock_data = MockDataService.get_mock_data_for_source(data_source_name)
        
        if 'dates' in mock_data:
            return {
                'labels': mock_data['dates'],
                'datasets': [{
                    'data': mock_data['sales']
                }]
            }
        else:
            # Generate time series data if not available
            dates = [(datetime.now() - timedelta(days=i*30)).strftime('%Y-%m-%d') for i in range(12, 0, -1)]
            
            if 'products' in mock_data:
                sales = np.random.randint(100, 1000, size=len(dates)).tolist()
            elif 'regions' in mock_data:
                sales = np.random.randint(10000, 50000, size=len(dates)).tolist()
            else:
                sales = np.random.randint(5000, 15000, size=len(dates)).tolist()
                
            return {
                'labels': dates,
                'datasets': [{
                    'data': sales
                }]
            }
    
    @staticmethod
    def get_pie_chart_data(data_source_name):
        """Generate data for a pie chart."""
        mock_data = MockDataService.get_mock_data_for_source(data_source_name)
        
        if 'products' in mock_data:
            return {
                'labels': mock_data['products'],
                'datasets': [{
                    'data': mock_data['sales']
                }]
            }
        elif 'regions' in mock_data:
            return {
                'labels': mock_data['regions'],
                'datasets': [{
                    'data': mock_data['sales']
                }]
            }
        else:
            # Create categorical data from sales data
            categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
            values = np.random.randint(1000, 5000, size=len(categories)).tolist()
            return {
                'labels': categories,
                'datasets': [{
                    'data': values
                }]
            }