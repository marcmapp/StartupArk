import { useState, useEffect } from 'react';
import { FiClock, FiCheck, FiX, FiCalendar, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { getImageUrl } from '../../../../utils/imageUrls';
import { Link } from 'react-router-dom';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/smart/api/bookings/user`, {
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

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Confirmed</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Booking Requests</h1>
        <button 
          onClick={fetchBookings}
          className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors"
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setStatusFilter('all')} 
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100'}`}
        >
          All
        </button>
        <button 
          onClick={() => setStatusFilter('pending')} 
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setStatusFilter('confirmed')} 
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
        >
          Confirmed
        </button>
        <button 
          onClick={() => setStatusFilter('rejected')} 
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
        >
          Rejected
        </button>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">
            {statusFilter === 'all' 
              ? "You haven't made any booking requests yet." 
              : `No ${statusFilter} bookings found.`}
          </p>
          {statusFilter !== 'all' && (
            <button 
              onClick={() => setStatusFilter('all')}
              className="mt-4 text-indigo-600 hover:underline text-sm"
            >
              View all bookings
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const logoUrl = getImageUrl(booking.startupId?.formData?.logo, baseUrl);
            const bookingDate = new Date(booking.date);
            const formattedDate = bookingDate.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={booking._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {logoUrl ? (
                        <div className="h-12 w-12 rounded-lg bg-white border border-gray-200 overflow-hidden">
                          <img
                            src={logoUrl}
                            alt={`${booking.startupId?.formData?.startupName} logo`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = '/default-startup-logo.png';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <FiCalendar size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">
                          {booking.startupId?.formData?.startupName || 'Unknown Startup'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-400" />
                          <span>
                            {formattedDate} at {booking.time}
                          </span>
                        </div>
                      </div>
                      
                      {booking.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{booking.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/smart/startups-by-id/${booking.startupId?._id}`}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <span>View Startup</span>
                    <FiExternalLink size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;