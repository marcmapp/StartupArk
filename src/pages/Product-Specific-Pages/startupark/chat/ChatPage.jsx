import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiImage, FiPaperclip, FiLoader, FiMessageSquare } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { getImageUrl } from '../../../../utils/imageUrls';

const ChatPage = () => {
  const { startupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [startup, setStartup] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getUserData = useCallback(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }, []);

  const userData = getUserData();
  const currentUserId = userData?.id || userData?._id;
  const currentUserName = userData?.username || userData?.name || 'You';
  const currentUserAvatar = userData?.profileImage;

  useEffect(() => {
    if (!currentUserId || !localStorage.getItem('token')) {
      setError('Please log in to continue');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [currentUserId, navigate]);

  useEffect(() => {
    const newSocket = io(baseUrl, { transports: ['websocket', 'polling'] });
    newSocket.on('connect', () => console.log('Socket connected'));
    newSocket.on('connect_error', (e) => console.error('Socket error:', e));
    setSocket(newSocket);
    return () => newSocket.close();
  }, [baseUrl]);

  useEffect(() => {
    if (!startupId || !currentUserId) return;
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const startupRes = await fetch(`${baseUrl}/startupark/api/profile/startups/${startupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!startupRes.ok) throw new Error('Failed to fetch startup details');
        const startupJson = await startupRes.json();
        const startupObj = startupJson.startup || startupJson;
        setStartup(startupObj);

        const recipientId = startupObj.userId?._id || startupObj.userId;
        const convRes = await fetch(`${baseUrl}/startupark/api/chat/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ recipientId, contextType: 'startup', contextId: startupId })
        });
        if (!convRes.ok) throw new Error('Failed to create conversation');

        const convJson = await convRes.json();
        const convObj = convJson.conversation || convJson;
        setConversation(convObj);

        if (socket) socket.emit('join_conversation', convObj._id);

        const messagesRes = await fetch(`${baseUrl}/startupark/api/chat/messages/${convObj._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!messagesRes.ok) throw new Error('Failed to fetch messages');
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages || []);

        const otherParticipantId = (convObj.participantIds || []).find(id => String(id) !== String(currentUserId));
        if (otherParticipantId) {
          try {
            const userRes = await fetch(`${baseUrl}/api/mappuser/${otherParticipantId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setOtherUser(userRes.ok ? await userRes.json() : { _id: otherParticipantId, username: 'Unknown' });
          } catch {
            setOtherUser({ _id: otherParticipantId, username: 'Unknown' });
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, [startupId, baseUrl, socket, currentUserId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('user_typing', (data) => setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]));
    socket.on('user_stop_typing', (data) => setTypingUsers(prev => prev.filter(u => u.userId !== data.userId)));
    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket || !conversation || !currentUserId) return;
    const receiverId = (conversation.participantIds || []).find(id => String(id) !== String(currentUserId));
    if (!receiverId) return;
    setSending(true);
    const optimistic = {
      _id: Date.now().toString(),
      content: newMessage.trim(),
      sender: { _id: currentUserId, name: currentUserName, profileImage: currentUserAvatar },
      receiver: { _id: receiverId },
      timestamp: new Date(),
      read: false
    };
    setMessages(prev => [...prev, optimistic]);
    socket.emit('send_message', { content: newMessage.trim(), senderId: currentUserId, receiverId, startupId, conversationId: conversation._id });
    setNewMessage('');
    setSending(false);
  };

  const handleTyping = useCallback(() => {
    if (socket && conversation) {
      socket.emit('typing_start', { conversationId: conversation._id, userId: currentUserId, userName: currentUserName });
      setTimeout(() => socket.emit('typing_stop', { conversationId: conversation._id, userId: currentUserId }), 2000);
    }
  }, [socket, conversation, currentUserId, currentUserName]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-zinc-900 p-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 font-medium">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="flex flex-col flex-1">
        {/* Chat header */}
        <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-zinc-700 px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <FiArrowLeft size={20} />
          </button>
          {startup?.logo ? (
            <img src={getImageUrl(startup.logo, baseUrl)} alt={startup.companyName} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
              <FiMessageSquare size={18} className="text-zinc-500 dark:text-zinc-400" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{startup?.companyName || 'Chat'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {typingUsers.length > 0 ? `${typingUsers[0]?.userName} is typing…` : 'Online'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900">
          <div className="max-w-3xl mx-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare size={28} className="text-zinc-500 dark:text-zinc-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message._id} className={`flex ${message.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    message.sender._id === currentUserId
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-br-sm'
                      : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-bl-sm'
                  }`}>
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.sender._id === currentUserId ? 'text-zinc-300 dark:text-zinc-500' : 'text-gray-400 dark:text-zinc-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-700 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><FiImage size={20} /></button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><FiPaperclip size={20} /></button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message…"
              className="flex-1 bg-gray-100 dark:bg-zinc-700 border-none rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {sending ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
