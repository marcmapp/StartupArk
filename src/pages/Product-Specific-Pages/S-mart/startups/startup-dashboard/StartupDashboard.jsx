import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  UserGroupIcon,
  PhotoIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  PencilSquareIcon,
  BuildingStorefrontIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const StartupDashboard = () => {
  const navigate = useNavigate();
  const [startupData, setStartupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);

  // Get token from localStorage or cookies
  const getAuthToken = () => {
    return localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  const getImageUrl = (key, baseUrl) => {
    if (!key) return null;
    if (key.startsWith('http')) return key;
    if (key.startsWith('blob:')) return key;
    return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
  };

  const processStartupData = (data) => {
    if (!data) return null;
    
    return {
      ...data,
      logo: getImageUrl(data.logo, baseUrl),
      gallery: data.gallery?.map(item => ({
        ...item,
        url: getImageUrl(item.url, baseUrl)
      })) || [],
      team: data.team?.map(member => ({
        ...member,
        avatar: getImageUrl(member.avatar, baseUrl)
      })) || [],
      pitchDeck: getImageUrl(data.pitchDeck, baseUrl)
    };
  };

  useEffect(() => {
    const fetchStartupData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${baseUrl}/smart/api/smart/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.length > 0) {
          const startupForm = response.data.find(form => form.role === 'startup');
          if (startupForm) {
            setStartupData(processStartupData(startupForm.formData));
          } else {
            setError('No startup data found');
          }
        } else {
          setError('No form data submitted yet');
        }
      } catch (err) {
        console.error('Error fetching startup data:', err);
        setError(err.response?.data?.error || 'Failed to load startup data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStartupData();
  }, [baseUrl, navigate]);

  const QuickActionCard = ({ title, description, icon: Icon, action, buttonText }) => (
    <div className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 rounded-xl bg-cyan-50">
          <Icon className="h-6 w-6 text-cyan-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold  mb-2">{title}</h3>
          <p className=" text-sm mb-4">{description}</p>
          <button
            onClick={action}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <h2 className="text-lg font-semibold ">{title}</h2>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium  mb-2">Error Loading Dashboard</h3>
          <p className="">{error}</p>
          {error === 'Authentication required' && (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-200"
            >
              Login Required
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          {startupData.logo && (
            <img
              src={startupData.logo}
              alt={`${startupData.startupName} logo`}
              className="h-16 w-16 rounded-xl object-cover border border-gray-200"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold ">
              Welcome back, <span className='text-highlight'>{startupData.startupName}</span>!
            </h1>
            <p className=" mt-1">
              Manage your startup and track your progress.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <InfoCard title="Quick Actions" icon={ChartBarIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActionCard
                title="View Company"
                description="See how investors view your startup"
                icon={EyeIcon}
                action={() => navigate('/smart/startup-profile')}
                buttonText="View"
              />
              <QuickActionCard
                title="Edit Company"
                description="Update your startup information"
                icon={PencilSquareIcon}
                action={() => navigate('/smart/startup-edit-profile')}
                buttonText="Edit"
              />
            </div>
          </InfoCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* At a Glance */}
          <InfoCard title="At a Glance" icon={EyeIcon}>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="h-5 w-5 " />
                  <span className="">Team Members</span>
                </div>
                <span className="font-semibold ">{startupData.team?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <PhotoIcon className="h-5 w-5 " />
                  <span className="">Gallery Items</span>
                </div>
                <span className="font-semibold ">{startupData.gallery?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-5 w-5 " />
                  <span className="">Industry</span>
                </div>
                <span className="font-semibold ">{startupData.industry || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="h-5 w-5 " />
                  <span className="">Stage</span>
                </div>
                <span className="font-semibold ">{startupData.fundingStage || 'Not set'}</span>
              </div>
            </div>
          </InfoCard>

          {/* Upcoming Events */}
          <InfoCard title="Upcoming Events" icon={CalendarIcon}>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg  border border-blue-100">
                <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold ">Investor Meet & Greet</p>
                  <p className="text-xs  mt-1">Tomorrow, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg  border border-green-100">
                <BuildingStorefrontIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold ">Pitch Competition</p>
                  <p className="text-xs  mt-1">Next Friday, 10:00 AM</p>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default StartupDashboard;