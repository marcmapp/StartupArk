import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '@livekit/components-styles';
import { LiveKitRoom, VideoConference as LiveKitVideoConference } from '@livekit/components-react';
import { eventService } from '../../../../services/eventService';

const VideoConference = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [connection, setConnection] = useState(null);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordingBusy, setRecordingBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await eventService.getLiveKitToken(eventId);
        if (!cancelled) setConnection(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Couldn't join this event");
      }
    })();
    return () => { cancelled = true; };
  }, [eventId]);

  const handleLeave = useCallback(() => {
    navigate('/startupark/events');
  }, [navigate]);

  const toggleRecording = async () => {
    setRecordingBusy(true);
    try {
      if (recording) {
        await eventService.stopRecording(eventId, recording.egressId);
        setRecording(null);
      } else {
        const { recording: rec } = await eventService.startRecording(eventId);
        setRecording(rec);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Recording action failed');
    } finally {
      setRecordingBusy(false);
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-200 dark:bg-zinc-950 px-4">
        <div className="glass-card p-8 text-center max-w-sm w-full">
          <p className="text-zinc-900 dark:text-white font-semibold mb-2">Can't join this event</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/startupark/events')} className="btn-mono w-full">Back to Events</button>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-200 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Connecting…</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-200 dark:bg-zinc-950">
      <div className="glass-panel !rounded-none border-x-0 border-t-0 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Live Event</span>
          {connection.isHost && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300">
              Host
            </span>
          )}
          {recording && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Recording
            </span>
          )}
        </div>

        {connection.isHost && connection.recordingEnabled && (
          <button
            onClick={toggleRecording}
            disabled={recordingBusy}
            className={recording ? 'btn-mono !bg-red-600 dark:!bg-red-600 !text-white' : 'btn-ghost'}
          >
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0" data-lk-theme="default">
        <LiveKitRoom
          serverUrl={connection.serverUrl}
          token={connection.token}
          connect
          video
          audio
          onDisconnected={handleLeave}
          style={{ height: '100%' }}
        >
          <LiveKitVideoConference />
        </LiveKitRoom>
      </div>
    </div>
  );
};

export default VideoConference;
