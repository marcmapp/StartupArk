import { useState, useEffect } from 'react';
import {
  FiClock, FiCheck, FiX, FiCalendar, FiRefreshCw, FiExternalLink,
  FiVideo, FiXCircle, FiInfo, FiCheckCircle, FiUsers, FiTrendingUp,
  FiAlertCircle, FiArrowRight, FiGrid
} from 'react-icons/fi';
import { getImageUrl } from '../../../../utils/imageUrls';
import { Link, useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const STATUS_CONFIG = {
  pending:   { bg: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: '⏳' },
  confirmed: { bg: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: '✅' },
  completed: { bg: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', icon: '🎯' },
  cancelled: { bg: 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-600', icon: '❌' },
  expired:   { bg: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', icon: '⏰' },
  rejected:  { bg: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', icon: '🚫' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${cfg.bg}`}>
      <span>{cfg.icon}</span>{status}
    </span>
  );
};

const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className="p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300">{icon}</div>
    <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${baseUrl}/startupark/api/bookings?as=user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const d = await r.json();
      setBookings(d.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancelBooking = async (bookingId) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;
    try {
      const r = await fetch(`${baseUrl}/startupark/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ reason })
      });
      if (r.ok) {
        const d = await r.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? (d.booking || d) : b));
      }
    } catch (e) { console.error(e); }
  };

  const markAsCompleted = async (bookingId) => {
    try {
      const r = await fetch(`${baseUrl}/startupark/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
      });
      if (r.ok) {
        const d = await r.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? (d.booking || d) : b));
      }
    } catch (e) { console.error(e); }
  };

  const isMeetingPast = (booking) => {
    try {
      const dt = new Date(`${new Date(booking.date).toISOString().split('T')[0]}T${booking.time}:00`);
      return new Date() > new Date(dt.getTime() + (booking.duration || 60) * 60000);
    } catch { return false; }
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'Invalid Date'; }
  };

  const stats = {
    total:     bookings.length,
    upcoming:  bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
  };

  const tabs = [
    { key: 'all',       label: 'All',       count: stats.total },
    { key: 'pending',   label: 'Pending',   count: stats.pending },
    { key: 'confirmed', label: 'Upcoming',  count: stats.upcoming },
    { key: 'completed', label: 'Completed', count: stats.completed },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const filtered = bookings.filter(b => activeTab === 'all' || b.status === activeTab);

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900 dark:border-white" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your scheduled calls and meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/startupark/usercalender')}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl text-sm font-semibold transition-colors">
            <FiGrid size={16} /> Calendar View
          </button>
          <button onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-zinc-800/60 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700/60 text-sm font-medium transition-colors">
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Meetings" value={stats.total} icon={<FiUsers size={20} />} accent="cyan" />
        <StatCard title="Upcoming" value={stats.upcoming} icon={<FiClock size={20} />} accent="emerald" subtitle="Confirmed calls" />
        <StatCard title="Completed" value={stats.completed} icon={<FiCheckCircle size={20} />} accent="purple" subtitle="Past meetings" />
        <StatCard title="Pending" value={stats.pending} icon={<FiAlertCircle size={20} />} accent="amber" subtitle="Awaiting response" />
      </div>

      {/* Tabs */}
      <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/60 rounded-2xl p-4 mb-6">
        <div className="flex gap-1 bg-gray-100 dark:bg-zinc-700/60 p-1 rounded-xl w-fit overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}>
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'bg-gray-200 dark:bg-zinc-600 text-gray-600 dark:text-gray-400'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/60 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
            <FiCalendar size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {activeTab === 'all' ? 'No meetings scheduled' : `No ${activeTab} meetings`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
            {activeTab === 'all' ? "Browse startups and book calls to get started." : `No ${activeTab} meetings found.`}
          </p>
          {activeTab !== 'all' && (
            <button onClick={() => setActiveTab('all')} className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm font-medium hover:underline">
              View all meetings
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const logoUrl = getImageUrl(booking.startupId?.logo, baseUrl);
            const meetingPast = isMeetingPast(booking);
            return (
              <div key={booking._id}
                className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/60 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt={booking.startupId?.companyName} className="h-14 w-14 rounded-xl object-cover border border-gray-200 dark:border-zinc-700" />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                        <FiCalendar size={20} className="text-zinc-500 dark:text-zinc-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {booking.startupId?.companyName || 'Unknown Startup'}
                      </h3>
                      <StatusBadge status={booking.status} />
                      {meetingPast && booking.status === 'confirmed' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-medium">
                          Past Due
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-700/60 px-2.5 py-1 rounded-lg">
                        <FiCalendar size={12} /> {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-700/60 px-2.5 py-1 rounded-lg">
                        <FiClock size={12} /> {booking.time}
                      </span>
                      <span className="bg-gray-100 dark:bg-zinc-700/60 px-2.5 py-1 rounded-lg text-xs">
                        {booking.duration || 60} min
                      </span>
                    </div>

                    {booking.meetingPurpose && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex gap-2 mb-2">
                        <FiInfo size={14} className="flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500" />
                        {booking.meetingPurpose}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      {booking.meetingLink && booking.status === 'confirmed' && (
                        <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                          <FiVideo size={13} /> Join Meeting
                        </a>
                      )}
                      <Link to={`/startupark/startups/${booking.startupId?._id}`}
                        className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                        <FiExternalLink size={13} /> View Startup
                      </Link>
                    </div>

                    {booking.cancellationReason && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                        <strong>Cancelled:</strong> {booking.cancellationReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {booking.status === 'pending' && (
                      <button onClick={() => cancelBooking(booking._id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
                        <FiXCircle size={14} /> Cancel
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        {meetingPast && (
                          <button onClick={() => markAsCompleted(booking._id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">
                            <FiCheckCircle size={14} /> Mark Done
                          </button>
                        )}
                        <button onClick={() => cancelBooking(booking._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
                          <FiXCircle size={14} /> Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <Link to={`/startupark/startups/${booking.startupId?._id}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">
                        <FiCheck size={14} /> Book Again
                      </Link>
                    )}
                  </div>
                </div>

                {booking.message && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-zinc-700/40 border border-gray-100 dark:border-zinc-700 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                    {booking.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;
