import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../../../../services/eventService';
import { track } from '../../../../services/analytics';
import EventReviewsSection from '../../../../components/EventReviewsSection';

const getCurrentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return u?.id || u?._id || localStorage.getItem('userId') || null;
  } catch {
    return localStorage.getItem('userId') || null;
  }
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [starting, setStarting] = useState(false);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const { event: eventData } = await eventService.getEvent(id);
      setEvent(eventData);
      setAttending(!!eventData.isAttending);
      track('event_view', 'event', id);

      if (eventData.status === 'completed') {
        eventService.getRecordings(id).then(r => setRecordings(r.recordings || [])).catch(() => {});
      }
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
      alert(error.response?.data?.error || 'Failed to register for event');
    }
  };

  const handleGoLive = async () => {
    setStarting(true);
    try {
      await eventService.startEvent(id);
      navigate(`/virtual-event/${id}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start event');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-zinc-500 dark:text-zinc-400">Loading...</div>;
  }

  if (!event) {
    return <div className="flex justify-center items-center h-64 text-zinc-500 dark:text-zinc-400">Event not found</div>;
  }

  const isHost = !!currentUserId && String(currentUserId) === String(event.organizerId);

  return (
    <div className="min-h-screen bg-zinc-200 dark:bg-zinc-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="glass-panel !rounded-none border-x-0 border-t-0 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{event.title}</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">{event.startupId?.companyName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                event.status === 'live' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                event.status === 'upcoming' ? 'bg-black/[0.06] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300' :
                event.status === 'cancelled' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                'bg-black/[0.06] dark:bg-white/[0.08] text-zinc-500 dark:text-zinc-400'
              }`}>
                {event.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">About This Event</h2>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{event.description}</p>
                </div>

                <div className="glass-inset rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Event Details</h3>
                  <div className="space-y-3 text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(event.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{event.attendees?.length || 0} of {event.maxAttendees} attendees</span>
                    </div>
                  </div>
                </div>

                {/* Recordings — surfaced once the event has completed and egress finished */}
                {event.status === 'completed' && recordings.length > 0 && (
                  <div className="glass-inset rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Recordings</h3>
                    <div className="space-y-3">
                      {recordings.map(rec => (
                        <video key={rec._id} controls className="w-full rounded-lg" src={rec.url} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="glass-inset rounded-lg p-6 sticky top-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Join Event</h3>

                  {isHost && event.status === 'upcoming' && (
                    <button onClick={handleGoLive} disabled={starting} className="w-full btn-mono py-3 px-4 mb-4">
                      {starting ? 'Starting…' : 'Go Live'}
                    </button>
                  )}

                  {isHost && event.status === 'live' && (
                    <Link
                      to={`/virtual-event/${event._id}`}
                      className="w-full btn-mono py-3 px-4 text-center block mb-4"
                    >
                      Rejoin as Host
                    </Link>
                  )}

                  {!isHost && event.status === 'live' && attending && (
                    <Link
                      to={`/virtual-event/${event._id}`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-semibold text-center block mb-4 transition-colors"
                    >
                      Join Live Event
                    </Link>
                  )}

                  {!isHost && event.status === 'upcoming' && !attending && (
                    <button
                      onClick={handleRegister}
                      className="w-full btn-mono py-3 px-4 mb-4"
                    >
                      Register for Event
                    </button>
                  )}

                  {!isHost && event.status === 'upcoming' && attending && (
                    <div className="text-center mb-4">
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-2">✓ You're registered!</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">We'll notify you when the event starts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <EventReviewsSection eventId={event._id} eventOrganizerId={event.organizerId} />
      </div>
    </div>
  );
};

export default EventDetailPage;
