import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import HyperText from '../../../../components/HyperText';
import Loader from '../../../../components/Loader';
import {
  UserCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  BriefcaseIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  ArrowRightIcon,
  ChartBarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const QuickActionCard = ({ title, description, icon: Icon, action, buttonText }) => (
    <div className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-50">
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold  mb-2">{title}</h3>
          <p className=" text-sm mb-4">{description}</p>
          <button
            onClick={action}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color = 'emerald' }) => (
    <div className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium ">{title}</p>
          <p className="text-2xl font-bold  mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 " />
          <h2 className="text-lg font-semibold ">{title}</h2>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const ActivityItem = ({ type, text, time, status }) => (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className={`w-2 h-2 rounded-full mr-4 ${
        status === 'pending' ? 'bg-amber-400' : 
        status === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
      }`}></div>
      <div className="flex-1">
        <p className=" font-medium">{text}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );

  const EventItem = ({ title, date, type, location }) => (
    <div className="p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold ">{title}</h3>
        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
          {type}
        </span>
      </div>
      <div className="flex items-center text-sm  mb-1">
        <CalendarIcon className="h-4 w-4 mr-1" />
        {date}
      </div>
      <div className="flex items-center text-sm ">
        <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
        {location}
      </div>
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  const userName = user?.username || user?.name || 'Student';
  const userInstitution = user?.institution || 'Not specified';
  const userCourse = user?.course || 'Not specified';
  const userYearOfStudy = user?.yearOfStudy || 'Not specified';
  const userSkills = Array.isArray(user?.skills) ? user.skills.slice(0, 5) : [];
  const hasCompleteProfile = user?.institution && user?.course && user?.yearOfStudy;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          {/* Student Icon Placeholder */}
          <div className="h-16 w-16 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
            <AcademicCapIcon className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold ">
              Welcome back, <span className="text-highlight">{userName}</span>!
            </h1>
            <p className=" mt-1">
              Continue your journey to career success.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!hasCompleteProfile && (
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xl">💡</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-amber-800">Complete Your Profile</h3>
              <p className="text-amber-700 mt-1">
                Add your education details to get personalized startup recommendations.
              </p>
            </div>
            <div className="ml-4">
              <button 
                onClick={() => navigate('/profile')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Complete Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Connections"
              value={stats.connections}
              icon={UserCircleIcon}
              color="emerald"
            />
            <StatCard
              title="Applications"
              value={stats.applications}
              icon={BriefcaseIcon}
              color="blue"
            />
            <StatCard
              title="Skills"
              value={stats.skills}
              icon={WrenchScrewdriverIcon}
              color="purple"
            />
            <StatCard
              title="Events"
              value={stats.events}
              icon={CalendarIcon}
              color="orange"
            />
          </div>

          {/* Quick Actions */}
          <InfoCard title="Quick Actions" icon={ChartBarIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActionCard
                title="Update Profile"
                description="Edit your student information"
                icon={UserCircleIcon}
                action={() => navigate('/profile')}
                buttonText="Edit"
              />
              <QuickActionCard
                title="Find Startups"
                description="Discover opportunities"
                icon={EyeIcon}
                action={() => navigate('/startups')}
                buttonText="Browse"
              />
              <QuickActionCard
                title="My Applications"
                description="Track your submissions"
                icon={BriefcaseIcon}
                action={() => navigate('/applications')}
                buttonText="View"
              />
              <QuickActionCard
                title="Skill Builder"
                description="Enhance your skills"
                icon={WrenchScrewdriverIcon}
                action={() => navigate('/skills')}
                buttonText="Build"
              />
            </div>
          </InfoCard>

          {/* Recent Activity */}
          <InfoCard title="Recent Activity" icon={ClockIcon}>
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </InfoCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Summary */}
          <InfoCard title="Your Profile" icon={AcademicCapIcon}>
            <div className="space-y-4">
              <div>
                <p className="text-sm ">Institution</p>
                <p className="font-medium ">{userInstitution}</p>
              </div>
              <div>
                <p className="text-sm ">Course</p>
                <p className="font-medium ">{userCourse}</p>
              </div>
              <div>
                <p className="text-sm ">Year of Study</p>
                <p className="font-medium ">{userYearOfStudy}</p>
              </div>
              {userSkills.length > 0 && (
                <div>
                  <p className="text-sm  mb-2">Top Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button 
                onClick={() => navigate('/profile')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 mt-4"
              >
                Edit Profile
              </button>
            </div>
          </InfoCard>

          {/* Upcoming Events */}
          <InfoCard title="Upcoming Events" icon={CalendarIcon}>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <EventItem key={index} {...event} />
              ))}
              <button className="w-full text-center text-emerald-600 hover:text-emerald-700 font-medium py-2 transition-colors duration-200">
                View All Events
                <ArrowRightIcon className="h-4 w-4 ml-1 inline" />
              </button>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );  
}

export default StudentDashboard;