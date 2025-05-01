import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User } from '../types';

interface UserStats {
  totalVisualizations: number;
  totalDashboards: number;
  totalCommands: number;
  lastActiveDate: string;
  favoriteChartType: string;
}

const mockUserStats: UserStats = {
  totalVisualizations: 24,
  totalDashboards: 5,
  totalCommands: 87,
  lastActiveDate: new Date().toISOString(),
  favoriteChartType: 'Bar Chart'
};

// Mock user service - in a real app, this would fetch from the API
const getUserProfile = async (): Promise<User> => {
  // Mock API call
  return {
    id: 1,
    username: 'demo_user',
    email: 'user@example.com',
    first_name: 'Demo',
    last_name: 'User',
    bio: 'Data visualization enthusiast with a passion for uncovering insights from complex datasets.',
    organization: 'DAVIA Analytics',
    profile_image: null
  };
};

// Mock preferences
const getUserPreferences = async () => {
  return {
    theme: 'light',
    default_chart_type: 'bar',
    date_format: 'MM/DD/YYYY',
    notification_enabled: true
  };
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [preferences, setPreferences] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userData, userPrefs] = await Promise.all([
          getUserProfile(),
          getUserPreferences()
        ]);
        
        setUser(userData);
        setFormData(userData);
        setPreferences(userPrefs);
        setStats(mockUserStats); // In a real app, this would be fetched from an API
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setPreferences({ ...preferences, [name]: checkbox.checked });
    } else {
      setPreferences({ ...preferences, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // In a real app, this would be an API call to update the user profile
      // await updateUserProfile(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the user state with the new data
      setUser({ ...user, ...formData } as User);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would be an API call to update user preferences
      // await updateUserPreferences(preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Preferences saved successfully');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error || 'User profile not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg mb-4 md:mb-0 md:mr-6">
              {user.first_name?.[0]}{user.last_name?.[0] || ''}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
              <p className="opacity-80">{user.username}</p>
              <p className="opacity-80">{user.email}</p>
              {user.organization && (
                <p className="opacity-90 mt-1">
                  <span className="bg-blue-700 px-2 py-1 rounded text-xs">
                    {user.organization}
                  </span>
                </p>
              )}
            </div>
            <div className="md:ml-auto mt-4 md:mt-0">
              <button 
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b px-6">
          <nav className="flex space-x-8">
            <button
              className={`py-4 px-1 font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-4 px-1 font-medium border-b-2 ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
            <button
              className={`py-4 px-1 font-medium border-b-2 ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 mr-4"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">First Name</dt>
                          <dd className="mt-1 text-gray-900">{user.first_name}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                          <dd className="mt-1 text-gray-900">{user.last_name}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Username</dt>
                          <dd className="mt-1 text-gray-900">{user.username}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="mt-1 text-gray-900">{user.email}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Organization</dt>
                          <dd className="mt-1 text-gray-900">{user.organization || '-'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">{user.bio || 'No bio provided.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && preferences && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Preferences</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Theme
                      </label>
                      <select
                        name="theme"
                        value={preferences.theme}
                        onChange={handlePreferenceChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Chart Type
                      </label>
                      <select
                        name="default_chart_type"
                        value={preferences.default_chart_type}
                        onChange={handlePreferenceChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="scatter">Scatter Plot</option>
                        <option value="area">Area Chart</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select
                        name="date_format"
                        value={preferences.date_format}
                        onChange={handlePreferenceChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications"
                        name="notification_enabled"
                        checked={preferences.notification_enabled}
                        onChange={handlePreferenceChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                        Enable Notifications
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSavePreferences}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isUpdating ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-4">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full md:w-auto text-left md:text-center"
                      onClick={() => navigate('/change-password')}
                    >
                      Change Password
                    </button>
                    
                    <button
                      className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 hover:border-red-400 w-full md:w-auto text-left md:text-center"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-500 font-medium">Visualizations</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalVisualizations}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-500 font-medium">Dashboards</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalDashboards}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-500 font-medium">Commands</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalCommands}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                      <dd className="mt-1 text-gray-900">{formatDate(stats.lastActiveDate)}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Favorite Chart Type</dt>
                      <dd className="mt-1 text-gray-900">{stats.favoriteChartType}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                      <dd className="mt-1 text-gray-900">January 15, 2023</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                      <dd className="mt-1 text-gray-900">Standard</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    <li className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full">
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Created a new visualization</p>
                          <p className="text-sm text-gray-500">Monthly Sales Report</p>
                        </div>
                        <p className="ml-auto text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </li>
                    <li className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Updated dashboard</p>
                          <p className="text-sm text-gray-500">Marketing Overview</p>
                        </div>
                        <p className="ml-auto text-sm text-gray-500">Yesterday</p>
                      </div>
                    </li>
                    <li className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Connected new data source</p>
                          <p className="text-sm text-gray-500">Customer Feedback Database</p>
                        </div>
                        <p className="ml-auto text-sm text-gray-500">3 days ago</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;