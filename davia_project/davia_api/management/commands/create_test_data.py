from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from davia_api.models import DataSource, Visualization, Dashboard, DashboardVisualization

class Command(BaseCommand):
    help = 'Creates test data for the DAVIA application'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for which to create test data')
        parser.add_argument('--reset', action='store_true', help='Delete existing data before creating new test data')

    def handle(self, *args, **options):
        username = options.get('username')
        reset = options.get('reset', False)
        
        # Get the user
        if username:
            try:
                user = User.objects.get(username=username)
                self.stdout.write(self.style.SUCCESS(f'Using user: {username}'))
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with username {username} does not exist'))
                return
        else:
            # Use the first user or create one if none exists
            if not User.objects.exists():
                user = User.objects.create_user(username='demouser', email='demo@example.com', password='demopassword')
                self.stdout.write(self.style.SUCCESS(f'Created new user: demouser with password: demopassword'))
            else:
                user = User.objects.first()
                self.stdout.write(self.style.SUCCESS(f'Using existing user: {user.username}'))
        
        # Reset data if requested
        if reset:
            # Delete existing data for this user
            Dashboard.objects.filter(owner=user).delete()
            Visualization.objects.filter(owner=user).delete()
            DataSource.objects.filter(owner=user).delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted existing data for user: {user.username}'))
        
        # Create data sources
        self.create_data_sources(user)
        
        # Create visualizations
        self.create_visualizations(user)
        
        # Create dashboards
        self.create_dashboards(user)
        
        self.stdout.write(self.style.SUCCESS('Successfully created test data'))

    def create_data_sources(self, user):
        """Create test data sources."""
        data_sources = [
            {
                'name': 'Sales Data',
                'description': 'Monthly sales figures for the past year',
                'source_type': 'csv',
                'connection_string': '/data/sales.csv',
                'schema': {
                    'fields': [
                        {'name': 'date', 'type': 'date'},
                        {'name': 'sales', 'type': 'number'},
                        {'name': 'expenses', 'type': 'number'},
                        {'name': 'profit', 'type': 'number'}
                    ]
                }
            },
            {
                'name': 'Product Data',
                'description': 'Statistics for different product categories',
                'source_type': 'csv',
                'connection_string': '/data/products.csv',
                'schema': {
                    'fields': [
                        {'name': 'product', 'type': 'string'},
                        {'name': 'sales', 'type': 'number'},
                        {'name': 'returns', 'type': 'number'}
                    ]
                }
            },
            {
                'name': 'Regional Data',
                'description': 'Sales figures by geographic region',
                'source_type': 'csv',
                'connection_string': '/data/regions.csv',
                'schema': {
                    'fields': [
                        {'name': 'region', 'type': 'string'},
                        {'name': 'sales', 'type': 'number'},
                        {'name': 'market_share', 'type': 'number'}
                    ]
                }
            }
        ]
        
        for ds_data in data_sources:
            # Check if a data source with this name already exists for this user
            if not DataSource.objects.filter(name=ds_data['name'], owner=user).exists():
                DataSource.objects.create(
                    name=ds_data['name'],
                    description=ds_data['description'],
                    source_type=ds_data['source_type'],
                    connection_string=ds_data['connection_string'],
                    schema=ds_data['schema'],
                    owner=user
                )
                self.stdout.write(self.style.SUCCESS(f'Created data source: {ds_data["name"]}'))
            else:
                self.stdout.write(f'Data source {ds_data["name"]} already exists for this user')

    def create_visualizations(self, user):
        """Create test visualizations using the data sources."""
        # Get the data sources
        try:
            sales_data = DataSource.objects.get(name='Sales Data', owner=user)
            product_data = DataSource.objects.get(name='Product Data', owner=user)
            regional_data = DataSource.objects.get(name='Regional Data', owner=user)
            
            visualizations = [
                {
                    'title': 'Monthly Sales Trend',
                    'description': 'Line chart showing monthly sales over time',
                    'viz_type': 'line',
                    'config': {
                        'title': 'Monthly Sales Trend',
                        'xAxisLabel': 'Month',
                        'yAxisLabel': 'Sales ($)',
                        'showPoints': True
                    },
                    'data_source': sales_data
                },
                {
                    'title': 'Sales vs Expenses',
                    'description': 'Bar chart comparing sales and expenses',
                    'viz_type': 'bar',
                    'config': {
                        'title': 'Sales vs Expenses',
                        'xAxisLabel': 'Category',
                        'yAxisLabel': 'Amount ($)',
                        'orientation': 'vertical'
                    },
                    'data_source': sales_data
                },
                {
                    'title': 'Product Sales Distribution',
                    'description': 'Pie chart showing distribution of sales by product',
                    'viz_type': 'pie',
                    'config': {
                        'title': 'Product Sales Distribution',
                        'showLegend': True,
                        'showLabels': True
                    },
                    'data_source': product_data
                },
                {
                    'title': 'Regional Sales Comparison',
                    'description': 'Bar chart comparing sales by region',
                    'viz_type': 'bar',
                    'config': {
                        'title': 'Regional Sales Comparison',
                        'xAxisLabel': 'Region',
                        'yAxisLabel': 'Sales ($)',
                        'orientation': 'vertical'
                    },
                    'data_source': regional_data
                },
                {
                    'title': 'Monthly Profit',
                    'description': 'Line chart showing profit over time',
                    'viz_type': 'line',
                    'config': {
                        'title': 'Monthly Profit',
                        'xAxisLabel': 'Month',
                        'yAxisLabel': 'Profit ($)',
                        'showPoints': True
                    },
                    'data_source': sales_data
                }
            ]
            
            created_visualizations = []
            for viz_data in visualizations:
                # Check if a visualization with this title already exists
                if not Visualization.objects.filter(title=viz_data['title'], owner=user).exists():
                    viz = Visualization.objects.create(
                        title=viz_data['title'],
                        description=viz_data['description'],
                        viz_type=viz_data['viz_type'],
                        config=viz_data['config'],
                        data_source=viz_data['data_source'],
                        owner=user
                    )
                    created_visualizations.append(viz)
                    self.stdout.write(self.style.SUCCESS(f'Created visualization: {viz_data["title"]}'))
                else:
                    viz = Visualization.objects.get(title=viz_data['title'], owner=user)
                    created_visualizations.append(viz)
                    self.stdout.write(f'Visualization {viz_data["title"]} already exists for this user')
            
            return created_visualizations
            
        except DataSource.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f'Error creating visualizations: {str(e)}'))
            return []

    def create_dashboards(self, user):
        """Create test dashboards using the visualizations."""
        # Get a list of all visualizations for this user
        visualizations = Visualization.objects.filter(owner=user)
        
        if not visualizations.exists():
            self.stdout.write(self.style.ERROR('No visualizations found for this user. Skipping dashboard creation.'))
            return
        
        dashboards = [
            {
                'title': 'Sales Overview',
                'description': 'Overview of key sales metrics',
                'layout': {}
            },
            {
                'title': 'Product Analysis',
                'description': 'Detailed analysis of product performance',
                'layout': {}
            }
        ]
        
        for dash_data in dashboards:
            # Check if a dashboard with this title already exists
            if not Dashboard.objects.filter(title=dash_data['title'], owner=user).exists():
                dashboard = Dashboard.objects.create(
                    title=dash_data['title'],
                    description=dash_data['description'],
                    layout=dash_data['layout'],
                    owner=user
                )
                
                # Add visualizations to the dashboard
                if dash_data['title'] == 'Sales Overview':
                    # Sales-related visualizations
                    viz_to_add = visualizations.filter(title__contains='Sales')
                    
                    for i, viz in enumerate(viz_to_add):
                        DashboardVisualization.objects.create(
                            dashboard=dashboard,
                            visualization=viz,
                            position_x=i % 2 * 6,  # 2 columns
                            position_y=i // 2 * 4,  # Each row is 4 units high
                            width=6,
                            height=4
                        )
                
                elif dash_data['title'] == 'Product Analysis':
                    # Product-related visualizations
                    viz_to_add = visualizations.filter(title__contains='Product')
                    
                    # Add any profit visualizations 
                    viz_to_add = list(viz_to_add) + list(visualizations.filter(title__contains='Profit'))
                    
                    for i, viz in enumerate(viz_to_add):
                        DashboardVisualization.objects.create(
                            dashboard=dashboard,
                            visualization=viz,
                            position_x=i % 2 * 6,  # 2 columns
                            position_y=i // 2 * 4,  # Each row is 4 units high
                            width=6,
                            height=4
                        )
                
                self.stdout.write(self.style.SUCCESS(f'Created dashboard: {dash_data["title"]}'))
            else:
                self.stdout.write(f'Dashboard {dash_data["title"]} already exists for this user')