// components/NotificationBell.jsx
// ProjectArk notifications: fetches on mount, then stays live via the shared
// Socket.io connection provided by SocketContext (see LayoutWrapper) — no longer
// opens its own socket, so chat + notifications share a single WebSocket.
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FiBell } from "react-icons/fi";
import { useProjectArk } from "../pages/Product-Specific-Pages/startupark/projectark/useProjectArk";
import { useSocket } from "../contexts/SocketContext";

const NotificationBell = ({ user }) => {
  const { fetchNotifications, markNotificationRead, markAllNotificationsRead } = useProjectArk();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
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

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 right-16 lg:right-20 z-50 flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 p-2 rounded-full shadow-lg
                  bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-300
                  transition-all duration-300 ease-in-out transform hover:scale-105"
        aria-label="Notifications"
      >
        <FiBell className="h-5 w-5 lg:h-6 lg:w-6 text-black dark:text-white" />
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
            <div className="glass-card fixed top-16 right-4 lg:right-20 z-50 w-80 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
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
                      onClick={() => !n.read && handleMarkRead(n._id)}
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
    </>
  );
};

export default NotificationBell;
