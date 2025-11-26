/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiEdit2,
  FiExternalLink,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiPlus,
  FiShare2,
  FiCopy,
  FiDownload,
  FiCalendar,
  FiLoader,
  FiClock,
  FiHome,
  FiUsers,
  FiImage,
  FiFilm,
  FiPackage,
  FiCreditCard,
  FiChevronDown

} from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import AddProductForm from '../../products/AddProductForm';
import Loader from '../../../../../components/Loader';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

const StartupProfile = ({ startupId }) => {
  const navigate = useNavigate();
  const [startupData, setStartupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [vcData, setVcData] = useState(null);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcError, setVcError] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [availability, setAvailability] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  // Fetch availability on component mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`${baseUrl}/smart/api/smart/${startupId}/availability`);
        if (response.ok) {
          const data = await response.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    if (startupId) fetchAvailability();
  }, [startupId]);

  const handleSaveAvailability = async () => {
    try {
      setAvailabilityLoading(true);

      // 1. Convert short day names to full names
      const fullDays = selectedDays.map(day => ({
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday',
        'Sun': 'Sunday'
      }[day]));

      // 2. Validate time format (HH:MM)
      if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
        throw new Error("Time must be in HH:MM format");
      }

      // 3. Ensure timezone exists
      const timezone = availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      const availabilityData = {
        days: fullDays,
        timeRange: { start: startTime, end: endTime },
        timezone
      };

      console.log("Final Payload:", availabilityData); // Debug

      // 4. Use getAuthToken() consistently
      const token = getAuthToken();
      const response = await axios.put(
        `${baseUrl}/smart/api/smart/availability`,
        availabilityData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update UI
      setStartupData(prev => ({
        ...prev,
        availability: response.data.availability
      }));
      setIsEditingAvailability(false);
    } catch (error) {
      console.error("Save failed:", error);
      setAvailabilityError(
        error.response?.data?.error ||
        error.message ||
        "Failed to save availability"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };
  // Enhanced formatting with icons and tooltips
  const formatAvailability = (availability) => {
    if (!availability || !availability.days || availability.days.length === 0) {
      return null;
    }

    const formatTime = (time) => {
      // Convert "09:00" to "9:00 AM"
      const [hours, mins] = time.split(':');
      const hour = parseInt(hours);
      return hour >= 12
        ? `${hour === 12 ? 12 : hour - 12}:${mins} PM`
        : `${hour}:${mins} AM`;
    };

    // Handle timeRange (now checks for object structure)
    let timeRangeStr = '';
    if (availability.timeRange) {
      if (typeof availability.timeRange === 'string') {
        // Backward compatibility (if timeRange is a string like "09:00-17:00")
        timeRangeStr = availability.timeRange;
      } else if (availability.timeRange.start && availability.timeRange.end) {
        // Format as "9:00 AM - 5:00 PM"
        timeRangeStr = `${formatTime(availability.timeRange.start)} - ${formatTime(availability.timeRange.end)}`;
      }
    }

    return `${availability.days.join(', ')} ${timeRangeStr}`;
  };
  const getUserId = () => {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      const userObj = JSON.parse(user);
      return userObj.id || userObj._id;
    } catch (e) {
      return user;
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    const userId = getUserId();

    if (!token || !userId) {
      console.error('Authentication missing - redirecting to login');
      navigate('/login');
      return;
    }

    fetchStartupData();
    fetchProducts();
    fetchVcData();
  }, [navigate]);

  const fetchVcData = async () => {
    try {
      setVcLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/smart/api/smart/virtual-card`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setVcData(response.data);
      }
    } catch (err) {
      console.error('Error fetching VC data:', err);
      setVcError(err.response?.data?.error || 'Failed to load VC data');
    } finally {
      setVcLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const user = getUserId();
      let userId;

      try {
        const userObj = typeof user === 'string' ? JSON.parse(user) : user;
        userId = userObj?.id || userObj?._id || user;
      } catch (e) {
        userId = user;
      }

      if (!userId) {
        console.error('User ID not found');
        setProducts([]);
        return;
      }

      const response = await axios.get(
        `${baseUrl}/smart/api/smart/startup-products/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setProducts([]);
    }
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

  const createVirtualCard = async () => {
    try {
      setVcLoading(true);
      const token = getAuthToken();
      const response = await axios.post(
        `${baseUrl}/smart/api/smart/virtual-card`,
        { startupId: startupData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVcData(response.data);
    } catch (err) {
      console.error('Error creating VC:', err);
      setVcError(err.response?.data?.error || 'Failed to create virtual card');
    } finally {
      setVcLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/smart/startup-edit-profile');
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/vc/${vcData._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadVcImage = () => {
    const vcElement = document.getElementById('virtual-card');
    if (vcElement) {
      html2canvas(vcElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `${startupData.startupName}-virtual-card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="text-center py-4 sm:py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!startupData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="text-center py-4 sm:py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Startup Data Found</h3>
          <p className="text-gray-600">You haven't submitted your startup information yet.</p>
          <button
            onClick={() => navigate('/startup/onboarding')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
          >
            Complete Startup Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-10">
        {/* Profile Header */}
        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Left Side - Logo & Info */}
            <div className="flex items-start space-x-4 sm:space-x-5">
              {startupData.logo ? (
                <img
                  src={startupData.logo}
                  alt="Startup logo"
                  className="h-18 w-18 sm:h-24 sm:w-24 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                  onError={(e) => {
                    e.target.src = '/default-startup-logo.png';
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="h-18 w-18 sm:h-24 sm:w-24 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center shadow-sm">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-400">
                    {startupData.startupName?.charAt(0) || 'S'}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {startupData.startupName}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {startupData.tagline}
                </p>

                {/* Enhanced Availability Badge */}
                {startupData?.availability?.days?.length > 0 ? (
                  <div className="flex items-center mt-2">
                    <div className="flex items-center bg-blue-50 rounded-full px-3 py-1.5">
                      <FiClock className="text-blue-600 mr-2" size={14} />
                      <span className="text-sm font-medium text-gray-700">
                        Available: {formatAvailability(startupData.availability)}
                      </span>
                      <button
                        onClick={() => setIsEditingAvailability(true)}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label="Edit availability"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingAvailability(true)}
                    className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FiCalendar className="mr-1.5" size={14} />
                    Set Availability
                  </button>
                )}
              </div>
            </div>

            {/* Right Side - Buttons */}
            <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              {!startupData.availability && (
                <button
                  onClick={() => setIsEditingAvailability(true)}
                  className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                >
                  <FiCalendar className="mr-2" />
                  Set Availability
                </button>
              )}
              <button
                onClick={handleEdit}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                <FiEdit2 className="mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Availability Modal */}
        {isEditingAvailability && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Set Your Availability</h2>
                  <button
                    onClick={() => setIsEditingAvailability(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiHome size={20} />
                  </button>
                </div>

                {availabilityError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start">
                    <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    {availabilityError}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Days Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Days <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedDays.includes(day)
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Range <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="appearance-none border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          disabled={availabilityLoading}
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i < 10 ? `0${i}` : i;
                            return (
                              <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
                            );
                          })}
                        </select>
                        <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                      <span className="text-gray-500">to</span>
                      <div className="relative flex-1">
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="appearance-none border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          disabled={availabilityLoading}
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i < 10 ? `0${i}` : i;
                            return (
                              <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
                            );
                          })}
                        </select>
                        <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={availability.timezone}
                        onChange={(e) => setAvailability(prev => ({
                          ...prev,
                          timezone: e.target.value
                        }))}
                        className="appearance-none border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {Intl.supportedValuesOf('timeZone').map(tz => (
                          <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => setIsEditingAvailability(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
                  disabled={availabilityLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvailability}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${availabilityLoading || selectedDays.length === 0
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                    }`}
                  disabled={availabilityLoading || selectedDays.length === 0}
                >
                  {availabilityLoading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Availability'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 px-5 sm:px-8 overflow-x-auto">
            {['overview', 'team', 'gallery', 'pitch', 'products', 'vc'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab === 'vc' ? (
                  <>
                    <FiCreditCard className="inline mr-1.5" />
                    Virtual Card
                  </>
                ) : tab === 'products' ? (
                  <>
                    <FiPackage className="inline mr-1.5" />
                    Products ({products.length})
                  </>
                ) : (
                  <>
                    {tab === 'overview' && <FiHome className="inline mr-1.5" />}
                    {tab === 'team' && <FiUsers className="inline mr-1.5" />}
                    {tab === 'gallery' && <FiImage className="inline mr-1.5" />}
                    {tab === 'pitch' && <FiFilm className="inline mr-1.5" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-4 sm:mb-8">
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">About Us</h2>
                  <div className="prose max-w-none text-gray-600 text-sm sm:text-base">
                    <p className="mb-3 sm:mb-4">{startupData.description}</p>
                    <p className="mb-3 sm:mb-4">{startupData.bio}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">Our Solution</h2>
                  <div className="prose max-w-none text-gray-600 text-sm sm:text-base">
                    <h3 className="font-medium text-gray-900">Problem Statement</h3>
                    <p className="mb-3 sm:mb-4">{startupData.problemStatement || 'Not specified'}</p>

                    <h3 className="font-medium text-gray-900">Unique Proposition</h3>
                    <p className="mb-3 sm:mb-4">{startupData.uniqueProposition || 'Not specified'}</p>

                    <h3 className="font-medium text-gray-900">Technology Stack</h3>
                    {startupData.technologyStack && startupData.technologyStack.length > 0 ? (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                        {startupData.technologyStack.map((tech, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>Not specified</p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">Mission & Vision</h2>
                  <div className="prose max-w-none text-gray-600 text-sm sm:text-base">
                    <h3 className="font-medium text-gray-900">Mission</h3>
                    <p className="mb-3 sm:mb-4">{startupData.mission || 'Not specified'}</p>

                    <h3 className="font-medium text-gray-900">Vision</h3>
                    <p>{startupData.vision || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">Key Details</h2>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Industry</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{startupData.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Business Model</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{startupData.businessModel || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Founded</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{(startupData.foundedYear)}</p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Team Size</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{startupData.teamSize || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Funding Stage</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{startupData.fundingStage || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Location</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{startupData.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">Contact</h2>
                  <div className="space-y-2 sm:space-y-3">
                    {startupData.website && (
                      <div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500">Website</h3>
                        <a
                          href={startupData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm sm:text-base"
                        >
                          {startupData.website.replace(/^https?:\/\//, '')}
                          <FiExternalLink className="ml-1" />
                        </a>
                      </div>
                    )}
                    {startupData.phone && (
                      <div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500">Phone</h3>
                        <p className="text-gray-900 text-sm sm:text-base">{startupData.phone}</p>
                      </div>
                    )}
                    {startupData.email && (
                      <div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500">Email</h3>
                        <p className="text-gray-900 text-sm sm:text-base">{startupData.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">Social Media</h2>
                  <div className="flex space-x-3 sm:space-x-4">
                    {startupData.linkedin && (
                      <a
                        href={startupData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-indigo-600"
                        aria-label="LinkedIn"
                      >
                        <FiLinkedin className="h-5 w-5" />
                      </a>
                    )}
                    {startupData.twitter && (
                      <a
                        href={startupData.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-indigo-600"
                        aria-label="Twitter"
                      >
                        <FiTwitter className="h-5 w-5" />
                      </a>
                    )}
                    {startupData.facebook && (
                      <a
                        href={startupData.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-indigo-600"
                        aria-label="Facebook"
                      >
                        <FiFacebook className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Our Team</h2>
            {startupData.team && startupData.team.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {startupData.team.map((member, index) => (
                  <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 border border-gray-100 rounded-lg">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={`${member.name}'s avatar`}
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg sm:text-xl font-medium text-gray-500">
                          {member.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">{member.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{member.position}</p>
                      {member.bio && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{member.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-600">No team members added yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Gallery</h2>
            {startupData.gallery && startupData.gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {startupData.gallery.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image.url}
                      alt={image.caption || `Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/default-gallery-image.png';
                        e.target.onerror = null;
                      }}
                    />
                    {image.caption && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                        <p className="text-white text-xs sm:text-sm truncate w-full">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-600">No gallery images added yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pitch' && (
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Pitch Deck</h2>
            {startupData.pitchDeck ? (
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 flex flex-col items-center">
                {startupData.pitchDeck.endsWith('.pdf') ? (
                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white rounded-lg shadow-inner">
                    <svg className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      <path d="M14 2v6h6" />
                      <path d="M14 12h4" />
                      <path d="M14 16h4" />
                      <path d="M14 20h4" />
                    </svg>
                  </div>
                ) : (
                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white rounded-lg shadow-inner">
                    <svg className="h-12 w-12 sm:h-16 sm:w-16 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      <path d="M14 2v6h6" />
                      <path d="M8 12h8" />
                      <path d="M8 16h8" />
                      <path d="M8 20h5" />
                    </svg>
                  </div>
                )}

                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base text-center">
                  {startupData.pitchDeck.split('/').pop()}
                </p>

                <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
                  <a
                    href={startupData.pitchDeckUrl || `${baseUrl}/smart/api/smart/file/${encodeURIComponent(startupData.pitchDeck)}`}
                    download
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm sm:text-base"
                  >
                    <FiExternalLink className="mr-1 sm:mr-2" />
                    Download
                  </a>

                  {startupData.pitchDeck.endsWith('.pdf') && (
                    <a
                      href={startupData.pitchDeckUrl || `${baseUrl}/smart/api/smart/file/${encodeURIComponent(startupData.pitchDeck)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm sm:text-base"
                    >
                      <FiExternalLink className="mr-1 sm:mr-2" />
                      Preview
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-600 mb-4">No pitch deck uploaded yet.</p>
                <button
                  onClick={() => navigate('/startup/edit')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
                >
                  Upload Pitch Deck
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="p-4 sm:p-6">
            {showProductForm ? (
              <AddProductForm
                onSuccess={() => {
                  setShowProductForm(false);
                  fetchProducts();
                }}
                onCancel={() => setShowProductForm(false)}
                isEdit={!!editingProduct}
                initialData={editingProduct}
              />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm sm:text-base"
                  >
                    <FiPlus className="mr-1 sm:mr-2" />
                    Add Product
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                    <svg
                      className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No products yet</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Get started by adding your first product.
                    </p>
                    <div className="mt-4 sm:mt-6">
                      <button
                        onClick={() => setShowProductForm(true)}
                        className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FiPlus className="-ml-0.5 mr-1 sm:-ml-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Add Product
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {products.map(product => (
                      <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-3 sm:p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="text-base sm:text-lg font-semibold">{product.name}</h3>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowProductForm(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50"
                              title="Edit product"
                            >
                              <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                          <p className="text-gray-600 mt-1 text-xs sm:text-sm">{product.shortDescription}</p>
                          {product.tags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                              {product.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {product.website && (
                            <div className="mt-2">
                              <a
                                href={product.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm flex items-center"
                              >
                                Visit website <FiExternalLink className="ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vc' && (
          <div className="p-4 sm:p-6 lg:p-8">
            {vcLoading ? (
              <Loader />
            ) : vcError ? (
              <div className="text-center text-red-500 text-sm sm:text-base">{vcError}</div>
            ) : vcData ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Your Virtual Card</h2>
                  <button
                    onClick={handleShare}
                    className="flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
                  >
                    <FiShare2 className="mr-1 sm:mr-2" />
                    Share
                  </button>
                </div>

                {/* Virtual Card Design */}
                <div
                  id="virtual-card"
                  className="max-w-xs sm:max-w-md mx-auto border-2 border-black rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <h3 className="text-lg sm:text-xl font-bold text-highlight truncate">{startupData.startupName}</h3>
                        <p className="text-gray-600 text-sm sm:text-base truncate">{startupData.tagline}</p>
                      </div>
                      {startupData.logo && (
                        <img
                          src={startupData.logo}
                          alt="Logo"
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      )}
                    </div>

                    <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Industry</p>
                        <p className="font-medium text-sm sm:text-base text-secondary">{startupData.industry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Location</p>
                        <p className="font-medium text-sm sm:text-base text-secondary">{startupData.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Founded</p>
                        <p className="font-medium text-sm sm:text-base text-secondary">{startupData.foundedYear || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Stage</p>
                        <p className="font-medium text-sm sm:text-base text-secondary">{startupData.fundingStage || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <p className="text-xs sm:text-sm text-gray-500">Contact</p>
                      <p className="font-medium text-sm sm:text-base text-secondary">{startupData.email || 'N/A'}</p>
                      {startupData.website && (
                        <a
                          href={startupData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-xs sm:text-sm truncate block"
                        >
                          {startupData.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-6 flex justify-center">
                      <QRCode
                        value={`${window.location.origin}/vc/${vcData._id}`}
                        size={96}
                        level="H"
                      />
                    </div>

                    <div className="mt-2 sm:mt-4 text-center text-xs text-gray-500">
                      Scan to view digital profile
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto max-w-xs sm:max-w-md">
                  <svg
                    className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No virtual card yet</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Create a beautiful digital business card to share with investors and partners.
                  </p>
                  <div className="mt-4 sm:mt-6">
                    <button
                      onClick={createVirtualCard}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Virtual Card
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Share Modal */}
            {shareModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm">
                  <h3 className="text-lg font-medium mb-3 sm:mb-4">Share Virtual Card</h3>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Share Link
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/vc/${vcData._id}`}
                          className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm border p-2 truncate"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                        >
                          <FiCopy className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                      {copied && (
                        <p className="mt-1 text-xs sm:text-sm text-green-600">Copied to clipboard!</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <button
                        onClick={downloadVcImage}
                        className="flex items-center justify-center px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiDownload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Download Image
                      </button>

                      <div className="flex justify-center sm:justify-end space-x-2">
                        <button className="p-1 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                          <FiTwitter className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button className="p-1 sm:p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                          <FiLinkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button className="p-1 sm:p-2 rounded-full bg-blue-800 text-white hover:bg-blue-900">
                          <FiFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 flex justify-end">
                      <button
                        onClick={() => setShareModalOpen(false)}
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs sm:text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupProfile;