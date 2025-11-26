import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiCheck, FiX, FiUser, FiMail, FiPhone, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { getImageUrl } from '../../../../utils/imageUrls';
import { Link } from 'react-router-dom';

const StartupBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/smart/api/bookings/startup`, {
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

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`${baseUrl}/smart/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      const updatedBooking = await response.json();
      setBookings(bookings.map(b =>
        b._id === bookingId ? updatedBooking : b
      ));
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    statusFilter === 'all' || booking.status === statusFilter
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-1 px-3 py-1 bg-gray-100  text-cyan-600 rounded-md text-sm hover:bg-gray-200 transition-colors"
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'all' ? 'bg-indigo-100 text-cyan-600' : 'bg-gray-100 text-cyan-600'}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-cyan-600'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-cyan-600'}`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-cyan-600'}`}
        >
          Rejected
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-gray-500">
          {statusFilter === 'all'
            ? "You don't have any booking requests yet."
            : `No ${statusFilter} bookings found.`}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const profileImageUrl = getImageUrl(booking.userId?.profileImage, baseUrl);
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
                      {profileImageUrl ? (
                        <div className="h-12 w-12 rounded-full bg-white border border-gray-200 overflow-hidden">
                          <img
                            src={profileImageUrl}
                            alt={`${booking.userId?.name} profile`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = '/default-profile.png';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">
                          {booking.userId?.username || 'Unknown User'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-400" />
                          <span>
                            {formattedDate} at {booking.time}
                          </span>
                        </div>

                        {booking.userId?.email && (
                          <div className="flex items-center gap-2 mt-1">
                            <FiMail className="text-gray-400" />
                            <a
                              href={`mailto:${booking.userId.email}`}
                              className="text-indigo-600 hover:underline"
                            >
                              {booking.userId.email}
                            </a>
                          </div>
                        )}

                        {booking.userId?.phone && (
                          <div className="flex items-center gap-2 mt-1">
                            <FiPhone className="text-gray-400" />
                            <a
                              href={`tel:${booking.userId.phone}`}
                              className="text-gray-700 hover:underline"
                            >
                              {booking.userId.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {booking.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{booking.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100 transition-colors flex items-center gap-1"
                      >
                        <FiCheck size={14} />
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'rejected')}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md text-sm hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <FiX size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StartupBookingsPage;