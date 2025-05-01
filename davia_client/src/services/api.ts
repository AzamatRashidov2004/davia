import axios, { AxiosRequestConfig } from 'axios';
import { DataSource, Dashboard, Visualization, NaturalLanguageCommand } from '../types';

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Authentication services
  export const authService = {
    login: async (username: string, password: string) => {
      const response = await axios.post(`${API_URL}/token/`, { username, password });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return response.data;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    },
    refreshToken: async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken,
      });
      localStorage.setItem('token', response.data.access);
      return response.data;
    },
    register: async (username: string, email: string, password: string) => {
      const response = await axios.post(`${API_URL}/users/register/`, {
        username,
        email,
        password
      });
      return response.data;
    },
  };
  
  // Data source services
  export const dataSourceService = {
    getAll: async () => {
      const response = await apiClient.get<DataSource[]>('/datasources/');
      return response.data;
    },
    getById: async (id: number) => {
      const response = await apiClient.get<DataSource>(`/datasources/${id}/`);
      return response.data;
    },
    create: async (dataSource: Partial<DataSource>) => {
      const response = await apiClient.post<DataSource>('/datasources/', dataSource);
      return response.data;
    },
    update: async (id: number, dataSource: Partial<DataSource>) => {
      const response = await apiClient.put<DataSource>(`/datasources/${id}/`, dataSource);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/datasources/${id}/`);
    },
  };
  
  // Visualization services
  export const visualizationService = {
    getAll: async () => {
      const response = await apiClient.get<Visualization[]>('/visualizations/');
      return response.data;
    },
    getById: async (id: number) => {
      const response = await apiClient.get<Visualization>(`/visualizations/${id}/`);
      return response.data;
    },
    create: async (visualization: Partial<Visualization>) => {
      const response = await apiClient.post<Visualization>('/visualizations/', visualization);
      return response.data;
    },
    update: async (id: number, visualization: Partial<Visualization>) => {
      const response = await apiClient.put<Visualization>(`/visualizations/${id}/`, visualization);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/visualizations/${id}/`);
    },
    getData: async (id: number) => {
      const response = await apiClient.get(`/visualizations/${id}/data/`);
      return response.data;
    },
  };
  
  // Dashboard services
  export const dashboardService = {
    getAll: async () => {
      const response = await apiClient.get<Dashboard[]>('/dashboards/');
      return response.data;
    },
    getById: async (id: number) => {
      const response = await apiClient.get<Dashboard>(`/dashboards/${id}/`);
      return response.data;
    },
    create: async (dashboard: Partial<Dashboard>) => {
      const response = await apiClient.post<Dashboard>('/dashboards/', dashboard);
      return response.data;
    },
    update: async (id: number, dashboard: Partial<Dashboard>) => {
      const response = await apiClient.put<Dashboard>(`/dashboards/${id}/`, dashboard);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/dashboards/${id}/`);
    },
  };
  
  // Natural language command services
  export const commandService = {
    getAll: async () => {
      const response = await apiClient.get<NaturalLanguageCommand[]>('/commands/');
      return response.data;
    },
    getById: async (id: number) => {
      const response = await apiClient.get<NaturalLanguageCommand>(`/commands/${id}/`);
      return response.data;
    },
    create: async (command: { text: string }) => {
      const response = await apiClient.post<NaturalLanguageCommand>('/commands/', command);
      return response.data;
    },
  };