import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiList, 
  FiColumns, 
  FiGrid, 
  FiSun,
  FiX,
  FiClock,
  FiUser,
  FiInfo,
  FiMapPin,
  FiVideo,
  FiCheck,
  FiXCircle,
  FiRefreshCw,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUpload,
  FiShare2,
  FiSettings,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const localizer = momentLocalizer(moment);

const CalendarWrapper = ({ type }) => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Enhanced event categories with colors
  const eventCategories = {
    meeting: { name: 'Meeting', color: '#3B82F6', bgColor: '#DBEAFE' },
    conference: { name: 'Conference', color: '#8B5CF6', bgColor: '#EDE9FE' },
    workshop: { name: 'Workshop', color: '#10B981', bgColor: '#D1FAE5' },
    deadline: { name: 'Deadline', color: '#EF4444', bgColor: '#FEE2E2' },
    personal: { name: 'Personal', color: '#F59E0B', bgColor: '#FEF3C7' },
    other: { name: 'Other', color: '#6B7280', bgColor: '#F3F4F6' }
  };

  useEffect(() => {
    fetchEvents();
  }, [type, baseUrl]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/startupark/api/bookings/calendar-events/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      const formattedEvents = data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        category: event.category || 'meeting',
        color: eventCategories[event.category]?.color || '#3B82F6'
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events based on search and filters
  const filteredEvents = useCallback(() => {
    return events.filter(event => {
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.extendedProps?.meetingPurpose?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           event.extendedProps?.status === filterStatus;
      
      const matchesCategory = selectedCategories.length === 0 || 
                             selectedCategories.includes(event.category);
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, searchTerm, filterStatus, selectedCategories]);

  const eventStyleGetter = (event) => {
    const category = eventCategories[event.category] || eventCategories.meeting;
    const isPast = moment(event.end).isBefore(moment());
    const isCancelled = event.extendedProps?.status === 'cancelled';
    
    return {
      style: {
        backgroundColor: category.color,
        background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
        borderRadius: '8px',
        opacity: isCancelled ? 0.6 : (isPast ? 0.8 : 1),
        color: 'white',
        border: '0px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        fontSize: '0.75rem',
        padding: '2px 6px',
        cursor: 'pointer',
        fontWeight: '500',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease-in-out',
        borderLeft: `4px solid ${category.color}`
      }
    };
  };

  const handleCompleteMeeting = async (bookingId) => {
    try {
      const response = await fetch(`${baseUrl}/startupark/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchEvents();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to complete meeting:', error);
    }
  };

  const handleCancelMeeting = async (bookingId, cancellationReason) => {
    try {
      const endpoint = type === 'startup' 
        ? `${baseUrl}/startupark/api/bookings/${bookingId}/status`
        : `${baseUrl}/startupark/api/bookings/${bookingId}/cancel`;
      
      const body = type === 'startup' 
        ? { status: 'cancelled', cancellationReason, cancelledBy: 'startup' }
        : { cancellationReason };
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await fetchEvents();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to cancel meeting:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const moveToToday = () => {
    setCurrentDate(new Date());
  };

  const navigate = (action) => {
    let newDate;
    switch (action) {
      case 'PREV':
        newDate = moment(currentDate).subtract(view === Views.MONTH ? 1 : view === Views.WEEK ? 1 : 1, view === Views.MONTH ? 'months' : 'weeks').toDate();
        break;
      case 'NEXT':
        newDate = moment(currentDate).add(view === Views.MONTH ? 1 : view === Views.WEEK ? 1 : 1, view === Views.MONTH ? 'months' : 'weeks').toDate();
        break;
      default:
        newDate = currentDate;
    }
    setCurrentDate(newDate);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳', text: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅', text: 'Confirmed' },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🎯', text: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '❌', text: 'Cancelled' },
      expired: { color: 'bg-red-100 text-red-800 border-red-200', icon: '⏰', text: 'Expired' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🚫', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const CustomToolbar = ({ label }) => {
    return (
      <div className="flex flex-col w-full mb-6">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {label}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {moment(currentDate).format('MMMM YYYY')} • {filteredEvents().length} events
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-48"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Filters
              {(filterStatus !== 'all' || selectedCategories.length > 0) && (
                <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {(filterStatus !== 'all' ? 1 : 0) + selectedCategories.length}
                </span>
              )}
            </button>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchEvents}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="inline-flex rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                <button
                  onClick={() => navigate('PREV')}
                  className="inline-flex items-center px-3 py-2 border-r border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={moveToToday}
                  className="inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-300"
                >
                  <FiSun className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Today</span>
                </button>
                <button
                  onClick={() => navigate('NEXT')}
                  className="inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm animate-slideDown">
            <div className="flex flex-wrap gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(eventCategories).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(key)
                            ? prev.filter(cat => cat !== key)
                            : [...prev, key]
                        );
                      }}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                        selectedCategories.includes(key)
                          ? 'text-white border-transparent'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: selectedCategories.includes(key) ? category.color : undefined
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setSelectedCategories([]);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Toggles */}
        <div className="flex justify-between items-center">
          <div className="inline-flex rounded-lg shadow-sm border border-gray-300 overflow-hidden bg-white">
            {[
              { key: Views.DAY, icon: FiColumns, label: 'Day' },
              { key: Views.WEEK, icon: FiGrid, label: 'Week' },
              { key: Views.MONTH, icon: FiCalendar, label: 'Month' },
              { key: Views.AGENDA, icon: FiList, label: 'Agenda' }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => handleViewChange(key)}
                className={`inline-flex items-center px-4 py-2 border-r border-gray-300 last:border-r-0 text-sm font-medium transition-all duration-200 ${
                  view === key
                    ? 'bg-blue-500 text-white shadow-inner'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FiShare2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
              <FiPlus className="h-4 w-4 mr-2" />
              New Event
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Custom event component for better visual appeal
  const CustomEvent = ({ event }) => {
    const category = eventCategories[event.category] || eventCategories.meeting;
    const isNow = moment().isBetween(event.start, event.end);
    
    return (
      <div className="relative w-full h-full">
        <div className={`p-1 h-full rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
          isNow ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        }`} style={{ borderLeftColor: category.color }}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-xs truncate">
                  {event.title}
                </span>
              </div>
              <div className="text-xs opacity-90 truncate">
                {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[85vh] p-6 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg relative text-black">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      )}

      <Calendar
        localizer={localizer}
        events={filteredEvents()}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={view}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        onSelectEvent={handleEventClick}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent
        }}
        step={30}
        timeslots={2}
        showMultiDayTimes
        selectable
        popup
        defaultDate={new Date()}
        className="flex-1 rounded-xl shadow-inner bg-white p-4 border border-gray-200"
        dayPropGetter={(date) => ({
          className: moment(date).isSame(new Date(), 'day') 
            ? 'bg-blue-50 border-2 border-blue-200' 
            : ''
        })}
      />

      {/* Enhanced Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-3 h-8 rounded-lg"
                      style={{ 
                        backgroundColor: eventCategories[selectedEvent.category]?.color || '#3B82F6' 
                      }}
                    />
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                      {selectedEvent.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedEvent.extendedProps?.status)}
                    <span className="text-sm text-gray-500 capitalize">
                      {selectedEvent.category} • {selectedEvent.extendedProps?.duration}min
                    </span>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Time Section */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Schedule</p>
                  <p className="text-gray-800 font-semibold">
                    {moment(selectedEvent.start).format('dddd, MMMM Do YYYY')}
                  </p>
                  <p className="text-gray-600">
                    {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4">
                {selectedEvent.extendedProps?.meetingPurpose && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FiInfo className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Purpose</p>
                      <p className="text-gray-900">{selectedEvent.extendedProps.meetingPurpose}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.extendedProps?.meetingType && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Meeting Type</p>
                      <p className="text-gray-900 capitalize">{selectedEvent.extendedProps.meetingType}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.extendedProps?.cancellationReason && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FiXCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Cancellation Reason {selectedEvent.extendedProps.cancelledBy && 
                          <span className="text-red-600">(by {selectedEvent.extendedProps.cancelledBy})</span>
                        }
                      </p>
                      <p className="text-gray-900">{selectedEvent.extendedProps.cancellationReason}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.extendedProps?.meetLink && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FiVideo className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Meeting Link</p>
                      <a 
                        href={selectedEvent.extendedProps.meetLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                      >
                        <FiVideo className="h-4 w-4" />
                        Join Video Meeting
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex flex-wrap gap-3">
                {selectedEvent.extendedProps?.status === 'confirmed' && type === 'startup' && (
                  <button
                    onClick={() => handleCompleteMeeting(selectedEvent.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    <FiCheck size={18} />
                    Mark Complete
                  </button>
                )}
                
                {['pending', 'confirmed'].includes(selectedEvent.extendedProps?.status) && (
                  <button
                    onClick={() => {
                      const reason = prompt('Please enter cancellation reason:');
                      if (reason) {
                        handleCancelMeeting(selectedEvent.id, reason);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    <FiXCircle size={18} />
                    Cancel Meeting
                  </button>
                )}

                <button
                  onClick={closeModal}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-all duration-200 font-medium"
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

export default CalendarWrapper;