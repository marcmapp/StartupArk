import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import "boxicons";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const [userRes, subscriptionRes] = await Promise.all([
          axios.get(`${baseUrl}/api/mappuser/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseUrl}/api/mappuser/subscription`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUser(userRes.data);
        setSubscription(subscriptionRes.data);
        setEditForm({
          username: userRes.data.username,
          email: userRes.data.email,
          whatsappNumber: userRes.data.whatsappNumber
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        showMessage('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${baseUrl}/api/mappuser/profile`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUser(response.data.user);
      setIsEditing(false);
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const getSubscriptionBadgeColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'basic':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'startup':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'student':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'user':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isSubscriptionActive = () => {
    if (!subscription?.expiryDate) return false;
    return new Date(subscription.expiryDate) > new Date();
  };

  if (isLoading && !user) {
    return <Loader />;
  }
 
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-2 border-white rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-500 mb-2">
                PROFILE
              </h1>
              <p className="text-gray-400">Manage your account settings and preferences</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700  font-semibold rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg text-center ${
              message.type === 'success' 
                ? 'bg-green-800 text-green-300 border border-green-600' 
                : 'bg-red-800 text-red-300 border border-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information Card */}
            <div className="border-2 border-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-500">Basic Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition duration-300"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">Username</label>
                      <p className=" text-lg font-semibold">{user.username}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Email</label>
                      <p className=" text-lg">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">WhatsApp Number</label>
                      <p className=" text-lg">{user.whatsappNumber}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Member Since</label>
                      <p className=" text-lg">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.startuparkRole)}`}>
                      {user.startuparkRole || 'User'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSubscriptionBadgeColor(user.subscriptionPlan)}`}>
                      {user.subscriptionPlan || 'Basic'}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">Username</label>
                      <input
                        type="text"
                        value={editForm.username || ''}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full p-3 bg-black border border-gray-600  rounded focus:ring-4 focus:ring-white transition duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Email</label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-3 bg-black border border-gray-600  rounded focus:ring-4 focus:ring-white transition duration-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">WhatsApp Number</label>
                    <input
                      type="text"
                      value={editForm.whatsappNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                      className="w-full p-3 bg-black border border-gray-600  rounded focus:ring-4 focus:ring-white transition duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-3 bg-white hover:bg-black hover: hover:border-white text-black border-2 border-black font-semibold rounded-lg shadow-md focus:ring-4 focus:ring-white transition duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              )}
            </div>

            {/* Agreement Status */}
            <div className="border-2 border-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Agreement Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex items-center">
                  <box-icon 
                    name={user.hasAgreedTostartuparkUser ? 'check-circle' : 'x-circle'} 
                    color={user.hasAgreedTostartuparkUser ? '#10B981' : '#EF4444'}
                    className="mr-3"
                  ></box-icon>
                  <span>startupark User: {user.hasAgreedTostartuparkUser ? 'Agreed' : 'Not Agreed'}</span>
                </div>
                {user.startuparkRole === 'startup' && (
                  <div className="flex items-center">
                    <box-icon 
                      name={user.hasAgreedTostartuparkStartup ? 'check-circle' : 'x-circle'} 
                      color={user.hasAgreedTostartuparkStartup ? '#10B981' : '#EF4444'}
                      className="mr-3"
                    ></box-icon>
                    <span>startupark Startup: {user.hasAgreedTostartuparkStartup ? 'Agreed' : 'Not Agreed'}</span>
                  </div>
                )}
                {user.startuparkRole === 'student' && (
                  <div className="flex items-center">
                    <box-icon 
                      name={user.hasAgreedTostartuparkStudent ? 'check-circle' : 'x-circle'} 
                      color={user.hasAgreedTostartuparkStudent ? '#10B981' : '#EF4444'}
                      className="mr-3"
                    ></box-icon>
                    <span>startupark Student: {user.hasAgreedTostartuparkStudent ? 'Agreed' : 'Not Agreed'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Subscription & Quick Actions */}
          <div className="space-y-8">
            {/* Subscription Status */}
            <div className="border-2 border-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Subscription</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Plan:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSubscriptionBadgeColor(subscription?.plan)}`}>
                    {subscription?.plan || 'Basic'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isSubscriptionActive() 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {isSubscriptionActive() ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {subscription?.expiryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expires:</span>
                    <span className="">{formatDate(subscription.expiryDate)}</span>
                  </div>
                )}

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition duration-300 mt-4"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-2 border-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 dark:bg-black hover:text-white hover:bg-black border-2 dark:border-white border-black font-semibold rounded-lg dark:hover:bg-white dark:hover:text-red-600 transition duration-300"
                >
                  Go to Dashboard
                </button>
                
                <button
                  onClick={() => navigate('/startupark')}
                  className="w-full py-3 dark:bg-black hover:text-white hover:bg-black border-2 dark:border-white border-black font-semibold rounded-lg dark:hover:bg-white dark:hover:text-red-600 transition duration-300"
                >
                  Explore startupark Features
                </button>

                <button
                  onClick={() => navigate('/favorites')}
                  className="w-full py-3 dark:bg-black hover:text-white hover:bg-black border-2 dark:border-white border-black font-semibold rounded-lg dark:hover:bg-white dark:hover:text-red-600 transition duration-300"
                >
                  My Favorites
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="border-2 border-white rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Account Stats</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Favorites:</span>
                  <span className="">{user.favorites?.length || 0}</span>
                </div>
                
                
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Active:</span>
                  <span className="">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;