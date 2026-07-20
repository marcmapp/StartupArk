import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../../../../services/eventService';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const eventData = await eventService.getEvent(id);
      setEvent(eventData);
      setAttending(eventData.isAttending);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      await eventService.registerForEvent(id);
      setAttending(true);
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Failed to register for event');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!event) {
    return <div className="flex justify-center items-center h-64">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-blue-100 text-lg">{event.startupId?.companyName}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  event.status === 'live' ? 'bg-green-500' :
                  event.status === 'upcoming' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}>
                  {event.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(event.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{event.attendees?.length || 0} of {event.maxAttendees} attendees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                  <h3 className="text-lg font-semibold mb-4">Join Event</h3>
                  
                  {event.status === 'live' && attending && (
                    <Link
                      to={`/virtual-event/${event._id}`}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-center block mb-4 transition-colors"
                    >
                      Join Live Event
                    </Link>
                  )}

                  {event.status === 'upcoming' && !attending && (
                    <button
                      onClick={handleRegister}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold mb-4 transition-colors"
                    >
                      Register for Event
                    </button>
                  )}

                  {event.status === 'upcoming' && attending && (
                    <div className="text-center mb-4">
                      <p className="text-green-600 font-semibold mb-2">✓ You're registered!</p>
                      <p className="text-sm text-gray-600">We'll notify you when the event starts</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 space-y-2">
                    <p>📅 Add to calendar</p>
                    <p>🔔 Set reminder</p>
                    <p>👥 Share with friends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;