// pages/Product-Specific-Pages/startupark/notifications/NotificationsPage.jsx
// Full notification center — the "View all" destination from the header bell.
// Mirrors FavoritesPage/StartupList's visual language (hero, sticky glass
// controls bar, stats footer) but built around a grouped timeline instead of
// a grid, since notifications are chronological, not a collection to browse.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectArk } from '../projectark/useProjectArk';
import { useSocket } from '../../../../contexts/SocketContext';
import PendingTestimonialsInbox from '../../../../components/PendingTestimonialsInbox';
import { relativeTime } from '../../../../utils/relativeTime';
import 'boxicons';

// ── type taxonomy ────────────────────────────────────────────────────────────
// One entry per Notification.type enum value (backend model) — every type is
// mapped so nothing ever falls back to a blank icon/label.
const TYPE_META = {
  proposal_received:          { category: 'work',     icon: 'briefcase' },
  proposal_accepted:          { category: 'work',     icon: 'check-circle' },
  proposal_rejected:          { category: 'work',     icon: 'x-circle' },
  proposal_shortlisted:       { category: 'work',     icon: 'star' },
  engagement_milestone:       { category: 'work',     icon: 'flag' },
  engagement_completed:       { category: 'work',     icon: 'check-circle' },
  engagement_cancelled:       { category: 'work',     icon: 'x-circle' },
  rating_received:            { category: 'work',     icon: 'star' },
  application_received:       { category: 'work',     icon: 'file' },
  application_status_changed: { category: 'work',     icon: 'file' },
  product_review_requested:   { category: 'work',     icon: 'box' },
  startup_update:             { category: 'updates',  icon: 'news' },
  new_startup_update:         { category: 'updates',  icon: 'news' },
  meeting_outcome_reminder:   { category: 'bookings', icon: 'calendar' },
  booking_rating_requested:   { category: 'bookings', icon: 'calendar-check' },
  booking_rating_received:    { category: 'bookings', icon: 'star' },
  testimonial_elevation_requested: { category: 'social', icon: 'comment-detail' },
  testimonial_elevation_approved:  { category: 'social', icon: 'check-circle' },
  testimonial_elevation_declined:  { category: 'social', icon: 'x-circle' },
  new_follower:                { category: 'social', icon: 'user-plus' },
};
const DEFAULT_META = { category: 'work', icon: 'bell' };

const TABS = [
  { id: 'all',      label: 'All' },
  { id: 'unread',   label: 'Unread' },
  { id: 'work',     label: 'Work' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'updates',  label: 'Updates' },
  { id: 'social',   label: 'Social' },
];

const BUCKET_ORDER = ['Today', 'Yesterday', 'Earlier this week', 'Older'];

function bucketOf(dateStr) {
  const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(dateStr))) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Earlier this week';
  return 'Older';
}

const NotificationCard = ({ n, onOpen, delay }) => {
  const meta = TYPE_META[n.type] || DEFAULT_META;
  return (
    <button
      onClick={() => onOpen(n)}
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-fade-in relative w-full text-left flex items-start gap-3.5 p-4 glass-card
                  hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all
                  ${n.read ? 'opacity-60' : ''}`}
    >
      {!n.read && (
        <span className="absolute top-4 right-4 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-900 dark:bg-white animate-glow-pulse" />
        </span>
      )}
      <div className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 text-zinc-700 dark:text-zinc-200">
        <box-icon name={meta.icon} type="solid" color="currentColor" size="18px"></box-icon>
      </div>
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{n.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">{relativeTime(n.createdAt)}</p>
      </div>
    </button>
  );
};

const Skeleton = () => (
  <div className="space-y-2.5">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-3.5 p-4 glass-card animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-black/[0.06] dark:bg-white/10 flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-1/2 rounded bg-black/[0.06] dark:bg-white/10" />
          <div className="h-2.5 w-2/3 rounded bg-black/[0.06] dark:bg-white/10" />
        </div>
      </div>
    ))}
  </div>
);

const NotificationsPage = () => {
  const { fetchNotifications, markNotificationRead, markAllNotificationsRead } = useProjectArk();
  const socket = useSocket();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(30);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState('all');
  const [inboxRatingId, setInboxRatingId] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async (nextLimit) => {
    const data = await fetchNotifications({ limit: nextLimit });
    setNotifications(data.data || []);
    setUnreadCount(data.unreadCount || 0);
    setTotal(data.pagination?.total ?? (data.data || []).length);
  }, [fetchNotifications]);

  useEffect(() => {
    setLoading(true);
    load(limit).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextLimit = limit + 30;
    await load(nextLimit);
    setLimit(nextLimit);
    setLoadingMore(false);
  };

  // Live updates — same channel the header bell listens on, so a notification
  // that arrives while this page is open shows up without a refresh.
  useEffect(() => {
    if (!socket) return;
    const onNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setTotal((prev) => prev + 1);
    };
    socket.on('projectark:notification', onNotif);
    return () => socket.off('projectark:notification', onNotif);
  }, [socket]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const bookingsPath = (n) =>
    n.data?.audience === 'startup' ? '/startupark/manage-bookings' : '/startupark/my-bookings';

  const handleOpen = (n) => {
    if (!n.read) handleMarkRead(n._id);
    switch (n.type) {
      case 'booking_rating_requested':
        navigate(`${bookingsPath(n)}?highlight=${n.data?.bookingId || ''}`);
        break;
      case 'booking_rating_received':
        navigate(bookingsPath(n));
        break;
      case 'testimonial_elevation_requested':
        setInboxRatingId(n.data?.ratingId || null);
        break;
      case 'testimonial_elevation_approved':
        setToast('Your testimonial is now public.');
        if (n.data?.ratedUser) navigate(`/startupark/startups/${n.data.ratedUser}`);
        break;
      case 'testimonial_elevation_declined':
        setToast('That testimonial will stay private.');
        break;
      case 'product_review_requested':
        if (n.data?.productId) navigate(`/products/${n.data.productId}`);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    if (tab === 'all') return notifications;
    if (tab === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => (TYPE_META[n.type] || DEFAULT_META).category === tab);
  }, [notifications, tab]);

  const grouped = useMemo(() => {
    const buckets = {};
    filtered.forEach((n) => {
      const b = bucketOf(n.createdAt);
      (buckets[b] = buckets[b] || []).push(n);
    });
    return BUCKET_ORDER.filter((b) => buckets[b]?.length).map((b) => ({ label: b, items: buckets[b] }));
  }, [filtered]);

  const todayCount = notifications.filter((n) => bucketOf(n.createdAt) === 'Today').length;
  const weekCount = notifications.filter((n) => ['Today', 'Yesterday', 'Earlier this week'].includes(bucketOf(n.createdAt))).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 glass-inset text-zinc-600 dark:text-zinc-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-900 dark:bg-white animate-glow-pulse" />
          </span>
          Stay In The Loop
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
          Notification Center
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
          {unreadCount > 0
            ? `${unreadCount} thing${unreadCount === 1 ? '' : 's'} waiting for you`
            : "You're all caught up"}
        </p>
      </div>

      {/* Controls */}
      <div className="sticky top-4 z-10 mb-8">
        <div className="glass-card p-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {TABS.find((t) => t.id === tab)?.label}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                {filtered.length} notification{filtered.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex flex-wrap gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      tab === t.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'glass-inset text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="btn-ghost text-xs px-3 py-1.5 whitespace-nowrap">
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <Skeleton />
      ) : grouped.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full glass-inset mb-6 text-zinc-400 dark:text-zinc-500">
            <box-icon name="bell-off" size="32px" color="currentColor"></box-icon>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {tab === 'all' ? "Nothing here yet" : `No ${TABS.find((t) => t.id === tab)?.label.toLowerCase()} notifications`}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-7">
            Proposals, bookings, and updates from across StartupArk will show up here as they happen.
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5 px-1">
                {group.label}
              </p>
              <div className="space-y-2.5">
                {group.items.map((n, i) => (
                  <NotificationCard key={n._id} n={n} onOpen={handleOpen} delay={i * 40} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length < total && (
        <div className="flex justify-center mt-8">
          <button onClick={loadMore} disabled={loadingMore} className="btn-ghost px-5 py-2.5 text-sm disabled:opacity-50">
            {loadingMore ? 'Loading…' : 'Load older notifications'}
          </button>
        </div>
      )}

      {/* Stats footer */}
      {!loading && notifications.length > 0 && (
        <div className="mt-14 pt-8 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: unreadCount, label: 'Unread' },
              { value: todayCount, label: 'Today' },
              { value: weekCount, label: 'This Week' },
              { value: total, label: 'Total' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</div>
                <div className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inboxRatingId !== null && (
        <PendingTestimonialsInbox
          focusRatingId={inboxRatingId}
          onClose={() => setInboxRatingId(null)}
          onResolved={(approved) =>
            setToast(approved ? 'Testimonial approved and published.' : 'Testimonial kept private.')
          }
        />
      )}

      {toast && (
        <div className="glass-card fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100">
          {toast}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
