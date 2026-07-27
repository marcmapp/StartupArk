import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch } from 'react-icons/fi';
import { eventService } from '../../../../services/eventService';
import EventCard from './EventCard';

const TABS = [
  { key: 'discover', label: 'Discover Events' },
  { key: 'attending', label: 'My Events' },
  { key: 'my-events', label: "Events I'm Hosting" }
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

const UserEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState({ created: [], attending: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');

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
      alert(error.response?.data?.error || 'Failed to register for event');
    }
  };

  const baseEventsByTab = useMemo(() => ({
    discover: events,
    attending: userEvents.attending || [],
    'my-events': userEvents.created || []
  }), [events, userEvents]);

  const tabCounts = useMemo(() => ({
    discover: baseEventsByTab.discover.length,
    attending: baseEventsByTab.attending.length,
    'my-events': baseEventsByTab['my-events'].length
  }), [baseEventsByTab]);

  const liveNowCount = useMemo(
    () => baseEventsByTab.discover.filter(e => e.status === 'live').length,
    [baseEventsByTab]
  );

  const eventsToShow = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseEventsByTab[activeTab]
      .filter(event => typeFilter === 'all' ? true : event.eventType === typeFilter)
      .filter(event => !q || event.title?.toLowerCase().includes(q) || event.description?.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [baseEventsByTab, activeTab, typeFilter, query]);

  const emptyStateCopy = {
    discover: 'Check back later for new events.',
    attending: "You haven't registered for any events yet.",
    'my-events': "You aren't hosting any events yet."
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl lg:max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Virtual Events</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">Discover and join networking events across the community</p>
        </div>

        {!loading && liveNowCount > 0 && (
          <div className="mb-6 glass-card px-4 py-3 flex items-center gap-2.5 border-emerald-500/30 dark:border-emerald-400/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {liveNowCount} event{liveNowCount > 1 ? 's are' : ' is'} live right now
            </span>
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
            {eventsToShow.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={handleRegister}
                isOrganizer={false}
              />
            ))}
          </div>
        )}

        {!loading && eventsToShow.length === 0 && (
          <div className="text-center py-12 glass-card">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              {baseEventsByTab[activeTab].length > 0 ? 'No events match your filters' : 'No events found'}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              {baseEventsByTab[activeTab].length > 0 ? 'Try a different type or search term.' : emptyStateCopy[activeTab]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEventsPage;
