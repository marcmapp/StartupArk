// components/ConversationsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiSearch, FiClock } from 'react-icons/fi';
import { getImageUrl } from '../../../../utils/imageUrls';

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Get current user data
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

    const userData = getUserData();
    const currentUserId = userData?.id || userData?._id || localStorage.getItem('userId');
    setCurrentUser({ id: currentUserId, role: userData?.startuparkRole });
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`${baseUrl}/startupark/api/chat/conversations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchConversations();
    }
  }, [baseUrl, currentUser]);

  // Get the display information for a conversation based on user role
  const getConversationDisplayInfo = (conversation) => {
    if (!currentUser) return { name: 'Unknown', image: null, isStartup: false };
    
    // For startup users, show the other participant (user)
    if (currentUser.role === 'startup') {
      const otherParticipant = conversation.participants.find(
        p => p._id !== currentUser.id
      );
      
      return {
        name: otherParticipant?.name || otherParticipant?.username || 'Unknown User',
        image: otherParticipant?.profileImage,
        isStartup: false
      };
    }
    
    // For regular users, show the startup info
    const startup = conversation.startupId;
    return {
      name: startup?.formData?.startupName || 'Unknown Startup',
      image: startup?.formData?.logo,
      isStartup: true
    };
  };

  const filteredConversations = conversations.filter(conv => {
    const displayInfo = getConversationDisplayInfo(conv);
    const participantNames = conv.participants
      .filter(p => p._id !== currentUser?.id)
      .map(p => p.name || p.username)
      .join(' ');
    
    return displayInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           participantNames.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <FiMessageSquare size={48} className="mb-4" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const displayInfo = getConversationDisplayInfo(conversation);
              const lastMessage = conversation.lastMessage;
              
              return (
                <Link
                  key={conversation._id}
                  to={`/startupark/chat/${conversation.startupId?._id || conversation._id}`}
                  className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-4">
                    {displayInfo.image ? (
                      <img
                        src={getImageUrl(displayInfo.image, baseUrl)}
                        alt={displayInfo.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                        <FiMessageSquare className="text-indigo-600 dark:text-indigo-300" size={20} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
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
                    
                    {lastMessage ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
                    )}
                  </div>

                  {/* Unread indicator */}
                  {conversation.unreadCount > 0 && (
                    <div className="flex-shrink-0 ml-3">
                      <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Empty state for larger screens */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <FiMessageSquare size={64} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Select a conversation</h2>
          <p>Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationsList;