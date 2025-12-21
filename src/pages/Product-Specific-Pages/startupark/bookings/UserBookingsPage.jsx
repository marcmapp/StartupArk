import { useState, useEffect } from 'react';
import { 
  FiClock, FiCheck, FiX, FiCalendar, FiRefreshCw, FiExternalLink, 
  FiVideo, FiXCircle, FiInfo, FiCheckCircle, FiUsers, FiTrendingUp,
  FiAlertCircle, FiArrowRight, FiGrid
} from 'react-icons/fi';
import { getImageUrl } from '../../../../utils/imageUrls';
import { Link, useNavigate } from 'react-router-dom';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/startupark/api/bookings/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    const cancellationReason = prompt('Please enter cancellation reason:');
    if (cancellationReason) {
      try {
        const response = await fetch(`${baseUrl}/startupark/api/bookings/${bookingId}/cancel`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ cancellationReason })
        });

        if (response.ok) {
          const updatedBooking = await response.json();
          setBookings(bookings.map(b =>
            b._id === bookingId ? updatedBooking : b
          ));
          showNotification('Meeting cancelled successfully!', 'success');
        } else {
          const errorData = await response.json();
          showNotification(`Failed to cancel booking: ${errorData.error}`, 'error');
        }
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        showNotification('Failed to cancel booking. Please try again.', 'error');
      }
    }
  };

  const markAsCompleted = async (bookingId) => {
    try {
      const response = await fetch(`${baseUrl}/startupark/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(bookings.map(b =>
          b._id === bookingId ? updatedBooking : b
        ));
        showNotification('Meeting marked as completed!', 'success');
      } else {
        const errorData = await response.json();
        showNotification(`Failed to complete meeting: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Failed to complete meeting:', error);
      showNotification('Failed to complete meeting. Please try again.', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    alert(message);
  };

  // Stats calculation
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
  };

  const filteredBookings = bookings.filter(booking => 
    activeTab === 'all' || booking.status === activeTab
  );

  const isMeetingPast = (booking) => {
    try {
      const bookingDate = typeof booking.date === 'string' 
        ? new Date(booking.date) 
        : booking.date;
      
      const meetingDateTime = new Date(`${bookingDate.toISOString().split('T')[0]}T${booking.time}:00`);
      const meetingEndTime = new Date(meetingDateTime.getTime() + (booking.duration || 60) * 60 * 1000);
      return new Date() > meetingEndTime;
    } catch (error) {
      console.error('Error checking meeting time:', error);
      return false;
    }
  };

  const formatBookingDate = (date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
      confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🎯' },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '❌' },
      expired: { color: 'bg-red-100 text-red-800 border-red-200', icon: '⏰' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🚫' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.text || status}
      </span>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const handleViewCalendar = () => {
    navigate('/startupark/usercalender');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading your meetings...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Meetings</h1>
          <p className="text-gray-600 mt-2">Manage your scheduled calls and meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleViewCalendar}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <FiGrid size={18} />
            Calendar View
          </button>
          <button 
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Meetings"
          value={stats.total}
          icon={<FiUsers className="h-6 w-6 text-cyan-600" />}
          color="bg-cyan-50"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          icon={<FiClock className="h-6 w-6 text-green-600" />}
          color="bg-green-50"
          subtitle="Confirmed calls"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<FiCheckCircle className="h-6 w-6 text-blue-600" />}
          color="bg-blue-50"
          subtitle="Past meetings"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FiAlertCircle className="h-6 w-6 text-yellow-600" />}
          color="bg-yellow-50"
          subtitle="Awaiting response"
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'all', label: 'All Meetings', count: stats.total },
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'confirmed', label: 'Upcoming', count: stats.upcoming },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'all' ? "No meetings scheduled" : `No ${activeTab} meetings`}
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto mb-6">
            {activeTab === 'all' 
              ? "You haven't scheduled any meetings yet. Start by exploring startups and booking calls."
              : `No ${activeTab} meetings found.`}
          </p>
          {activeTab !== 'all' && (
            <button 
              onClick={() => setActiveTab('all')}
              className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
            >
              View all meetings
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map(booking => {
            const logoUrl = getImageUrl(booking.startupId?.formData?.logo, baseUrl);
            const formattedDate = formatBookingDate(booking.date);
            const meetingPast = isMeetingPast(booking);

            return (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  {/* Startup Info & Meeting Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`${booking.startupId?.formData?.startupName} logo`}
                          className="h-14 w-14 rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                          <FiCalendar size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {booking.startupId?.formData?.startupName || 'Unknown Startup'}
                        </h3>
                        {getStatusBadge(booking.status)}
                        {meetingPast && booking.status === 'confirmed' && (
                          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium border border-orange-200">
                            Past Due
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                            <FiCalendar size={14} />
                            <span className="text-sm font-medium">{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                            <FiClock size={14} />
                            <span className="text-sm font-medium">{booking.time}</span>
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            {booking.duration || 60} min
                          </div>
                        </div>

                        {booking.meetingPurpose && (
                          <div className="flex items-start gap-2 mt-3">
                            <FiInfo className="text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Purpose:</span>
                              <p className="text-gray-600 text-sm mt-1">{booking.meetingPurpose}</p>
                            </div>
                          </div>
                        )}

                        {/* Meeting Links */}
                        <div className="flex gap-4 mt-3">
                          {booking.meetLink && booking.status === 'confirmed' && (
                            <a
                              href={booking.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              <FiVideo size={14} />
                              Join Meeting
                            </a>
                          )}
                          <Link 
                            to={`/startupark/startups-by-id/${booking.startupId?._id}`}
                            className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700"
                          >
                            <FiExternalLink size={14} />
                            View Startup
                          </Link>
                        </div>

                        {booking.cancellationReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-700">
                              <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Link 
                      to={`/startupark/startups-by-id/${booking.startupId?._id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-medium text-sm min-w-[120px] justify-center"
                    >
                      View Startup
                      <FiArrowRight size={14} />
                    </Link>

                    {booking.status === 'pending' && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium text-sm min-w-[120px] justify-center"
                      >
                        <FiXCircle size={16} />
                        Cancel Request
                      </button>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="flex flex-col gap-2">
                        {meetingPast && (
                          <button
                            onClick={() => markAsCompleted(booking._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm min-w-[120px] justify-center"
                          >
                            <FiCheckCircle size={16} />
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium text-sm min-w-[120px] justify-center"
                        >
                          <FiXCircle size={16} />
                          Cancel Call
                        </button>
                      </div>
                    )}

                    {booking.status === 'completed' && (
                      <button
                        onClick={() => {
                          window.location.href = `/startupark/startups-by-id/${booking.startupId?._id}?rebook=true`;
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium text-sm min-w-[120px] justify-center"
                      >
                        <FiCheck size={16} />
                        Book Again
                      </button>
                    )}
                  </div>
                </div>

                {booking.message && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-700">{booking.message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;