import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

// Read the current user id from the same auth source ChatInterface.jsx uses.
const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return u?.id || u?._id || localStorage.getItem('userId') || null;
  } catch {
    return localStorage.getItem('userId') || null;
  }
};

const VideoConference = () => {
  // eventId comes from the /virtual-event/:id route param; userId from auth storage.
  const { id: eventId } = useParams();
  const userId = getUserId();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [socket, setSocket] = useState(null);

  const localVideoRef = useRef();
  const peerConnections = useRef(new Map());
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!eventId) return;

    // Point the socket at the backend base URL (not the page origin), matching
    // the connection pattern used by ChatInterface.jsx / NotificationBell.jsx.
    const newSocket = io(baseUrl, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    // Identify so the backend tags event emits with our userId, then join the room.
    const joinRoom = () => {
      if (userId) newSocket.emit('identify', userId);
      newSocket.emit('join_event', eventId);
    };
    if (newSocket.connected) joinRoom();
    newSocket.on('connect', joinRoom);

    // Setup media
    setupMedia();

    // Socket event handlers — snake_case names match the backend (socketHandler.js).
    newSocket.on('user_joined_event', handleUserJoined);
    newSocket.on('user_left_event', handleUserLeft);
    newSocket.on('webrtc_offer', handleOffer);
    newSocket.on('webrtc_answer', handleAnswer);
    newSocket.on('webrtc_ice_candidate', handleIceCandidate);

    return () => {
      newSocket.emit('leave_event', eventId);
      newSocket.off('connect', joinRoom);
      newSocket.disconnect();
      cleanupMedia();
    };
  }, [eventId, baseUrl]);

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const cleanupMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  // Peer connections are keyed by the remote socket id, since the backend tags
  // every webrtc/user event with the sender's socket id (`from` / `socketId`).
  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStreams(prev => new Map(prev.set(peerId, event.streams[0])));
    };

    // Handle ICE candidates — backend relays to the rest of the event room.
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_ice_candidate', {
          eventId,
          candidate: event.candidate
        });
      }
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  };

  const handleUserJoined = async (data) => {
    const pc = createPeerConnection(data.socketId);

    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('webrtc_offer', {
      eventId,
      offer
    });
  };

  const handleOffer = async (data) => {
    const pc = createPeerConnection(data.from);

    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('webrtc_answer', {
      eventId,
      answer
    });
  };

  const handleAnswer = async (data) => {
    const pc = peerConnections.current.get(data.from);
    if (pc) {
      await pc.setRemoteDescription(data.answer);
    }
  };

  const handleIceCandidate = async (data) => {
    const pc = peerConnections.current.get(data.from);
    if (pc) {
      await pc.addIceCandidate(data.candidate);
    }
  };

  const handleUserLeft = (data) => {
    const pc = peerConnections.current.get(data.socketId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(data.socketId);
    }
    setRemoteStreams(prev => {
      const newStreams = new Map(prev);
      newStreams.delete(data.socketId);
      return newStreams;
    });
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const leaveCall = () => {
    cleanupMedia();
    window.location.href = '/events';
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Virtual Event</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Participants: {participants.length + 1}</span>
          <button
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-auto">
        {/* Local Video */}
        <div className="bg-black rounded-lg relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You {isAudioMuted && '🔇'} {isVideoOff && '📷❌'}
          </div>
        </div>

        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
          <div key={userId} className="bg-black rounded-lg relative">
            <video
              autoPlay
              className="w-full h-full object-cover rounded-lg"
              ref={video => {
                if (video) video.srcObject = stream;
              }}
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              User {userId}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${
            isAudioMuted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          } text-white`}
        >
          {isAudioMuted ? '🔇' : '🎤'}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            isVideoOff ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          } text-white`}
        >
          {isVideoOff ? '📷❌' : '📷'}
        </button>

        <button
          onClick={leaveCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
        >
          Leave Call
        </button>
      </div>
    </div>
  );
};

export default VideoConference;