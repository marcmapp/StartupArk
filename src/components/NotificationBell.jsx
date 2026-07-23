// components/NotificationBell.jsx
// ProjectArk notifications: fetches on mount, then stays live via the shared
// Socket.io connection provided by SocketContext (see LayoutWrapper) — no longer
// opens its own socket, so chat + notifications share a single WebSocket.
// Mounted inline inside Header; dropdown position is computed off the
// trigger button's own rect so it tracks correctly regardless of header layout.
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { FiBell } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { useProjectArk } from "../pages/Product-Specific-Pages/startupark/projectark/useProjectArk";
import { useSocket } from "../contexts/SocketContext";
import PendingTestimonialsInbox from "./PendingTestimonialsInbox";

const NotificationBell = ({ user }) => {
  const { fetchNotifications, markNotificationRead, markAllNotificationsRead } = useProjectArk();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ right: 0, top: 0 });
  const [inboxRatingId, setInboxRatingId] = useState(null);
  const [toast, setToast] = useState('');
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const userId = user?.id || user?._id;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications({ limit: 20 });
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    if (userId) loadNotifications();
  }, [userId, loadNotifications]);

  useEffect(() => {
    if (!socket) return;
    // Identify is handled once by SocketProvider; we only attach our listener.
    const onNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    };
    socket.on("projectark:notification", onNotif);
    return () => socket.off("projectark:notification", onNotif);
  }, [socket]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  // Which bookings page a booking notification belongs to. `audience` is set by
  // the server (it knows which side it notified); default to the user page.
  const bookingsPath = (n) =>
    n.data?.audience === 'startup' ? '/startupark/manage-bookings' : '/startupark/my-bookings';

  const handleNotificationClick = (n) => {
    if (!n.read) handleMarkRead(n._id);

    switch (n.type) {
      case 'booking_rating_requested':
        setOpen(false);
        navigate(`${bookingsPath(n)}?highlight=${n.data?.bookingId || ''}`);
        break;
      case 'booking_rating_received':
        setOpen(false);
        navigate(bookingsPath(n));
        break;
      case 'testimonial_elevation_requested':
        setOpen(false);
        setInboxRatingId(n.data?.ratingId || null);
        break;
      case 'testimonial_elevation_approved':
        setOpen(false);
        setToast('Your testimonial is now public.');
        if (n.data?.ratedUser) navigate(`/startupark/startups/${n.data.ratedUser}`);
        break;
      case 'testimonial_elevation_declined':
        setToast('That testimonial will stay private.');
        break;
      case 'product_review_requested':
        setOpen(false);
        if (n.data?.productId) navigate(`/products/${n.data.productId}`);
        break;
      default:
        break;
    }
  };

  // Auto-dismiss the toast so it can't linger over the UI.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!user) return null;

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ right: Math.max(8, window.innerWidth - r.right), top: r.bottom + 8 });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleOpen}
        className="relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full
                  glass-inset transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
        aria-label="Notifications"
      >
        <FiBell className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="glass-card fixed z-50 w-80 max-h-[70vh] overflow-y-auto"
              style={{ right: menuPos.right, top: menuPos.top }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10">
                <span className="font-semibold text-sm">Notifications</span>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <Link
                    to="/startupark/notifications"
                    onClick={() => setOpen(false)}
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-2 space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="px-2 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`glass-inset w-full text-left px-3 py-2.5 transition-colors ${
                        n.read ? "opacity-60" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>,
          document.body
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

      {toast &&
        createPortal(
          <div className="glass-card fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100">
            {toast}
          </div>,
          document.body
        )}
    </>
  );
};

export default NotificationBell;
