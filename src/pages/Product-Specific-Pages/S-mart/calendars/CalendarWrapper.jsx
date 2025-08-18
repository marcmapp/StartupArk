import React, { useState, useEffect } from 'react';
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
  FiMapPin
} from 'react-icons/fi';

const localizer = momentLocalizer(moment);

const CalendarWrapper = ({ type }) => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/bookings/calendar-events/${type}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        const formattedEvents = data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, [type, baseUrl]);

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color || '#3B82F6';
    return {
      style: {
        backgroundColor,
        borderRadius: '0.25rem',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        fontSize: '0.875rem',
        padding: '0.125rem 0.25rem',
        cursor: 'pointer'
      }
    };
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

  const CustomToolbar = ({ label }) => {
    return (
      <div className="flex flex-col w-full mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{label}</h2>
          <div className="flex items-center space-x-2">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => navigate('PREV')}
                className="inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={moveToToday}
                className="inline-flex items-center px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <FiSun className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Today</span>
              </button>
              <button
                onClick={() => navigate('NEXT')}
                className="inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handleViewChange(Views.DAY)}
              className={`inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${view === Views.DAY ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            >
              <FiColumns className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Day</span>
            </button>
            <button
              onClick={() => handleViewChange(Views.WEEK)}
              className={`inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${view === Views.WEEK ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            >
              <FiGrid className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Week</span>
            </button>
            <button
              onClick={() => handleViewChange(Views.MONTH)}
              className={`inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${view === Views.MONTH ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            >
              <FiCalendar className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Month</span>
            </button>
            <button
              onClick={() => handleViewChange(Views.AGENDA)}
              className={`inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${view === Views.AGENDA ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            >
              <FiList className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Agenda</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[80vh] p-4 flex flex-col bg-gray-50 rounded-lg shadow-sm relative">
      <Calendar
        localizer={localizer}
        events={events}
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
        }}
        step={60}
        timeslots={1}
        showMultiDayTimes
        selectable
        popup
        defaultDate={new Date()}
        className="flex-1 bg-white rounded-lg shadow"
      />

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-800">{selectedEvent.title}</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <FiClock className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="text-gray-800">
                      {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm a')} - 
                      {moment(selectedEvent.end).format('h:mm a')}
                    </p>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="flex items-start">
                    <FiInfo className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-800">{selectedEvent.description}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-start">
                    <FiMapPin className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-800">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.organizer && (
                  <div className="flex items-start">
                    <FiUser className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Organizer</p>
                      <p className="text-gray-800">{selectedEvent.organizer}</p>
                    </div>
                  </div>
                )}

                {/* Add more event details as needed */}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                {selectedEvent.actionUrl && (
                  <a
                    href={selectedEvent.actionUrl}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWrapper;