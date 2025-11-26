import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import HyperText from '../../../../components/HyperText';
import Loader from '../../../../components/Loader';
import 'boxicons';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    connections: 0,
    applications: 0,
    skills: 0,
    events: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const userResponse = await axios.get(`${baseUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dashboardResponse = await axios.get(`${baseUrl}/smart/api/smart/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Dashboard API Response:', dashboardResponse.data);
      
      let studentFormData = null;
      
      if (dashboardResponse.data && Array.isArray(dashboardResponse.data)) {
        const studentForm = dashboardResponse.data.find(form => form.role === 'student');
        if (studentForm) {
          studentFormData = studentForm.formData;
        }
      }

      if (!studentFormData) {
        try {
          const formCheckResponse = await axios.get(`${baseUrl}/smart/api/smart/form/student`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (formCheckResponse.data && formCheckResponse.data.hasFormData) {
            studentFormData = formCheckResponse.data.formData || {};
          }
        } catch (formError) {
          console.log('No student form exists yet');
        }
      }

      const mergedUserData = {
        ...userResponse.data,
        ...(studentFormData || {})
      };

      setUser(mergedUserData);
      
      const skillsCount = Array.isArray(studentFormData?.skills) ? studentFormData.skills.length : 0;
      
      setStats({
        connections: Math.floor(Math.random() * 50) + 10,
        applications: Math.floor(Math.random() * 20) + 5,
        skills: skillsCount,
        events: Math.floor(Math.random() * 10) + 2
      });

    } catch (error) {
      console.error('Failed to fetch student data:', error);
      
      if (error.response?.status === 404) {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`${baseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);
        setStats({
          connections: 0,
          applications: 0,
          skills: 0,
          events: 0
        });
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`${baseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: '📝', title: 'Update Profile', description: 'Edit your information', action: '/profile', color: 'bg-blue-500' },
    { icon: '🔍', title: 'Find Startups', description: 'Discover opportunities', action: '/startups', color: 'bg-green-500' },
    { icon: '💼', title: 'My Applications', description: 'Track your submissions', action: '/applications', color: 'bg-purple-500' },
    { icon: '🎯', title: 'Skill Builder', description: 'Enhance your skills', action: '/skills', color: 'bg-orange-500' }
  ];

  const recentActivities = [
    { type: 'application', text: 'Applied to TechNova Solutions', time: '2 hours ago', status: 'pending' },
    { type: 'connection', text: 'Connected with Startup Founder', time: '1 day ago', status: 'success' },
    { type: 'skill', text: 'Added React.js to skills', time: '2 days ago', status: 'updated' },
    { type: 'profile', text: 'Updated your profile picture', time: '3 days ago', status: 'updated' }
  ];

  const upcomingEvents = [
    { title: "Tech Career Fair", date: "Tomorrow, 10:00 AM", type: "networking", location: "Virtual" },
    { title: "Startup Workshop", date: "Dec 18, 3:00 PM", type: "workshop", location: "Campus Hall" },
    { title: "Interview Prep", date: "Dec 20, 2:00 PM", type: "training", location: "Online" }
  ];

  if (loading) {
    return <Loader />;
  }

  const userName = user?.username || user?.name || 'Student';
  const userInstitution = user?.institution || 'Not specified';
  const userCourse = user?.course || 'Not specified';
  const userYearOfStudy = user?.yearOfStudy || 'Not specified';
  const userBio = user?.bio || 'No bio added yet. Share something about yourself!';
  const userSkills = Array.isArray(user?.skills) ? user.skills.slice(0, 5) : [];
  const hasCompleteProfile = user?.institution && user?.course && user?.yearOfStudy;

  return (
    
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="text-highlight">{userName}</span>!
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to explore new opportunities today?
              </p>
            </div>
            
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!hasCompleteProfile && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-xl">💡</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-amber-800">Complete Your Profile</h3>
                <p className="text-amber-700 mt-1">
                  Add your education details to get personalized startup recommendations and increase your chances.
                </p>
              </div>
              <div className="ml-auto">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Complete Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.connections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">🛠️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Skills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.skills}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Quick Actions & Profile */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.action)}
                    className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-xl">{action.icon}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                    <div className={`w-3 h-3 rounded-full mr-4 ${
                      activity.status === 'pending' ? 'bg-yellow-400' : 
                      activity.status === 'success' ? 'bg-green-400' : 'bg-blue-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.text}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Profile & Events */}
          <div className="space-y-8">
            
            {/* Profile Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Institution</p>
                  <p className="font-medium text-gray-900">{userInstitution}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium text-gray-900">{userCourse}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year of Study</p>
                  <p className="font-medium text-gray-900">{userYearOfStudy}</p>
                </div>
                {userSkills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {userSkills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors mt-4">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">📅 {event.date}</p>
                    <p className="text-sm text-gray-600">📍 {event.location}</p>
                  </div>
                ))}
                <button className="w-full text-center text-indigo-600 hover:text-indigo-700 font-medium py-2 transition-colors">
                  View All Events →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );  
}

export default StudentDashboard;