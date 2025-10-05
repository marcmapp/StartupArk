import { FiClock, FiCalendar, FiChevronDown, FiX,FiCheck, FiMessageSquare  } from 'react-icons/fi';
import { getImageUrl } from '../../../../../../utils/imageUrls';
import { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';



const formatAvailability = (availability) => {
  if (!availability || !availability.days || availability.days.length === 0) {
    return null;
  }

  const formatTime = (time) => {
    const [hours, mins] = time.split(':');
    const hour = parseInt(hours);
    return hour >= 12
      ? `${hour === 12 ? 12 : hour - 12}:${mins} PM`
      : `${hour}:${mins} AM`;
  };

  let timeRangeStr = '';
  if (availability.timeRange) {
    if (typeof availability.timeRange === 'string') {
      timeRangeStr = availability.timeRange;
    } else if (availability.timeRange.start && availability.timeRange.end) {
      timeRangeStr = `${formatTime(availability.timeRange.start)} - ${formatTime(availability.timeRange.end)}`;
    }
  }

  return `${availability.days.join(', ')} ${timeRangeStr}`;
};

const StartupDetailHeader = ({ startup, isCurrentUser }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const logoUrl = getImageUrl(startup.logo, baseUrl);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
const [existingBooking, setExistingBooking] = useState(null);

// Add this useEffect to check for existing bookings
useEffect(() => {
  const checkExistingBooking = async () => {
    try {
      const response = await fetch(`${baseUrl}/smart/api/bookings/check?startupId=${startup._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setExistingBooking(data);
    } catch (error) {
      console.error('Error checking bookings:', error);
    }
  };

  if (!isCurrentUser && startup?._id) {
    checkExistingBooking();
  }
}, [startup?._id, isCurrentUser, bookingSuccess]);
  // Check if a date is within the available days
  const isDateAvailable = (dateString) => {
    if (!startup.availability?.days?.length) return false;
    
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return startup.availability.days
      .map(day => day.toLowerCase())
      .includes(dayName);
  };

  // Generate available time slots based on startup's availability
  const generateTimeSlots = () => {
    if (!startup.availability || !startup.availability.timeRange) return [];
    
    const { timeRange } = startup.availability;
    const [startHour, startMinute] = timeRange.start.split(':').map(Number);
    const [endHour, endMinute] = timeRange.end.split(':').map(Number);
    
    const slots = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(timeString);
      
      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTime(''); // Reset time when date changes
  };

const handleBookMeeting = async () => {
  if (!selectedDate || !selectedTime) {
    setBookingError('Please select both date and time');
    return;
  }

  try {
    setBookingLoading(true);
    setBookingError(null);
    
    const response = await fetch(`${baseUrl}/smart/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        startupId: startup._id,
        date: selectedDate,
        time: selectedTime,
        message: '' // Optional message
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to book meeting');
    }

    setBookingSuccess(true);
  } catch (error) {
    setBookingError(error.message);
  } finally {
    setBookingLoading(false);
  }
};

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-white border border-gray-200 overflow-hidden">
                <img
                  src={logoUrl}
                  alt={`${startup.startupName} logo`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-startup-logo.png';
                  }}
                />
              </div>
            ) : (
              <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {startup.startupName?.charAt(0) || 'S'}
                </span>
              </div>
            )}
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{startup.startupName}</h1>
              <p className="text-lg sm:text-xl text-indigo-600 mt-1">{startup.tagline}</p>
              
              {/* Availability Badge */}
              {startup.availability?.days?.length > 0 && (
                <div className="flex items-center mt-3">
                  <div className="flex items-center bg-blue-50 rounded-full px-3 py-1.5">
                    <FiClock className="text-blue-600 mr-2" size={14} />
                    <span className="text-sm font-medium text-gray-700">
                      Available: {formatAvailability(startup.availability)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Show Book button only if:
                - User is not viewing their own startup
                - Startup has availability set */}

{!isCurrentUser && (
  <Link
    to={`/smart/chat/${startup._id}`}
    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
  >
    <FiMessageSquare className="mr-2" />
    Chat
  </Link>
)}
            
           {!isCurrentUser && startup?.availability?.days?.length > 0 && (
  existingBooking ? (
    <Link
      to="/smart/my-bookings"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
    >
      <FiClock className="mr-2" />
      {existingBooking.status === 'pending' 
        ? 'Request Pending' 
        : 'Meeting Confirmed'}
    </Link>
  ) : bookingSuccess ? (
    <Link
      to="/smart/my-bookings"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
    >
      <FiCalendar className="mr-2" />
      View My Bookings
    </Link>
  ) : (
    <button
      onClick={() => setShowBookingModal(true)}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
    >
      <FiCalendar className="mr-2" />
      Book Meeting
    </button>
  )
)}
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Visit Website
                <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            
            {startup.pitchDeck && (
              <a
                href={startup.pitchDeck}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Pitch Deck
                <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </a>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">
            {startup.industry}
          </span>
          {startup.fundingStage && (
            <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
              {startup.fundingStage}
            </span>
          )}
          {startup.location && (
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
              {startup.location}
            </span>
          )}
        </div>
      </div>

      {/* Booking Modal */}
    {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {bookingSuccess ? 'Booking Confirmed!' : 'Book a Meeting'}
                </h2>
                {!bookingSuccess && (
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingError(null);
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>

              {bookingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start">
                  <FiClock className="mr-2 mt-0.5 flex-shrink-0" />
                  {bookingError}
                </div>
              )}

              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <FiCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-gray-700 mb-2">Meeting booked successfully!</p>
                  <p className="text-sm text-gray-500">
                    {selectedDate} at {selectedTime}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Available days: {startup.availability.days.join(', ')}
                    </p>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="appearance-none border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        disabled={!selectedDate || !isDateAvailable(selectedDate)}
                      >
                        <option value="">Select a time</option>
                        {generateTimeSlots().map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Available times: {startup.availability.timeRange.start} - {startup.availability.timeRange.end}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!bookingSuccess && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
                  disabled={bookingLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookMeeting}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${bookingLoading || !selectedDate || !selectedTime || !isDateAvailable(selectedDate)
                      ? 'bg-green-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
                    }`}
                  disabled={bookingLoading || !selectedDate || !selectedTime || !isDateAvailable(selectedDate)}
                >
                  {bookingLoading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupDetailHeader;