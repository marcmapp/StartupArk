import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleUpdateLike } from '../services/startupUpdates';
import { isLoggedIn } from '../utils/currentUser';
import { useSocket } from '../contexts/SocketContext';
import 'boxicons';

// Optimistic like toggle, reused on post cards (where it must not trigger the
// card's own navigate-to-detail click) and on the detail page itself.
//
// `liked`/`likeCount` are re-synced whenever they change (e.g. a list refetch
// after a filter change, or this button getting reused for a different post
// via the same list position) — without this, the internal state initialized
// from useState's first-mount value would go stale relative to the server.
//
// Live updates: joins a per-post socket room so a like from anyone else
// viewing the same post updates this button's count immediately, the same
// way Instagram/Facebook counts tick up without a refresh. Only the count is
// broadcast — `liked` (the filled-heart state) is per-viewer and always
// reflects only this viewer's own click, never someone else's.
export default function LikeButton({ updateId, liked, likeCount, compact = false, theme = 'default', className = '' }) {
  const navigate = useNavigate();
  const socket = useSocket();
  const [state, setState] = useState({ liked: !!liked, count: likeCount || 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState({ liked: !!liked, count: likeCount || 0 });
  }, [updateId, liked, likeCount]);

  useEffect(() => {
    if (!socket || !updateId) return;
    socket.emit('update:subscribe', updateId);
    const onLike = (payload) => {
      if (String(payload.updateId) !== String(updateId)) return;
      setState((s) => ({ ...s, count: payload.likeCount }));
    };
    socket.on('update:like', onLike);
    return () => {
      socket.off('update:like', onLike);
      socket.emit('update:unsubscribe', updateId);
    };
  }, [socket, updateId]);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { navigate('/login'); return; }
    if (busy) return;

    const prev = state;
    const next = { liked: !prev.liked, count: prev.count + (prev.liked ? -1 : 1) };
    setState(next); // optimistic
    setBusy(true);
    try {
      const res = await toggleUpdateLike(updateId);
      setState({ liked: res.liked, count: res.likeCount });
    } catch {
      setState(prev); // roll back on failure (network error, deleted post, etc.)
    } finally {
      setBusy(false);
    }
  };

  const unlikedColor = theme === 'onDark' ? 'hover:text-red-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-500';
  // A liked-background chip, not just the icon's solid/regular shape swap —
  // that shape swap goes through the boxicons web component, which fetches
  // each icon+type combination from a CDN the first time it's used and
  // permanently caches the *rejected* promise on failure (no retry for the
  // rest of the session). The background here is plain CSS on our own
  // button, so "liked" always reads as visually on, even if that fetch
  // silently failed for this particular icon/type the first time around.
  const likedBg = theme === 'onDark' ? 'bg-white/20' : 'bg-red-500/10';

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors disabled:opacity-60 ${
        state.liked ? `text-red-500 ${likedBg}` : unlikedColor
      } ${className}`}
    >
      <box-icon name="heart" type={state.liked ? 'solid' : 'regular'} size={compact ? '15px' : '17px'} color="currentColor"></box-icon>
      <span className={compact ? 'text-xs font-medium' : 'text-sm font-medium'}>{state.count}</span>
    </button>
  );
}
