import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleUpdateLike } from '../services/startupUpdates';
import { isLoggedIn } from '../utils/currentUser';
import 'boxicons';

// Optimistic like toggle, reused on post cards (where it must not trigger the
// card's own navigate-to-detail click) and on the detail page itself.
export default function LikeButton({ updateId, liked, likeCount, compact = false, className = '' }) {
  const navigate = useNavigate();
  const [state, setState] = useState({ liked: !!liked, count: likeCount || 0 });
  const [busy, setBusy] = useState(false);

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

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 ${
        state.liked ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-500'
      } ${className}`}
    >
      <box-icon name="heart" type={state.liked ? 'solid' : 'regular'} size={compact ? '15px' : '17px'} color="currentColor"></box-icon>
      <span className={compact ? 'text-xs font-medium' : 'text-sm font-medium'}>{state.count}</span>
    </button>
  );
}
