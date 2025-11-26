import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, onRegister, onStartEvent, onEndEvent, isOrganizer }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
          <span className="text-sm text-gray-500">{event.duration}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)}
          </div>
          
          {event.startupId && (
            <div className="flex items-center text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {event.startupId.formData?.startupName || 'Startup'}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Attendance</span>
            <span>{event.attendees?.length || 0}/{event.maxAttendees}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ 
                width: `${((event.attendees?.length || 0) / event.maxAttendees) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {isOrganizer ? (
            <>
              {event.status === 'upcoming' && (
                <button
                  onClick={() => onStartEvent(event._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Start Event
                </button>
              )}
              {event.status === 'live' && (
                <button
                  onClick={() => onEndEvent(event._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  End Event
                </button>
              )}
              <Link
                to={`/events/${event._id}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
              >
                Manage
              </Link>
            </>
          ) : (
            <>
              {!event.isAttending && event.status === 'upcoming' && (
                <button
                  onClick={() => onRegister(event._id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Register
                </button>
              )}
              {(event.isAttending || event.status === 'live') && (
                <Link
                  to={`/virtual-event/${event._id}`}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
                >
                  {event.status === 'live' ? 'Join Now' : 'View Details'}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;