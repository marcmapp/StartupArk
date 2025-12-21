import React, { useState, useEffect } from 'react';
import { eventService } from '../../../../services/eventService';
import CreateEventModal from './CreateEventModal';
import EventCard from './EventCard';

const StartupEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState(null);

  // Get token function (same as your working model)
  const getAuthToken = () => {
    return localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    loadUserEvents();
  }, []);

  const loadUserEvents = async () => {
    try {
      setError(null);
      
      // Check authentication first
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const data = await eventService.getUserEvents();
      setEvents(data.created || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (error.response?.status === 404) {
        setError('Events service unavailable. Please try again later.');
      } else {
        setError('Failed to load events. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      setError(null);
      
      // Check authentication
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      await eventService.createEvent(eventData);
      setShowCreateModal(false);
      loadUserEvents(); // Reload events after creation
    } catch (error) {
      console.error('Failed to create event:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Only startups can create events. Please complete your startup profile.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.error || 'Invalid event data. Please check all fields.');
      } else {
        setError('Failed to create event. Please try again.');
      }
    }
  };

  const handleStartEvent = async (eventId) => {
    try {
      await eventService.startEvent(eventId);
      loadUserEvents();
    } catch (error) {
      console.error('Failed to start event:', error);
      alert(error.response?.data?.error || 'Failed to start event');
    }
  };

  const handleEndEvent = async (eventId) => {
    try {
      await eventService.endEvent(eventId);
      loadUserEvents();
    } catch (error) {
      console.error('Failed to end event:', error);
      alert(error.response?.data?.error || 'Failed to end event');
    }
  };

  const filteredEvents = events.filter(event => 
    activeTab === 'all' ? true : event.status === activeTab
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Virtual Events</h1>
              <p className="text-gray-600 mt-2">Create and manage virtual events for networking</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['upcoming', 'live', 'completed', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onStartEvent={handleStartEvent}
              onEndEvent={handleEndEvent}
              isOrganizer={true}
            />
          ))}
        </div>

        {filteredEvents.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">Create your first virtual event to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Create Event
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}
    </div>
  );
};

export default StartupEventsPage;