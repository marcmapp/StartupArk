import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiBriefcase, FiShare2, FiCheck, FiVideo } from 'react-icons/fi';
import { formatDateTime } from '../../../../utils/datetime';

const EVENT_TYPE_LABEL = {
  conference: 'Conference',
  networking: 'Networking',
  workshop: 'Workshop',
  webinar: 'Webinar'
};

const STATUS_STYLE = {
  live: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300',
  upcoming: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
  completed: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300',
  cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
};

const formatCountdown = (date) => {
  const diffMs = new Date(date) - Date.now();
  if (diffMs <= 0) return 'Starting soon';
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `Starts in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Starts in ${hours}h`;
  const days = Math.round(hours / 24);
  return `Starts in ${days}d`;
};

const timeAgo = (date) => {
  const mins = Math.round((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const EventCard = ({ event, onRegister, onStartEvent, onEndEvent, isOrganizer }) => {
  const [copied, setCopied] = useState(false);
  const formatDate = (dateString) =>
    formatDateTime(dateString, { weekday: 'long', month: 'long' });

  const attendeeCount = event.attendees?.length || 0;
  const capacityPct = event.maxAttendees ? Math.min((attendeeCount / event.maxAttendees) * 100, 100) : 0;
  const spotsLeft = event.maxAttendees ? Math.max(event.maxAttendees - attendeeCount, 0) : null;
  const isFull = spotsLeft === 0;
  const isLive = event.status === 'live';

  const scheduleLabel =
    event.status === 'upcoming' ? formatCountdown(event.date) :
    event.status === 'live' ? `Started ${timeAgo(event.startedAt || event.date)}` :
    event.status === 'completed' ? `Ended ${timeAgo(event.endedAt || event.date)}` :
    null;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${event.meetingRoom?.joinUrl || `/virtual-event/${event._id}`}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied by the browser; silently ignore.
    }
  };

  return (
    <div
      className={`glass-card overflow-hidden hover:shadow-xl transition-shadow relative ${
        isLive ? 'ring-2 ring-emerald-500/40 dark:ring-emerald-400/30' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[event.status] || STATUS_STYLE.completed}`}>
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {event.status}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300">
              <FiVideo size={11} />
              {EVENT_TYPE_LABEL[event.eventType] || event.eventType}
            </span>
          </div>
          <button
            type="button"
            onClick={handleShare}
            title="Copy event link"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex-shrink-0"
          >
            {copied ? <FiCheck size={16} className="text-emerald-500" /> : <FiShare2 size={16} />}
          </button>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{event.title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 text-sm">{event.description}</p>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-2">
              <FiCalendar size={14} />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
              <FiClock size={13} />
              {event.duration}
            </span>
          </div>

          {event.startupId && (
            <div className="flex items-center text-zinc-500 dark:text-zinc-400">
              <FiBriefcase size={14} className="mr-2" />
              {event.startupId.formData?.startupName || 'Startup'}
            </div>
          )}

          {scheduleLabel && (
            <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{scheduleLabel}</div>
          )}
        </div>

        {/* Capacity */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <FiUsers size={13} />
              {attendeeCount}/{event.maxAttendees} registered
            </span>
            <span className={`text-xs font-medium ${isFull ? 'text-red-500 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
              {isFull ? 'Full' : spotsLeft !== null ? `${spotsLeft} spots left` : ''}
            </span>
          </div>
          <div className="w-full bg-black/[0.06] dark:bg-white/[0.08] rounded-full h-2">
            <div
              className="bg-zinc-900 dark:bg-white h-2 rounded-full transition-all"
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {isOrganizer ? (
            <>
              {event.status === 'upcoming' && (
                <button
                  onClick={() => onStartEvent(event._id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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
                className="flex-1 btn-mono py-2 px-4 text-center"
              >
                Manage
              </Link>
            </>
          ) : (
            <>
              {!event.isAttending && event.status === 'upcoming' && (
                <button
                  onClick={() => onRegister(event._id)}
                  disabled={isFull}
                  className="flex-1 btn-mono py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFull ? 'Event Full' : 'Register'}
                </button>
              )}
              {(event.isAttending || event.status === 'live') && (
                <Link
                  to={`/virtual-event/${event._id}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
                >
                  {event.status === 'live' ? 'Join Now' : 'View Details'}
                </Link>
              )}
              {event.status === 'completed' && (
                <Link
                  to={`/virtual-event/${event._id}`}
                  className="flex-1 btn-ghost py-2 px-4 text-center"
                >
                  View Recap
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
