import React, { useState, useEffect } from 'react';
import { eventService } from '../../../../services/eventService';
import EventCard from './EventCard';

const UserEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState({ created: [], attending: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const [allEvents, userEventsData] = await Promise.all([
        eventService.getEvents(),
        eventService.getUserEvents()
      ]);
      setEvents(allEvents.events || []);
      setUserEvents(userEventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId);
      loadEvents(); // Reload to update registration status
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Failed to register for event');
    }
  };

  const getEventsToShow = () => {
    switch (activeTab) {
      case 'attending':
        return userEvents.attending || [];
      case 'my-events':
        return userEvents.created || [];
      default:
        return events;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Virtual Events</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['discover', 'attending', 'my-events'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'discover' ? 'Discover Events' : 
                   tab === 'attending' ? 'My Events' : 'Events I\'m Hosting'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getEventsToShow().map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRegister={handleRegister}
              isOrganizer={false}
            />
          ))}
        </div>

        {getEventsToShow().length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">
              {activeTab === 'discover' 
                ? 'Check back later for new events.' 
                : 'You are not registered for any events yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEventsPage;