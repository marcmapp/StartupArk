// contexts/SocketContext.jsx
// A single shared Socket.io connection for the whole authenticated layout.
// Both ChatInterface and NotificationBell used to open their own io() connection
// (two WebSockets per page); they now consume this one via useSocket().
// Chat events (message/presence/typing) and notification events
// (projectark:notification / chat:notify) use distinct names, so one socket
// carries both without cross-firing.
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ user, children }) {
  const [socket, setSocket] = useState(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const userId = user?.id || user?._id;

  // One connection for the lifetime of the layout.
  useEffect(() => {
    const s = io(baseUrl, { transports: ['websocket', 'polling'] });
    setSocket(s);
    return () => s.close();
  }, [baseUrl]);

  // Identify (join personal room + presence) once the user is known, and
  // re-identify on every reconnect so realtime delivery keeps working.
  useEffect(() => {
    if (!socket || !userId) return;
    const identify = () => {
      socket.emit('identify', userId);
      socket.emit('user_online', { userId });
    };
    if (socket.connected) identify();
    socket.on('connect', identify);
    return () => socket.off('connect', identify);
  }, [socket, userId]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
