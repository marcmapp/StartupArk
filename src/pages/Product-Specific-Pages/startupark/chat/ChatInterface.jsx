// components/ChatInterface.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMessageSquare, FiSearch, FiSend, FiImage, FiPaperclip,
  FiLoader, FiCheck, FiCheckCircle, FiMic,
  FiMoreVertical, FiInfo, FiX, FiPlay, FiPause, FiChevronLeft
} from 'react-icons/fi';
import { IoCheckmarkDone, IoEllipsisHorizontal } from 'react-icons/io5';
import { getImageUrl } from '../../../../utils/imageUrls';
import { useSocket } from '../../../../contexts/SocketContext';

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
  const socket = useSocket(); // shared connection from SocketContext (see LayoutWrapper)
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

  // Backend stores participants as `participantIds` and message author as `senderId`
  // (populated to {_id, username, profilePicture}). Normalize both so the rest of
  // this component can rely on `message.sender._id` and `message.timestamp`.
  const getParticipantIds = (conv) => conv?.participantIds || conv?.participants || [];
  const otherParticipantId = (conv, selfId) => {
    const list = getParticipantIds(conv);
    const other = list.find(p => String(typeof p === 'object' ? p?._id : p) !== String(selfId));
    return other ? (typeof other === 'object' ? other._id : other) : null;
  };
  const normalizeMsg = (m) => {
    if (!m) return m;
    const s = m.sender || m.senderId;
    const sender = s && typeof s === 'object' ? s : { _id: s };
    return { ...m, sender, timestamp: m.timestamp || m.createdAt || new Date() };
  };

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
      const response = await fetch(`${baseUrl}/api/mappuser/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData.startuparkRole || 'user';
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

      const response = await fetch(`${baseUrl}/api/mappuser/${userId}`, {
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
      
      let userRole = userData?.startuparkRole;
      
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

  // Presence listeners on the shared socket. Identify/user_online is emitted once
  // by SocketProvider; here we only track who's online for the presence dots.
  useEffect(() => {
    if (!socket) return;
    const onOnlineUsers = (users) => setOnlineUsers(users);
    const onUserOnline = (userId) =>
      setOnlineUsers(prev => (prev.includes(userId) ? prev : [...prev, userId]));
    const onUserOffline = (userId) =>
      setOnlineUsers(prev => prev.filter(id => id !== userId));

    socket.on('online_users', onOnlineUsers);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);

    return () => {
      socket.off('online_users', onOnlineUsers);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
    };
  }, [socket]);

  // Join the selected conversation room, and re-join on reconnect so realtime
  // delivery keeps working after a socket drop.
  useEffect(() => {
    if (!socket || !selectedConversation?._id) return;
    const join = () => socket.emit('join_conversation', selectedConversation._id);
    if (socket.connected) join();
    socket.on('connect', join);
    return () => socket.off('connect', join);
  }, [socket, selectedConversation]);

  // Fetch conversations — and if startupId is in URL, auto-initiate/select that conversation
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/startupark/api/chat/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const convList = Array.isArray(data) ? data : (data.conversations || []);
          setConversations(convList);

          if (startupId) {
            // Conversations key the startup via contextId (no startupId field on the model).
            let conv = convList.find(c =>
              String(c.contextId) === String(startupId) ||
              c.startupId?._id === startupId || c.startupId === startupId
            );

            if (!conv) {
              // Not in the list yet — let the backend resolve the recipient from the
              // startup id (contextId) and create/return the conversation.
              try {
                let recipientId;
                try {
                  const startupRes = await fetch(`${baseUrl}/startupark/api/profile/startups/${startupId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (startupRes.ok) {
                    const startupJson = await startupRes.json();
                    const startupObj = startupJson.startup || startupJson;
                    recipientId = startupObj.userId?._id || startupObj.userId;
                  }
                } catch { /* backend resolves from contextId anyway */ }

                const initRes = await fetch(`${baseUrl}/startupark/api/chat/initiate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ recipientId, contextType: 'startup', contextId: startupId })
                });
                if (initRes.ok) {
                  const initJson = await initRes.json();
                  conv = initJson.conversation || initJson;
                  setConversations(prev => prev.find(c => c._id === conv._id) ? prev : [conv, ...prev]);
                } else {
                  const errJson = await initRes.json().catch(() => ({}));
                  setError(errJson.error || 'Could not open this conversation.');
                }
              } catch (e) {
                console.error('Error initiating conversation from URL:', e);
                setError('Could not open this conversation.');
              }
            }

            if (conv) setSelectedConversation(conv);
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
          const otherParticipant = getParticipantIds(conversation).find(
            p => String(typeof p === 'object' ? p?._id : p) !== String(currentUser.id)
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
              userImage = userDetails?.profilePicture || userDetails?.profileImage;
            } else {
              // We have the full user object
              userName = otherParticipant.username || otherParticipant.name || 'Unknown User';
              userImage = otherParticipant.profilePicture || otherParticipant.profileImage;
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
          // For regular users: resolve the startup from contextId (the model has no startupId).
          let startupName = '';
          let startupLogo = null;
          const sid = conversation.contextId || conversation.startupId?._id || conversation.startupId;

          if (sid && conversation.contextType !== 'general') {
            try {
              const sres = await fetch(`${baseUrl}/startupark/api/profile/startups/${sid}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              if (sres.ok) {
                const sj = await sres.json();
                const s = sj.startup || sj;
                startupName = s.companyName || s.startupName || '';
                startupLogo = s.logo;
              }
            } catch { /* fall through to participant */ }
          }

          // Fallback: show the other participant if the startup couldn't be resolved.
          if (!startupName) {
            const op = getParticipantIds(conversation).find(
              p => String(typeof p === 'object' ? p?._id : p) !== String(currentUser.id)
            );
            if (op && typeof op === 'object') {
              startupName = op.username || op.name || 'Chat';
              startupLogo = op.profilePicture || op.profileImage;
            } else {
              startupName = 'Chat';
            }
          }

          // Presence is keyed by the OTHER participant's user id (the startup owner),
          // not the startup id — so the online dot reflects the person, not the company.
          const ownerId = otherParticipantId(conversation, currentUser.id);
          displayInfo[conversation._id] = { name: startupName, image: startupLogo, isStartup: true, userId: ownerId };
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
        const messagesRes = await fetch(`${baseUrl}/startupark/api/chat/messages/${selectedConversation._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages((messagesData.messages || []).map(normalizeMsg));
        }

        // Get other user info (participantIds may be string ids or populated objects)
        const list = getParticipantIds(selectedConversation);
        const otherParticipant = list.find(p => String(typeof p === 'object' ? p?._id : p) !== String(currentUser.id));
        if (otherParticipant && typeof otherParticipant === 'object') {
          setOtherUser(otherParticipant);
        }

        // Resolve the startup from contextId for non-startup users.
        const sid = selectedConversation.contextId
          || selectedConversation.startupId?._id || selectedConversation.startupId;
        if (currentUser.role !== 'startup' && sid && selectedConversation.contextType !== 'general') {
          const startupRes = await fetch(`${baseUrl}/startupark/api/profile/startups/${sid}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (startupRes.ok) {
            const startupJson = await startupRes.json();
            setStartup(startupJson.startup || startupJson);
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
      const response = await fetch(`${baseUrl}/startupark/api/chat/messages/${conversationId}/read`, {
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
      socket.on('receive_message', (raw) => {
        const message = normalizeMsg(raw);
        if (String(message.conversationId) === String(selectedConversation?._id)) {
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
  const MAX_FILE_MB = 25;
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const tooBig = files.find(f => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) { setError(`"${tooBig.name}" exceeds the ${MAX_FILE_MB}MB limit.`); }
    const ok = files.filter(f => f.size <= MAX_FILE_MB * 1024 * 1024);
    setMediaFiles(prev => [...prev, ...ok]);
    e.target.value = ''; // allow re-picking the same file
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

  // Classify a file into our attachment type buckets.
  const attachmentType = (mime = '') => {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    return 'file';
  };

  // Presign → PUT to R2 → return the attachment descriptor stored on the message.
  const uploadAttachment = async (file, name, mime) => {
    const token = localStorage.getItem('token');
    const up = await fetch(`${baseUrl}/startupark/api/chat/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId: selectedConversation._id, filename: name, contentType: mime }),
    });
    if (!up.ok) throw new Error('upload-url-failed');
    const { uploadUrl, key } = await up.json();
    const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': mime }, body: file });
    if (!put.ok) throw new Error('r2-put-failed');
    return { key, type: attachmentType(mime), name, size: file.size, mime };
  };

  // Send one message carrying the recorded audio.
  const sendRecordedAudio = async () => {
    if (!recordedAudio || !socket || !selectedConversation || !currentUser) return;
    try {
      const att = await uploadAttachment(recordedAudio, `voice-${Date.now()}.webm`, 'audio/webm');
      emitMessageWithAttachments([att]);
      setRecordedAudio(null);
      setAudioUrl('');
    } catch (error) {
      console.error('Error sending audio message:', error);
      setError('Failed to send voice message');
    }
  };

  // Upload all picked files and send them as a single message (with optional caption).
  const sendMediaFiles = async () => {
    if (mediaFiles.length === 0 || !socket || !selectedConversation || !currentUser) return;
    try {
      const atts = [];
      for (const file of mediaFiles) {
        atts.push(await uploadAttachment(file, file.name, file.type || 'application/octet-stream'));
      }
      emitMessageWithAttachments(atts, newMessage.trim());
      setMediaFiles([]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending media files:', error);
      setError('Failed to send attachment');
    }
  };

  // Optimistically render + send a message with attachments.
  const emitMessageWithAttachments = (attachments, content = '') => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const optimistic = {
      _id: tempId, content, attachments,
      sender: { _id: currentUser.id, name: currentUser.name, profilePicture: currentUser.avatar },
      timestamp: new Date(), read: false, delivered: false, isOptimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    const payload = { conversationId: selectedConversation._id, senderId: currentUser.id, content, attachments };
    if (socket?.connected) {
      socket.emit('send_message', payload);
    } else {
      fetch(`${baseUrl}/startupark/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload),
      }).then(r => r.ok && r.json()).then(d => d && setMessages(prev => prev.map(m => m._id === tempId ? normalizeMsg(d.message) : m))).catch(() => {});
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && mediaFiles.length === 0 && !recordedAudio) || !socket || !selectedConversation || !currentUser) return;
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      setSending(true);
      
      // Get receiver ID - handle both object and string participants
      // Backend resolves the recipient itself; receiverId is best-effort metadata.
      const receiverId = otherParticipantId(selectedConversation, currentUser.id);
      
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

        // Prefer realtime socket; fall back to REST so a message is never lost
        // if the socket is mid-reconnect.
        if (socket?.connected) {
          socket.emit('send_message', messageData);
        } else {
          const res = await fetch(`${baseUrl}/startupark/api/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ conversationId: messageData.conversationId, content: messageData.content })
          });
          if (res.ok) {
            const { message } = await res.json();
            setMessages(prev => prev.map(m => m._id === tempMessageId ? normalizeMsg(message) : m));
          }
        }
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
      return <IoCheckmarkDone className="text-zinc-900 dark:text-white ml-1" size={16} />;
    } else if (message.delivered) {
      return <IoCheckmarkDone className="text-gray-400 ml-1" size={16} />;
    } else if (!message.isOptimistic) {
      return <FiCheck className="text-gray-400 ml-1" size={14} />;
    }
    
    return <FiLoader className="animate-spin text-gray-400 ml-1" size={14} />;
  };

  const renderAttachment = (att, i, mine) => {
    const url = att.key ? getImageUrl(att.key, baseUrl) : (att.url || '');
    if (att.type === 'image') {
      return (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img src={url} alt={att.name || 'image'} className="max-w-[260px] max-h-72 rounded-lg object-cover" loading="lazy" />
        </a>
      );
    }
    if (att.type === 'video') {
      return <video key={i} controls className="max-w-[260px] rounded-lg" src={url} />;
    }
    if (att.type === 'audio') {
      return <audio key={i} controls className="w-56" src={url} />;
    }
    const kb = att.size ? `${(att.size / 1024).toFixed(0)} KB` : '';
    return (
      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
        className={`flex items-center gap-2 p-2.5 rounded-lg border ${mine ? 'border-white/20 dark:border-black/10' : 'border-black/10 dark:border-white/15'} hover:opacity-90`}>
        <FiPaperclip className="flex-shrink-0" />
        <span className="text-sm truncate max-w-[180px]">{att.name || 'Attachment'}</span>
        {kb && <span className="text-xs opacity-60 ml-auto">{kb}</span>}
      </a>
    );
  };

  const renderMessageContent = (message, mine) => {
    const atts = Array.isArray(message.attachments) ? message.attachments : [];
    return (
      <div className="space-y-1.5">
        {atts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {atts.map((a, i) => renderAttachment(a, i, mine))}
          </div>
        )}
        {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
      </div>
    );
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
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-[calc(100dvh-7rem)] rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/10 glass-card !p-0">

      {/* Conversations sidebar */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-black/[0.06] dark:border-white/10 flex-col bg-black/[0.02] dark:bg-white/[0.02]`}>
        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06]"
              onClick={() => setShowConversationMenu(!showConversationMenu)}
            >
              <FiMoreVertical className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20 dark:bg-zinc-800 dark:text-white"
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
                  className={`flex items-center p-4 border-b border-gray-100 dark:border-white/10 cursor-pointer ${
                    isSelected
                      ? 'bg-black/[0.05] dark:bg-white/[0.08]'
                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
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
                      <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center relative">
                        <FiMessageSquare className="text-zinc-500 dark:text-zinc-400" size={20} />
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
                        <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
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
          <div className="border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between bg-white dark:bg-zinc-950">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden mr-2 p-1.5 -ml-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                aria-label="Back to conversations"
              >
                <FiChevronLeft size={22} />
              </button>
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
                      <p className={`text-xs flex items-center gap-1.5 ${typingUsers.length > 0 ? 'text-zinc-500 dark:text-zinc-400 italic' : isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {typingUsers.length === 0 && <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />}
                        {typingUsers.length > 0 ? 'typing…' : isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* TODO: chat→video handoff — deferred to chat community roadmap (requires WebRTC signaling for 1:1 rooms). */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                <FiInfo size={20} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-950">
            <div className="max-w-3xl mx-auto space-y-6">
              {Object.keys(groupedMessages).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-zinc-800 px-3 py-1 rounded-full">
                        {date}
                      </span>
                    </div>
                    {dateMessages.map((message) => {
                      const mine = String(message.sender?._id) === String(currentUser?.id);
                      return (
                      <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-3.5 py-2 rounded-2xl ${
                            mine
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-br-md'
                              : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-black/[0.06] dark:border-white/10 rounded-bl-md'
                          }`}
                        >
                          {renderMessageContent(message, mine)}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-[10px] ${mine ? 'text-zinc-300 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {getMessageStatusIcon(message)}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div ref={typingIndicatorRef} className="flex justify-start mb-3">
                  <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2">
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
            <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-100 dark:bg-zinc-900">
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
                        <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
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
                    <div className="flex items-center bg-white dark:bg-zinc-800 p-2 rounded-lg">
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
          <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 bg-white dark:bg-zinc-950">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center mb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image or file"
                  className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mr-1 transition-colors"
                >
                  <FiPaperclip size={20} />
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
                  className="flex-1 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20 dark:bg-zinc-950 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && mediaFiles.length === 0 && !recordedAudio) || sending}
                  className="ml-3 p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
        <div className="flex-1 hidden md:flex items-center justify-center bg-transparent">
          <div className="text-center text-zinc-500 dark:text-zinc-400 px-6">
            <FiMessageSquare size={56} className="mx-auto mb-4 opacity-60" />
            {error ? (
              <>
                <h2 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Couldn't open chat</h2>
                <p className="text-sm max-w-xs mx-auto">{error}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Select a conversation</h2>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;