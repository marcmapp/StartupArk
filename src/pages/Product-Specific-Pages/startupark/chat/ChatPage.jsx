// components/ChatPage.jsx
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

  // Helper function to get user data from localStorage
  const getUserData = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }, []);

  // Get current user data - FIXED: Check all possible ID fields
  const userData = getUserData();
  const currentUserId = userData?.id || userData?._id || localStorage.getItem('userId');
  const currentUserName = userData?.username || userData?.name || 'You';
  const currentUserAvatar = userData?.profileImage;

  useEffect(() => {
    console.log('LocalStorage userId:', localStorage.getItem('userId'));
    console.log('LocalStorage user:', localStorage.getItem('user'));
    console.log('Current user data:', userData);
    console.log('Current user ID:', currentUserId);
  }, [userData, currentUserId]);

  useEffect(() => {
    // Check if user is properly logged in
    if (!currentUserId || !localStorage.getItem('token') || currentUserId === 'undefined' || currentUserId === 'null') {
      setError('Please log in to continue');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
  }, [currentUserId, navigate]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [baseUrl]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch startup details
        const startupRes = await fetch(`${baseUrl}/startupark/api/startupark/startups-by-id/${startupId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!startupRes.ok) {
          throw new Error('Failed to fetch startup details');
        }

        const startupData = await startupRes.json();
        setStartup(startupData);

        // Get or create conversation
        const convRes = await fetch(`${baseUrl}/startupark/api/chat/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ startupId })
        });

        if (!convRes.ok) {
          throw new Error('Failed to create conversation');
        }

        const convData = await convRes.json();
        setConversation(convData);

        // Join conversation room
        if (socket) {
          socket.emit('join_conversation', convData._id);
          console.log('Joined conversation:', convData._id);
        }

        // Fetch messages
        const messagesRes = await fetch(`${baseUrl}/startupark/api/chat/messages/${convData._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!messagesRes.ok) {
          throw new Error('Failed to fetch messages');
        }

        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages || []);

        // Get other user info
        const otherParticipantId = convData.participants?.find(id => id !== currentUserId);

        if (otherParticipantId) {
          try {
            const userRes = await fetch(`${baseUrl}/api/mappuser/${otherParticipantId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (userRes.ok) {
              const userData = await userRes.json();
              setOtherUser(userData);
            } else {
              console.warn('Failed to fetch user details, using fallback');
              setOtherUser({
                _id: otherParticipantId,
                username: 'Unknown User',
                name: 'Unknown User'
              });
            }
          } catch (error) {
            console.error('Error fetching user:', error);
            setOtherUser({
              _id: otherParticipantId,
              username: 'Unknown User',
              name: 'Unknown User'
            });
          }
        }

      } catch (error) {
        console.error('Error fetching conversation:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (startupId && currentUserId) {
      fetchConversation();
    }
  }, [startupId, baseUrl, socket, currentUserId]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('receive_message', (message) => {
        console.log('Received new message:', message);
        setMessages(prev => [...prev, message]);
      });

      // Listen for message errors
      socket.on('message_error', (error) => {
        console.error('Message error:', error);
        setError(error.error);
        setSending(false);
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      });

      socket.on('user_stop_typing', (data) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      return () => {
        socket.off('receive_message');
        socket.off('message_error');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      };
    }
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 const handleSendMessage = async () => {
    // Check if user ID is valid
    if (!currentUserId || currentUserId === 'undefined' || currentUserId === 'null') {
      console.error('Invalid user ID:', currentUserId);
      setError('Please log in again');
      return;
    }

    if (!newMessage.trim() || !socket || !conversation) {
      console.log('Cannot send message - missing requirements');
      return;
    }

    // Get receiver ID from conversation participants
    const receiverId = conversation.participants?.find(id => id !== currentUserId);
    
    if (!receiverId) {
      console.error('No receiver found in conversation');
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      const messageData = {
        content: newMessage.trim(),
        senderId: currentUserId,
        receiverId: receiverId,
        startupId,
        conversationId: conversation._id
      };

      console.log('Sending message:', messageData);
      
      // Emit message via socket
      socket.emit('send_message', messageData);
      
      // Optimistically add message to UI
      const optimisticMessage = {
        _id: Date.now().toString(),
        content: newMessage.trim(),
        sender: { 
          _id: currentUserId,
          name: currentUserName,
          profileImage: currentUserAvatar
        },
        receiver: {
          _id: receiverId,
          name: otherUser?.name || otherUser?.username || 'Unknown User'
        },
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      setSending(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setSending(false);
    }
  };


  const handleTyping = useCallback(() => {
    if (socket && conversation) {
      socket.emit('typing_start', {
        conversationId: conversation._id,
        userId: currentUserId,
        userName: currentUserName
      });

      // Auto stop typing after 2 seconds
      setTimeout(() => {
        handleStopTyping();
      }, 2000);
    }
  }, [socket, conversation, currentUserId, currentUserName]);

  const handleStopTyping = useCallback(() => {
    if (socket && conversation) {
      socket.emit('typing_stop', {
        conversationId: conversation._id,
        userId: currentUserId
      });
    }
  }, [socket, conversation, currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col flex-1">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft size={20} />
          </button>
          {startup?.logo ? (
            <img
              src={getImageUrl(startup.logo, baseUrl)}
              alt={startup.startupName}
              className="w-10 h-10 rounded-lg object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center mr-3">
              <FiMessageSquare size={20} className="text-gray-500" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">
              {startup?.startupName || 'Unknown Startup'}
            </h2>
            <p className="text-sm text-gray-500">
              {typingUsers.length > 0
                ? `${typingUsers.map(u => u.userName).join(', ')} is typing...`
                : 'Online'
              }
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender._id === currentUserId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender._id === currentUserId
                          ? 'text-indigo-200'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message input */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center">
            <button className="p-2 text-gray-500 hover:text-gray-700 mr-2">
              <FiImage size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 mr-3">
              <FiPaperclip size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="ml-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {sending ? (
                <FiLoader className="animate-spin" size={20} />
              ) : (
                <FiSend size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;