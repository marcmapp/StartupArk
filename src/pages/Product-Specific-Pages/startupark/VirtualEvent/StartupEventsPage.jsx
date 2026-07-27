import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiCalendar, FiRadio, FiClock, FiUsers } from 'react-icons/fi';
import { eventService } from '../../../../services/eventService';
import CreateEventModal from './CreateEventModal';
import EventCard from './EventCard';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' }
];

const TYPE_FILTERS = [
  { key: 'all', label: 'All types' },
  { key: 'conference', label: 'Conference' },
  { key: 'networking', label: 'Networking' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'webinar', label: 'Webinar' }
];

const EventCardSkeleton = () => (
  <div className="glass-card p-6 space-y-4 animate-pulse">
    <div className="flex justify-between">
      <div className="h-5 w-20 rounded-full bg-black/[0.06] dark:bg-zinc-800" />
      <div className="h-5 w-5 rounded-full bg-black/[0.06] dark:bg-zinc-800" />
    </div>
    <div className="h-5 w-3/4 rounded bg-black/[0.06] dark:bg-zinc-800" />
    <div className="h-3 w-full rounded bg-black/[0.06] dark:bg-zinc-800" />
    <div className="h-3 w-2/3 rounded bg-black/[0.06] dark:bg-zinc-800" />
    <div className="h-2 w-full rounded-full bg-black/[0.06] dark:bg-zinc-800" />
    <div className="h-9 w-full rounded-lg bg-black/[0.06] dark:bg-zinc-800" />
  </div>
);

const StatTile = ({ icon, label, value }) => (
  <div className="glass-card px-5 py-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] flex items-center justify-center text-zinc-600 dark:text-zinc-300 flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{label}</p>
    </div>
  </div>
);

const StartupEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('create') === 'true');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);

  // Deep link from the Calendar page's "Create Event" CTA (Tier 3 C#5) —
  // open the create flow immediately, then drop the param so it doesn't
  // reopen on a later refresh/back-navigation.
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      await eventService.createEvent(eventData);
      setShowCreateModal(false);
      loadUserEvents();
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

  const tabCounts = useMemo(() => ({
    upcoming: events.filter(e => e.status === 'upcoming').length,
    live: events.filter(e => e.status === 'live').length,
    completed: events.filter(e => e.status === 'completed').length,
    all: events.length
  }), [events]);

  const stats = useMemo(() => ({
    total: events.length,
    live: tabCounts.live,
    upcoming: tabCounts.upcoming,
    registrations: events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0)
  }), [events, tabCounts]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter(event => activeTab === 'all' ? true : event.status === activeTab)
      .filter(event => typeFilter === 'all' ? true : event.eventType === typeFilter)
      .filter(event => !q || event.title?.toLowerCase().includes(q) || event.description?.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, activeTab, typeFilter, query]);

  const emptyStateCopy = {
    upcoming: "You don't have any upcoming events. Schedule one to start filling seats.",
    live: 'Nothing is live right now. Start an upcoming event to go live.',
    completed: 'Completed events will show up here once they wrap.',
    all: 'Create your first virtual event to get started.'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl lg:max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Virtual Events</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">Create and manage virtual events for networking</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-mono px-6 py-3"
            >
              <FiPlus size={18} />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile icon={<FiCalendar size={18} />} label="Total events" value={stats.total} />
            <StatTile icon={<FiRadio size={18} />} label="Live now" value={stats.live} />
            <StatTile icon={<FiClock size={18} />} label="Upcoming" value={stats.upcoming} />
            <StatTile icon={<FiUsers size={18} />} label="Total registrations" value={stats.registrations} />
          </div>
        )}

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

        {/* Tabs + Filters */}
        <div className="glass-card mb-6 p-3 flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-white/20 dark:bg-black/10'
                    : 'bg-black/[0.06] dark:bg-white/[0.08]'
                }`}>
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events..."
              className="input-mono pl-9 py-2 text-sm"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-mono appearance-none py-2 text-sm w-auto"
          >
            {TYPE_FILTERS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
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
        )}

        {!loading && filteredEvents.length === 0 && !error && (
          <div className="text-center py-12 glass-card">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              {events.length > 0 ? 'No events match your filters' : 'No events found'}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {events.length > 0 ? 'Try a different tab, type, or search term.' : emptyStateCopy[activeTab]}
            </p>
            {events.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-mono px-6 py-2 mx-auto"
              >
                Create Event
              </button>
            )}
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
