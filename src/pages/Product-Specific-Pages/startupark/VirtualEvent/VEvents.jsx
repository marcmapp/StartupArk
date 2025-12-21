// StudentEventsPage.jsx
import React, { useState } from 'react';

const StudentEventsPage = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data for events
  const [events, setEvents] = useState({
    registered: [
      {
        id: 1,
        title: 'Tech Innovation Summit 2024',
        startup: 'TechGenius Inc',
        date: '2024-02-15',
        time: '14:00',
        duration: '2 hours',
        type: 'conference',
        description: 'Join us for an exciting discussion about the future of technology and innovation. Learn from industry leaders and network with like-minded individuals.',
        attendees: 45,
        maxAttendees: 100,
        status: 'upcoming',
        joinLink: 'https://meet.techgenius.com/summit-2024',
        registered: true,
        category: 'technology',
        speakers: ['John Doe - CEO TechGenius', 'Jane Smith - CTO InnovateLab'],
        requirements: 'None',
        recordingAvailable: false
      },
      {
        id: 2,
        title: 'Startup Networking Mixer',
        startup: 'StartupHub',
        date: '2024-02-20',
        time: '18:00',
        duration: '3 hours',
        type: 'networking',
        description: 'Connect with fellow entrepreneurs and investors in a casual setting. Perfect for students looking to enter the startup ecosystem.',
        attendees: 23,
        maxAttendees: 50,
        status: 'upcoming',
        joinLink: 'https://network.starthub.com/mixer-feb',
        registered: true,
        category: 'networking',
        speakers: ['Alex Johnson - Venture Partner'],
        requirements: 'Camera recommended',
        recordingAvailable: true
      }
    ],
    discover: [
      {
        id: 3,
        title: 'AI & Machine Learning Workshop',
        startup: 'AI Innovations',
        date: '2024-02-25',
        time: '10:00',
        duration: '4 hours',
        type: 'workshop',
        description: 'Hands-on workshop on AI and ML fundamentals. Perfect for beginners and intermediate learners.',
        attendees: 78,
        maxAttendees: 100,
        status: 'upcoming',
        joinLink: '',
        registered: false,
        category: 'technology',
        speakers: ['Dr. Sarah Chen - AI Researcher'],
        requirements: 'Basic Python knowledge',
        recordingAvailable: true
      },
      {
        id: 4,
        title: 'Digital Marketing Masterclass',
        startup: 'GrowthHackers',
        date: '2024-03-01',
        time: '16:00',
        duration: '2 hours',
        type: 'webinar',
        description: 'Learn the latest digital marketing strategies and tools to boost your career.',
        attendees: 120,
        maxAttendees: 200,
        status: 'upcoming',
        joinLink: '',
        registered: false,
        category: 'marketing',
        speakers: ['Mike Roberts - Marketing Director'],
        requirements: 'None',
        recordingAvailable: true
      },
      {
        id: 5,
        title: 'Blockchain Fundamentals',
        startup: 'CryptoFuture',
        date: '2024-02-18',
        time: '15:00',
        duration: '3 hours',
        type: 'conference',
        description: 'Understand blockchain technology and its applications in various industries.',
        attendees: 89,
        maxAttendees: 150,
        status: 'upcoming',
        joinLink: '',
        registered: false,
        category: 'technology',
        speakers: ['David Kim - Blockchain Expert'],
        requirements: 'None',
        recordingAvailable: false
      }
    ],
    past: [
      {
        id: 6,
        title: 'Entrepreneurship 101',
        startup: 'StartupSchool',
        date: '2024-01-15',
        time: '14:00',
        duration: '2 hours',
        type: 'webinar',
        description: 'Learn the basics of starting your own business from successful entrepreneurs.',
        attendees: 95,
        maxAttendees: 100,
        status: 'past',
        joinLink: '',
        registered: true,
        category: 'business',
        speakers: ['Lisa Wang - Serial Entrepreneur'],
        requirements: 'None',
        recordingAvailable: true,
        recordingLink: 'https://recordings.startschool.com/entrepreneurship-101'
      }
    ]
  });

  const handleRegister = (eventId) => {
    const eventToRegister = events.discover.find(event => event.id === eventId);
    if (eventToRegister) {
      setEvents(prev => ({
        ...prev,
        discover: prev.discover.filter(event => event.id !== eventId),
        registered: [...prev.registered, { ...eventToRegister, registered: true }]
      }));
    }
  };

  const handleUnregister = (eventId) => {
    const eventToUnregister = events.registered.find(event => event.id === eventId);
    if (eventToUnregister) {
      setEvents(prev => ({
        ...prev,
        registered: prev.registered.filter(event => event.id !== eventId),
        discover: [...prev.discover, { ...eventToUnregister, registered: false }]
      }));
    }
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const filteredDiscoverEvents = events.discover.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.startup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (event) => {
    if (event.status === 'past') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">Completed</span>;
    }
    if (event.registered) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Registered</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Open</span>;
  };

  const getTypeBadge = (type) => {
    const styles = {
      conference: 'bg-blue-100 text-blue-800',
      networking: 'bg-green-100 text-green-800',
      workshop: 'bg-purple-100 text-purple-800',
      webinar: 'bg-orange-100 text-orange-800'
    };
    return `px-2 py-1 text-xs font-medium rounded ${styles[type] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 -m-6 p-6 min-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Virtual Events</h1>
              <p className="text-gray-600 mt-2">Discover and join exciting virtual events from innovative startups</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registered Events</p>
                <p className="text-2xl font-semibold text-gray-900">{events.registered.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {events.registered.filter(e => e.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Events</p>
                <p className="text-2xl font-semibold text-gray-900">{events.discover.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours This Month</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <nav className="flex -mb-px flex-1">
                {[
                  { key: 'discover', label: 'Discover Events', count: events.discover.length },
                  { key: 'registered', label: 'My Events', count: events.registered.length },
                  { key: 'past', label: 'Past Events', count: events.past.length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
              
              {activeTab === 'discover' && (
                <div className="px-6 py-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="conference">Conference</option>
                    <option value="networking">Networking</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'discover' ? filteredDiscoverEvents : 
            activeTab === 'registered' ? events.registered : 
            events.past).map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={getTypeBadge(event.type)}>
                      {event.type}
                    </span>
                    {getStatusBadge(event)}
                  </div>
                  <span className="text-sm text-gray-500">{event.duration}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                    onClick={() => openEventDetails(event)}>
                  {event.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm">{event.startup}</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {event.time}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {event.attendees}/{event.maxAttendees} attendees
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEventDetails(event)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                  >
                    View Details
                  </button>
                  
                  {activeTab === 'discover' && !event.registered && (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                    >
                      Register
                    </button>
                  )}
                  
                  {activeTab === 'registered' && event.status === 'upcoming' && (
                    <button
                      onClick={() => window.open(event.joinLink, '_blank')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                    >
                      Join Now
                    </button>
                  )}
                  
                  {activeTab === 'registered' && event.status === 'upcoming' && (
                    <button
                      onClick={() => handleUnregister(event.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                    >
                      Unregister
                    </button>
                  )}
                  
                  {activeTab === 'past' && event.recordingAvailable && (
                    <button
                      onClick={() => window.open(event.recordingLink, '_blank')}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                    >
                      Watch Recording
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(activeTab === 'discover' && filteredDiscoverEvents.length === 0) ||
         (activeTab === 'registered' && events.registered.length === 0) ||
         (activeTab === 'past' && events.past.length === 0) ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'discover' ? 'No events found' :
               activeTab === 'registered' ? 'No registered events' : 'No past events'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'discover' ? 'Try adjusting your search or filters' :
               activeTab === 'registered' ? 'Register for events to see them here' : 'Your attended events will appear here'}
            </p>
            {activeTab === 'registered' && (
              <button
                onClick={() => setActiveTab('discover')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Discover Events
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <button
                  onClick={closeEventModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedEvent.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedEvent.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedEvent.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hosted by:</span>
                      <span className="font-medium">{selectedEvent.startup}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Event Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendees:</span>
                      <span className="font-medium">{selectedEvent.attendees}/{selectedEvent.maxAttendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requirements:</span>
                      <span className="font-medium">{selectedEvent.requirements}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recording:</span>
                      <span className="font-medium">
                        {selectedEvent.recordingAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Speakers</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedEvent.speakers.map((speaker, index) => (
                      <li key={index}>{speaker}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-3">
                {selectedEvent.registered && selectedEvent.status === 'upcoming' && selectedEvent.joinLink && (
                  <button
                    onClick={() => window.open(selectedEvent.joinLink, '_blank')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Join Event</span>
                  </button>
                )}
                
                {!selectedEvent.registered && selectedEvent.status === 'upcoming' && (
                  <button
                    onClick={() => {
                      handleRegister(selectedEvent.id);
                      closeEventModal();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Register for Event
                  </button>
                )}

                {selectedEvent.status === 'past' && selectedEvent.recordingAvailable && (
                  <button
                    onClick={() => window.open(selectedEvent.recordingLink, '_blank')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    <span>Watch Recording</span>
                  </button>
                )}

                <button
                  onClick={closeEventModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEventsPage;