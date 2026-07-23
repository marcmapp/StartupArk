import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiUserCheck, FiSlash } from 'react-icons/fi';
import { fetchFollowStatus, followUser, unfollowUser, unblockUser } from '../services/follow';

function getCurrentUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u._id || u.id;
  } catch { return null; }
}

// Reusable follow/unfollow control. Renders nothing for a self-profile.
// States: Follow -> Following (hover: Unfollow) -> Blocked (only shown to the
// blocker, hover: Unblock) -> disabled "Unavailable" when the viewer has been
// blocked by the target.
const FollowButton = ({ targetUserId, className = '' }) => {
  const navigate = useNavigate();
  const isSelf = targetUserId && String(targetUserId) === String(getCurrentUserId());
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!targetUserId || isSelf) return;
    if (!localStorage.getItem('token')) { setStatus('not_following'); return; }
    try {
      setStatus(await fetchFollowStatus(targetUserId));
    } catch {
      setStatus('not_following');
    }
  }, [targetUserId, isSelf]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  if (isSelf || !targetUserId) return null;

  const handleClick = async () => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    setBusy(true);
    try {
      if (status === 'following') {
        await unfollowUser(targetUserId);
        setStatus('not_following');
      } else if (status === 'not_following') {
        await followUser(targetUserId);
        setStatus('following');
      } else if (status === 'blocked_by_me') {
        await unblockUser(targetUserId);
        setStatus('not_following');
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    } finally {
      setBusy(false);
    }
  };

  if (status === null) {
    return (
      <button className={`btn-ghost text-sm px-4 py-2 opacity-50 ${className}`} disabled>
        …
      </button>
    );
  }

  if (status === 'blocked_by_them') {
    return (
      <button
        className={`btn-ghost text-sm px-4 py-2 opacity-50 cursor-not-allowed flex items-center gap-1.5 justify-center ${className}`}
        disabled
        title="You can't follow this user"
      >
        <FiSlash size={14} />
        Unavailable
      </button>
    );
  }

  if (status === 'following' || status === 'blocked_by_me') {
    const isBlocked = status === 'blocked_by_me';
    const label = busy ? '…' : hover ? (isBlocked ? 'Unblock' : 'Unfollow') : (isBlocked ? 'Blocked' : 'Following');
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={isBlocked ? 'You have blocked this user' : undefined}
        className={`text-sm px-4 py-2 rounded-xl border transition-colors flex items-center gap-1.5 justify-center disabled:opacity-50 ${
          hover ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'btn-ghost'
        } ${className}`}
      >
        {hover ? <FiSlash size={14} /> : <FiUserCheck size={14} />}
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`btn-mono text-sm px-4 py-2 flex items-center gap-1.5 justify-center disabled:opacity-50 ${className}`}
    >
      <FiUserPlus size={14} />
      {busy ? '…' : 'Follow'}
    </button>
  );
};

export default FollowButton;
