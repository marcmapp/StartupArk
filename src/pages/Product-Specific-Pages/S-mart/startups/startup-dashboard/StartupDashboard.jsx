import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            // Process the data to transform image keys into URLs
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">{error}</p>
          {error === 'Authentication required' && (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Login Required
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome back, {startupData.startupName}!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This is your dashboard. We'll build more features here soon.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/smart/profile')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View Startup Profile
          </button>
          <button
            onClick={() => navigate('/smart/editprofile')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartupDashboard;