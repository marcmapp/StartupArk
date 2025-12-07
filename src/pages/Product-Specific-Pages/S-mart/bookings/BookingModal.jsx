import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiX, FiCheck, FiChevronDown } from 'react-icons/fi';

const BookingModal = ({ 
  startup, 
  isOpen, 
  onClose, 
  onBookingSuccess 
}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingPurpose, setMeetingPurpose] = useState('');
  const [meetingType, setMeetingType] = useState('general');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedDate('');
    setSelectedTime('');
    setMeetingPurpose('');
    setMeetingType('general');
    setBookingError(null);
    setBookingSuccess(false);
  };

  const isDateAvailable = (dateString) => {
    if (!startup.availability?.days?.length) return false;
    
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return startup.availability.days
      .map(day => day.toLowerCase())
      .includes(dayName);
  };

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
    setSelectedTime('');
  };

  const formatTimeDisplay = (time) => {
    const [hours, mins] = time.split(':');
    const hour = parseInt(hours);
    return hour >= 12
      ? `${hour === 12 ? 12 : hour - 12}:${mins} PM`
      : `${hour}:${mins} AM`;
  };

  const handleBookMeeting = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingError('Please select both date and time');
      return;
    }

    if (!meetingPurpose.trim()) {
      setBookingError('Please provide a meeting purpose');
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
          meetingPurpose: meetingPurpose.trim(),
          meetingType,
          message: meetingPurpose.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book meeting');
      }

      setBookingSuccess(true);
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-scale-in">
        {/* Header */}
        <div className="bg-white p-6 text-black">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {bookingSuccess ? '🎉 Booking Confirmed!' : 'Schedule a Meeting'}
              </h2>
              <p className="mt-1">
                {bookingSuccess 
                  ? `Your meeting with ${startup.startupName} has been scheduled!` 
                  : `Book a meeting with ${startup.startupName}`
                }
              </p>
            </div>
            {!bookingSuccess && (
              <button
                onClick={handleClose}
                className="text-black hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {bookingError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <FiClock className="text-red-600" />
              </div>
              <div>
                <p className="font-medium">Booking Error</p>
                <p className="text-sm mt-1">{bookingError}</p>
              </div>
            </div>
          )}

          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <FiCheck className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Meeting Scheduled Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedDate} at {formatTimeDisplay(selectedTime)}
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left">
                <p className="font-medium text-gray-900">Meeting Purpose:</p>
                <p className="text-gray-600 mt-1">{meetingPurpose}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Meeting Purpose */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Meeting Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={meetingPurpose}
                  onChange={(e) => setMeetingPurpose(e.target.value)}
                  placeholder="Briefly describe what you'd like to discuss..."
                  rows={3}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Let the startup know what you'd like to discuss
                </p>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Meeting Type
                </label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none"
                >
                  <option value="general">General Discussion</option>
                  <option value="funding">Funding Opportunity</option>
                  <option value="partnership">Partnership</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="demo">Product Demo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-black w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  />
                </div>
                {selectedDate && !isDateAvailable(selectedDate) && (
                  <p className="text-red-500 text-sm mt-2">
                    ⚠️ Selected date is not available. Available days: {startup.availability.days.join(', ')}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedDate || !isDateAvailable(selectedDate)}
                    className="text-black w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                  >
                    <option value="">Choose a time slot</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {formatTimeDisplay(time)}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {startup.availability?.timeRange && (
                  <p className="text-xs text-gray-500 mt-2">
                    Available times: {formatTimeDisplay(startup.availability.timeRange.start)} - {formatTimeDisplay(startup.availability.timeRange.end)}
                  </p>
                )}
              </div>

              {/* Availability Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FiClock className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Availability</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {startup.availability.days.join(', ')} • {formatTimeDisplay(startup.availability.timeRange.start)} - {formatTimeDisplay(startup.availability.timeRange.end)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!bookingSuccess ? (
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-medium text-sm disabled:opacity-50"
              disabled={bookingLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleBookMeeting}
              disabled={bookingLoading || !selectedDate || !selectedTime || !isDateAvailable(selectedDate) || !meetingPurpose.trim()}
              className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center transition-all ${
                bookingLoading || !selectedDate || !selectedTime || !isDateAvailable(selectedDate) || !meetingPurpose.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {bookingLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;