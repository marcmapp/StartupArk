// components/ChatInterface.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMessageSquare, FiSearch, FiSend, FiImage, FiPaperclip, 
  FiLoader, FiCheck, FiCheckCircle, FiVideo, FiMic,
  FiMoreVertical, FiInfo, FiX, FiPlay, FiPause
} from 'react-icons/fi';
import { IoCheckmarkDone, IoEllipsisHorizontal } from 'react-icons/io5';
import { io } from 'socket.io-client';
import { getImageUrl } from '../../../../utils/imageUrls';

const ChatInterface = () => {
  const { startupId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [startup, setStartup] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetailsCache, setUserDetailsCache] = useState({});
  const [conversationDisplayInfo, setConversationDisplayInfo] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const messagesEndRef = useRef(null);
  const typingIndicatorRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Helper function to get user data from localStorage
  const getUserData = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // Fetch user role from API if not in localStorage
  const fetchUserRole = async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData.smartRole || 'user';
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
    return 'user';
  };

  // Fetch user details by ID
  const fetchUserDetails = async (userId) => {
    try {
      // Check if we already have this user in cache
      if (userDetailsCache[userId]) {
        return userDetailsCache[userId];
      }

      const response = await fetch(`${baseUrl}/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Cache the user details
        setUserDetailsCache(prev => ({
          ...prev,
          [userId]: userData
        }));
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
    return null;
  };

  // Get current user data
  useEffect(() => {
    const initializeUser = async () => {
      const userData = getUserData();
      const currentUserId = userData?.id || userData?._id || localStorage.getItem('userId');
      
      let userRole = userData?.smartRole;
      
      // If role is not in localStorage, fetch it from API
      if (!userRole && currentUserId) {
        userRole = await fetchUserRole(currentUserId);
      }
      
      setCurrentUser({ 
        id: currentUserId, 
        role: userRole || 'user',
        name: userData?.username || userData?.name || 'You',
        avatar: userData?.profileImage
      });
    };

    initializeUser();
  }, [baseUrl]);

  // Socket connection
  useEffect(() => {
    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
      // Emit user online status
      if (currentUser?.id) {
        newSocket.emit('user_online', { userId: currentUser.id });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Listen for online users updates
    newSocket.on('online_users', (users) => {
      console.log('Online users:', users);
      setOnlineUsers(users);
    });

    // Listen for user online/offline events
    newSocket.on('user_online', (userId) => {
      console.log('User online:', userId);
      setOnlineUsers(prev => [...prev, userId]);
    });

    newSocket.on('user_offline', (userId) => {
      console.log('User offline:', userId);
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [baseUrl, currentUser]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`${baseUrl}/smart/api/chat/conversations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
          
          // If startupId is provided in URL, select that conversation
          if (startupId) {
            const conv = data.find(c => c.startupId?._id === startupId || c.startupId === startupId);
            if (conv) {
              setSelectedConversation(conv);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setConversationsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchConversations();
    }
  }, [baseUrl, currentUser, startupId]);

  // Fetch user details for all conversations
  useEffect(() => {
    const fetchAllUserDetails = async () => {
      if (!conversations.length || !currentUser) return;

      const displayInfo = {};
      
      for (const conversation of conversations) {
        // For startup users: Show the user they're chatting with
        if (currentUser.role === 'startup') {
          const otherParticipant = conversation.participants?.find(
            p => p._id !== currentUser.id
          );
          
          let userName = 'Unknown User';
          let userImage = null;
          let userId = null;
          
          if (otherParticipant) {
            // If we only have the ID, fetch user details
            if (typeof otherParticipant === 'string' || Object.keys(otherParticipant).length === 1) {
              userId = typeof otherParticipant === 'string' ? otherParticipant : otherParticipant._id;
              const userDetails = await fetchUserDetails(userId);
              userName = userDetails?.username || userDetails?.name || 'Unknown User';
              userImage = userDetails?.profileImage;
            } else {
              // We have the full user object
              userName = otherParticipant.username || otherParticipant.name || 'Unknown User';
              userImage = otherParticipant.profileImage;
              userId = otherParticipant._id;
            }
          }
          
          displayInfo[conversation._id] = {
            name: userName,
            image: userImage,
            isStartup: false,
            userId: userId
          };
        } else {
          // For regular users: Show the startup they're chatting with
          const startupInfo = conversation.startupId;
          
          let startupName = 'Unknown Startup';
          let startupLogo = null;
          let startupId = null;
          
          if (startupInfo) {
            if (typeof startupInfo === 'object') {
              startupName = startupInfo.formData?.startupName || startupInfo.startupName || 'Unknown Startup';
              startupLogo = startupInfo.formData?.logo || startupInfo.logo;
              startupId = startupInfo._id;
            } else if (typeof startupInfo === 'string') {
              startupName = 'Unknown Startup';
              startupId = startupInfo;
            }
          }
          
          displayInfo[conversation._id] = {
            name: startupName,
            image: startupLogo,
            isStartup: true,
            userId: startupId
          };
        }
      }
      
      setConversationDisplayInfo(displayInfo);
    };

    fetchAllUserDetails();
  }, [conversations, currentUser]);

  // Fetch conversation details when selected
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!selectedConversation || !socket || !currentUser) return;

      try {
        setLoading(true);
        
        // Join conversation room
        socket.emit('join_conversation', selectedConversation._id);

        // Fetch messages
        const messagesRes = await fetch(`${baseUrl}/smart/api/chat/messages/${selectedConversation._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData.messages || []);
        }

        // Get other user info
        const otherParticipant = selectedConversation.participants
          .find(p => p._id !== currentUser.id);

        if (otherParticipant) {
          setOtherUser(otherParticipant);
        }

        // Only fetch startup details if the current user is NOT a startup
        if (currentUser.role !== 'startup' && selectedConversation.startupId) {
          const startupId = selectedConversation.startupId._id || selectedConversation.startupId;
          const startupRes = await fetch(`${baseUrl}/smart/api/smart/startups-by-id/${startupId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (startupRes.ok) {
            const startupData = await startupRes.json();
            setStartup(startupData);
          }
        }

      } catch (error) {
        console.error('Error fetching conversation details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationDetails();

    // Mark messages as read when conversation is selected
    if (selectedConversation) {
      markMessagesAsRead(selectedConversation._id);
    }
  }, [selectedConversation, socket, baseUrl, currentUser]);

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    try {
      const response = await fetch(`${baseUrl}/smart/api/chat/messages/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (response.ok) {
        // Update local state to mark messages as read
        setMessages(prev => prev.map(msg => 
          msg.sender._id !== currentUser.id ? { ...msg, read: true } : msg
        ));
        
        // Update conversations list to reset unread count
        setConversations(prev => prev.map(conv => 
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing events
  useEffect(() => {
    if (!socket || !selectedConversation || !currentUser) return;

    const handleTyping = () => {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing_start', {
          conversationId: selectedConversation._id,
          userId: currentUser.id,
          userName: currentUser.name
        });
      }

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set a new timeout
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing_stop', {
          conversationId: selectedConversation._id,
          userId: currentUser.id
        });
      }, 1000);

      setTypingTimeout(timeout);
    };

    if (newMessage.trim()) {
      handleTyping();
    } else if (isTyping) {
      setIsTyping(false);
      socket.emit('typing_stop', {
        conversationId: selectedConversation._id,
        userId: currentUser.id
      });
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [newMessage, socket, selectedConversation, currentUser]);

  // Socket listeners
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (message.conversationId === selectedConversation?._id) {
          // Check if this is a duplicate of an optimistic message
          const now = new Date();
          const messageTime = new Date(message.timestamp);
          const timeDiff = Math.abs(now - messageTime);
          
          // Look for optimistic messages with the same content from the same sender within the last 5 seconds
          const isDuplicate = messages.some(msg => 
            msg.isOptimistic && 
            msg.content === message.content && 
            msg.sender._id === message.sender._id &&
            timeDiff < 5000 // 5 seconds
          );
          
          if (!isDuplicate) {
            setMessages(prev => [...prev, message]);
          } else {
            // Replace the optimistic message with the real one
            setMessages(prev => prev.map(msg => 
              msg.isOptimistic && 
              msg.content === message.content && 
              msg.sender._id === message.sender._id &&
              timeDiff < 5000
                ? message // Replace with real message
                : msg
            ));
          }

          // If this conversation is active, mark as read
          if (selectedConversation && message.sender._id !== currentUser?.id) {
            socket.emit('message_read', {
              messageId: message._id,
              conversationId: selectedConversation._id,
              readerId: currentUser?.id
            });
          }
        }
      });

      socket.on('user_typing', (data) => {
        if (data.conversationId === selectedConversation?._id) {
          setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
        }
      });

      socket.on('user_stop_typing', (data) => {
        if (data.conversationId === selectedConversation?._id) {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      });

      socket.on('message_delivered', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, delivered: true } : msg
        ));
      });

      socket.on('message_read', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, read: true } : msg
        ));
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('message_delivered');
        socket.off('message_read');
      };
    }
  }, [socket, selectedConversation, messages, currentUser]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const fileType = file.type.split('/')[0];
      return fileType === 'image' || fileType === 'video' || file.type === 'application/pdf';
    });
    
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  // Remove selected file
  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioBlob);
        setAudioUrl(audioUrl);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Microphone access denied');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Play recorded audio
  const playRecordedAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Pause recorded audio
  const pauseRecordedAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  // Send recorded audio
  const sendRecordedAudio = async () => {
    if (!recordedAudio || !socket || !selectedConversation || !currentUser) return;

    try {
      setSending(true);
      
      // Get receiver ID
      let receiverId;
      if (selectedConversation.participants) {
        const otherParticipant = selectedConversation.participants.find(
          p => (typeof p === 'string' ? p !== currentUser.id : p._id !== currentUser.id)
        );
        receiverId = typeof otherParticipant === 'string' ? otherParticipant : otherParticipant?._id;
      }
      
      if (!receiverId) {
        console.error('No receiver found in conversation');
        return;
      }
      
      // Create form data to send the audio file
      const formData = new FormData();
      formData.append('audio', recordedAudio, 'audio-message.webm');
      formData.append('senderId', currentUser.id);
      formData.append('receiverId', receiverId);
      formData.append('startupId', selectedConversation.startupId?._id || selectedConversation.startupId);
      formData.append('conversationId', selectedConversation._id);
      
      // Send audio message to server
      const response = await fetch(`${baseUrl}/smart/api/chat/audio-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const messageData = await response.json();
        // Emit message via socket
        socket.emit('send_message', messageData);
        setRecordedAudio(null);
        setAudioUrl('');
      } else {
        throw new Error('Failed to send audio message');
      }
      
    } catch (error) {
      console.error('Error sending audio message:', error);
      setError('Failed to send audio message');
    } finally {
      setSending(false);
    }
  };

  // Send media files
  const sendMediaFiles = async () => {
    if (mediaFiles.length === 0 || !socket || !selectedConversation || !currentUser) return;

    try {
      setSending(true);
      
      // Get receiver ID
      let receiverId;
      if (selectedConversation.participants) {
        const otherParticipant = selectedConversation.participants.find(
          p => (typeof p === 'string' ? p !== currentUser.id : p._id !== currentUser.id)
        );
        receiverId = typeof otherParticipant === 'string' ? otherParticipant : otherParticipant?._id;
      }
      
      if (!receiverId) {
        console.error('No receiver found in conversation');
        return;
      }
      
      // Send each media file
      for (const file of mediaFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('senderId', currentUser.id);
        formData.append('receiverId', receiverId);
        formData.append('startupId', selectedConversation.startupId?._id || selectedConversation.startupId);
        formData.append('conversationId', selectedConversation._id);
        formData.append('fileType', file.type.split('/')[0]); // 'image', 'video', or 'application'
        
        const response = await fetch(`${baseUrl}/smart/api/chat/media-message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (response.ok) {
          const messageData = await response.json();
          // Emit message via socket
          socket.emit('send_message', messageData);
        } else {
          console.error('Failed to send media file:', file.name);
        }
      }
      
      setMediaFiles([]);
      
    } catch (error) {
      console.error('Error sending media files:', error);
      setError('Failed to send media files');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && mediaFiles.length === 0 && !recordedAudio) || !socket || !selectedConversation || !currentUser) return;
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      setSending(true);
      
      // Get receiver ID - handle both object and string participants
      let receiverId;
      if (selectedConversation.participants) {
        const otherParticipant = selectedConversation.participants.find(
          p => (typeof p === 'string' ? p !== currentUser.id : p._id !== currentUser.id)
        );
        receiverId = typeof otherParticipant === 'string' ? otherParticipant : otherParticipant?._id;
      }
      
      if (!receiverId) {
        console.error('No receiver found in conversation');
        return;
      }
      
      // Send media files first if any
      if (mediaFiles.length > 0) {
        await sendMediaFiles();
      }
      
      // Send audio if recorded
      if (recordedAudio) {
        await sendRecordedAudio();
      }
      
      // Send text message if any
      if (newMessage.trim()) {
        const messageData = {
          content: newMessage.trim(),
          senderId: currentUser.id,
          receiverId: receiverId,
          startupId: selectedConversation.startupId?._id || selectedConversation.startupId,
          conversationId: selectedConversation._id
        };
        
        // Generate a temporary ID for the optimistic message
        const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Get receiver name for optimistic message
        let receiverName = 'Unknown User';
        const otherParticipant = selectedConversation.participants?.find(
          p => (typeof p === 'string' ? p !== currentUser.id : p._id !== currentUser.id)
        );
        
        if (typeof otherParticipant === 'object') {
          receiverName = otherParticipant?.username || otherParticipant?.name || 'Unknown User';
        }
        
        // Optimistically add message with temporary ID
        const optimisticMessage = {
          _id: tempMessageId, // Use temporary ID
          content: newMessage.trim(),
          sender: { 
            _id: currentUser.id,
            name: currentUser.name,
            profileImage: currentUser.avatar
          },
          receiver: {
            _id: receiverId,
            name: receiverName
          },
          timestamp: new Date(),
          read: false,
          delivered: false,
          isOptimistic: true // Flag to identify optimistic messages
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        // Emit message via socket
        socket.emit('send_message', messageData);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      
      // Remove the optimistic message if there was an error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getMessageStatusIcon = (message) => {
    if (message.sender._id !== currentUser?.id) return null;
    
    if (message.read) {
      return <IoCheckmarkDone className="text-blue-500 ml-1" size={16} />;
    } else if (message.delivered) {
      return <IoCheckmarkDone className="text-gray-400 ml-1" size={16} />;
    } else if (!message.isOptimistic) {
      return <FiCheck className="text-gray-400 ml-1" size={14} />;
    }
    
    return <FiLoader className="animate-spin text-gray-400 ml-1" size={14} />;
  };

  const renderMessageContent = (message) => {
    if (message.fileUrl) {
      const fileType = message.fileType || message.fileUrl.split('.').pop();
      
      if (message.fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
        return (
          <div className="mt-2">
            <img 
              src={getImageUrl(message.fileUrl, baseUrl)} 
              alt="Shared content" 
              className="max-w-xs rounded-lg"
            />
            {message.content && <p className="text-sm mt-2">{message.content}</p>}
          </div>
        );
      } else if (message.fileType === 'video' || ['mp4', 'webm', 'mov'].includes(fileType)) {
        return (
          <div className="mt-2">
            <video controls className="max-w-xs rounded-lg">
              <source src={getImageUrl(message.fileUrl, baseUrl)} type={`video/${fileType}`} />
              Your browser does not support the video tag.
            </video>
            {message.content && <p className="text-sm mt-2">{message.content}</p>}
          </div>
        );
      } else if (message.fileType === 'audio' || message.fileType === 'application' || ['mp3', 'wav', 'pdf'].includes(fileType)) {
        return (
          <div className="mt-2">
            <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FiPaperclip className="mr-2" />
              <a 
                href={getImageUrl(message.fileUrl, baseUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {message.fileName || `Download ${fileType.toUpperCase()} file`}
              </a>
            </div>
            {message.content && <p className="text-sm mt-2">{message.content}</p>}
          </div>
        );
      }
    }
    
    return <p className="text-sm">{message.content}</p>;
  };

  const filteredConversations = conversations.filter(conv => {
    const displayInfo = conversationDisplayInfo[conv._id] || { name: 'Unknown' };
    return displayInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex bg-white dark:bg-black overflow-hidden">

      {/* Conversations sidebar */}
      <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-black">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowConversationMenu(!showConversationMenu)}
            >
              <FiMoreVertical className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <FiMessageSquare size={48} className="mb-4" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const displayInfo = conversationDisplayInfo[conversation._id] || { 
                name: 'Unknown', 
                image: null, 
                isStartup: false,
                userId: null
              };
              const lastMessage = conversation.lastMessage;
              const isSelected = selectedConversation?._id === conversation._id;
              const isOnline = displayInfo.userId && isUserOnline(displayInfo.userId);
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`flex items-center p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  } transition-colors`}
                >
                  <div className="flex-shrink-0 mr-4 relative">
                    {displayInfo.image ? (
                      <>
                        <img
                          src={getImageUrl(displayInfo.image, baseUrl)}
                          alt={displayInfo.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </>
                    ) : (
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center relative">
                        <FiMessageSquare className="text-indigo-600 dark:text-indigo-300" size={20} />
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {displayInfo.name}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {lastMessage ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                          {lastMessage.content || (lastMessage.fileUrl ? 'Sent a file' : 'Sent a message')}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
                      )}
                      
                      {conversation.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-white dark:bg-black">
            <div className="flex items-center">
              {(() => {
                const displayInfo = conversationDisplayInfo[selectedConversation._id] || { name: 'Unknown', image: null, isStartup: false, userId: null };
                const isOnline = displayInfo.userId && isUserOnline(displayInfo.userId);
                
                return (
                  <>
                    <div className="relative">
                      {displayInfo.image ? (
                        <img
                          src={getImageUrl(displayInfo.image, baseUrl)}
                          alt={displayInfo.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                          <FiMessageSquare size={20} className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      {isOnline && (
                        <div className="absolute bottom-0 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {displayInfo.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <FiVideo size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <FiMic size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <FiInfo size={20} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-black">
            <div className="max-w-3xl mx-auto space-y-6">
              {Object.keys(groupedMessages).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                        {date}
                      </span>
                    </div>
                    {dateMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender._id === currentUser?.id ? 'justify-end' : 'justify-start'} mb-3`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender._id === currentUser?.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {renderMessageContent(message)}
                          <div className="flex items-center justify-end mt-1">
                            <span
                              className={`text-xs ${
                                message.sender._id === currentUser?.id
                                  ? 'text-indigo-200'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {getMessageStatusIcon(message)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div ref={typingIndicatorRef} className="flex justify-start mb-3">
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Media preview */}
          {(mediaFiles.length > 0 || recordedAudio) && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-100 dark:bg-gray-800">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <FiPaperclip size={20} />
                        </div>
                      )}
                      <button 
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {recordedAudio && (
                    <div className="flex items-center bg-white dark:bg-gray-700 p-2 rounded-lg">
                      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlayingAudio(false)} />
                      {isPlayingAudio ? (
                        <button onClick={pauseRecordedAudio} className="text-red-500 mr-2">
                          <FiPause size={16} />
                        </button>
                      ) : (
                        <button onClick={playRecordedAudio} className="text-green-500 mr-2">
                          <FiPlay size={16} />
                        </button>
                      )}
                      <span className="text-sm">Audio recording</span>
                      <button 
                        onClick={() => {
                          setRecordedAudio(null);
                          setAudioUrl('');
                        }}
                        className="ml-2 text-red-500"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message input */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-black">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center mb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,video/*,.pdf"
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-2"
                >
                  <FiImage size={20} />
                </button>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 mr-3 rounded-lg ${
                    isRecording 
                      ? 'text-red-500 bg-red-100 dark:bg-red-900/20' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <FiMic size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-black dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && mediaFiles.length === 0 && !recordedAudio) || sending}
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
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <FiMessageSquare size={64} className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 dark:text-white">Select a conversation</h2>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;