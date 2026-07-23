// components/ChatVideoCall.jsx
// Tier 3 C#7 — chat->video handoff. Simplified 2-person always-on-camera call:
// reuses VideoConference.jsx's LiveKit wiring (LiveKitRoom + VideoConference),
// but with no recording, no attendee cap, no host controls — both chat
// participants get equal grants (minted by the backend).
import '@livekit/components-styles';
import { LiveKitRoom, VideoConference as LiveKitVideoConference } from '@livekit/components-react';
import { FiPhoneOff } from 'react-icons/fi';

const ChatVideoCall = ({ connection, onLeave }) => {
  if (!connection) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-white">Video call</span>
        </div>
        <button
          onClick={onLeave}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"
          title="Leave call"
        >
          <FiPhoneOff size={16} />
        </button>
      </div>

      <div className="flex-1 min-h-0" data-lk-theme="default">
        <LiveKitRoom
          serverUrl={connection.serverUrl}
          token={connection.token}
          connect
          video
          audio
          onDisconnected={onLeave}
          style={{ height: '100%' }}
        >
          <LiveKitVideoConference />
        </LiveKitRoom>
      </div>
    </div>
  );
};

export default ChatVideoCall;
