import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from "../../../../../components/Sidebar";
import sidebarOptions from "../../../../../Jsons/SidebarOptions/StartupDashboardSidebar.json";
import RoleSwitcher from './RoleSwitcher';
import { FiEye, FiUsers, FiHeart, FiMessageSquare, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StartupDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        // Fetch user data
        const userRes = await axios.get(`${baseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (userRes.data.smartRole !== 'startup') {
          const forms = await axios.get(`${baseUrl}/api/smart/form/startup`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (forms.data.hasFormData) {
            await axios.post(
              `${baseUrl}/api/smart/role`,
              { role: 'startup' },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = await axios.get(`${baseUrl}/api/user/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser(updatedUser.data);
          } else {
            navigate('/smart/user-dashboard');
          }
        } else {
          setUser(userRes.data);
        }

        // Fetch dashboard metrics
        const metricsRes = await axios.get(`${baseUrl}/api/smart/startups/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(metricsRes.data);

        // Fetch recent activity
        const activityRes = await axios.get(`${baseUrl}/api/smart/activity`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 }
        });
        setRecentActivity(activityRes.data);

      } catch (error) {
        console.error(error);
        // Handle error but don't navigate if it's just metrics/activity that failed
        if (error.response?.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, baseUrl]);

  const handleRoleSwitch = async (role) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${baseUrl}/api/smart/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/smart/user-dashboard');
    } catch (error) {
      console.error('Role switch failed:', error);
    }
  };

  // Chart data for metrics visualization
  const viewsChartData = {
    labels: metrics?.weeklyViews?.map(item => item.day) || [],
    datasets: [
      {
        label: 'Profile Views',
        data: metrics?.weeklyViews?.map(item => item.count) || [],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const interestsChartData = {
    labels: ['Investors', 'Partners', 'Customers'],
    datasets: [
      {
        data: [
          metrics?.interestTypes?.investor || 0,
          metrics?.interestTypes?.partner || 0,
          metrics?.interestTypes?.customer || 0
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(129, 140, 248, 0.7)'
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(129, 140, 248, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const dashboardNavigationData = sidebarOptions.map((item) => ({
    ...item,
    icon: (
      <box-icon
        name={item.icon}
        type={item.type || "regular"}
        color={item.color || "#ffffff"}
      ></box-icon>
    ),
  }));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <Sidebar user={user} navigationData={dashboardNavigationData} />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {/* Header with title and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Startup Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user.name || user.username}
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <RoleSwitcher 
              currentRole={user.smartRole} 
              onSwitch={handleRoleSwitch}
            />
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="space-y-6">
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Profile Views Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {metrics?.totalViews || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className={`${metrics?.viewsChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metrics?.viewsChangePercent >= 0 ? '↑' : '↓'} {Math.abs(metrics?.viewsChangePercent || 0)}% from last week
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                  <FiEye className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Interested Users Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interested Users</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {metrics?.totalInterests || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className={`${metrics?.interestsChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metrics?.interestsChangePercent >= 0 ? '↑' : '↓'} {Math.abs(metrics?.interestsChangePercent || 0)}% from last week
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                  <FiHeart className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Messages Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New Messages</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {metrics?.unreadMessages || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {metrics?.totalMessages || 0} total messages
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  <FiMessageSquare className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Strength</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {metrics?.profileCompletion || 0}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {metrics?.profileCompletion < 100 ? 'Complete your profile' : 'Great job!'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                  <FiTrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${metrics?.profileCompletion || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Views Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Profile Views</h3>
              <div className="h-64">
                <Bar 
                  data={viewsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Interest Types Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Interest Types</h3>
              <div className="h-64">
                <Pie 
                  data={interestsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                <Link 
                  to="/smart/activity" 
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                          {activity.type === 'view' && <FiEye className="w-4 h-4" />}
                          {activity.type === 'interest' && <FiHeart className="w-4 h-4" />}
                          {activity.type === 'message' && <FiMessageSquare className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {activity.message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/smart/startups/edit"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-800 dark:text-white">Edit Startup Profile</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link
                  to="/smart/messages"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-800 dark:text-white">View Messages</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link
                  to="/smart/analytics"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-800 dark:text-white">View Detailed Analytics</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link
                  to="/smart/startups/gallery"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-800 dark:text-white">Update Gallery</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link
                  to="/smart/team"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-800 dark:text-white">Manage Team</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDashboard;