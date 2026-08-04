import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComments, addComment, deleteComment } from '../services/startupUpdates';
import { getImageUrl } from '../utils/imageUrls';
import { relativeTime } from '../utils/relativeTime';
import { isLoggedIn, getCurrentUserId } from '../utils/currentUser';
import { useSocket } from '../contexts/SocketContext';
import 'boxicons';

const MAX_LENGTH = 500;

const CommentAvatar = ({ user }) => {
  const url = user?.profilePicture ? getImageUrl(user.profilePicture) : null;
  return url ? (
    <img src={url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
      {user?.username?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

const CommentRow = ({ comment, canDelete, onDelete }) => (
  <div className="flex items-start gap-2 group/comment">
    <CommentAvatar user={comment.user} />
    <div className="min-w-0 flex-1">
      <div className="glass-inset rounded-2xl px-3 py-2">
        <p className="text-xs font-semibold text-zinc-900 dark:text-white">
          {comment.user?.username || 'Deleted user'}
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-200 break-words whitespace-pre-wrap">{comment.text}</p>
      </div>
      <div className="flex items-center gap-2 mt-1 px-1">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{relativeTime(comment.createdAt)}</span>
        {canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(comment._id); }}
            className="text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  </div>
);

// Shared comment-thread state/logic, used by both the combined CommentsPanel
// (below) and by callers that need the toggle button and the thread body
// rendered in two different places in the DOM (e.g. toggle in a corner
// overlay, thread body in normal card flow).
//
// `count` re-syncs from `initialCount` whenever it changes and the thread
// hasn't been loaded yet (e.g. a list refetch after a filter change) — once
// the user has actually loaded/posted/deleted a comment, live state wins so a
// stray parent re-render can't clobber a just-posted comment's count back down.
export function useCommentsThread(updateId, initialCount = 0) {
  const navigate = useNavigate();
  const socket = useSocket();
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const loadedRef = useRef(loaded);
  useEffect(() => { loadedRef.current = loaded; }, [loaded]);

  useEffect(() => {
    setLoaded(false);
    setLoading(false);
    setComments([]);
    setExpanded(false);
    setPage(1);
    setHasMore(false);
    setText('');
    setError(null);
  }, [updateId]);

  useEffect(() => {
    if (!loaded) setCount(initialCount);
  }, [initialCount, loaded]);

  // Live updates: the count always tracks the broadcast (even before the
  // thread's ever been expanded, so the collapsed badge stays current too).
  // The comment itself is only spliced into the loaded list — if the thread
  // hasn't been fetched yet, inserting a lone live comment ahead of the real
  // historical ones would leave a gap the next `load(1)` can't detect. Dedup
  // by _id since the author's own submit() already appended it locally from
  // the REST response before this same write's broadcast arrives.
  useEffect(() => {
    if (!socket || !updateId) return;
    socket.emit('update:subscribe', updateId);
    const onComment = (payload) => {
      if (String(payload.updateId) !== String(updateId)) return;
      setCount(payload.commentCount);
      if (loadedRef.current) {
        setComments((prev) => (prev.some((c) => c._id === payload.comment._id) ? prev : [...prev, payload.comment]));
      }
    };
    const onCommentDeleted = (payload) => {
      if (String(payload.updateId) !== String(updateId)) return;
      setCount(payload.commentCount);
      setComments((prev) => prev.filter((c) => c._id !== payload.commentId));
    };
    socket.on('update:comment', onComment);
    socket.on('update:comment_deleted', onCommentDeleted);
    return () => {
      socket.off('update:comment', onComment);
      socket.off('update:comment_deleted', onCommentDeleted);
      socket.emit('update:unsubscribe', updateId);
    };
  }, [socket, updateId]);

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const res = await fetchComments(updateId, { page: nextPage, limit: 20 });
      setComments((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]));
      setCount(res.commentCount);
      setHasMore(res.pagination.hasMore);
      setPage(nextPage);
      setLoaded(true);
    } catch {
      setError('Could not load comments');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !loaded) load(1);
  };

  const submit = async () => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    const trimmed = text.trim();
    if (!trimmed || posting) return;

    setPosting(true);
    setError(null);
    try {
      const res = await addComment(updateId, trimmed);
      setComments((prev) => [...prev, res.data]);
      setCount(res.commentCount);
      setText('');
      if (!expanded) setExpanded(true);
      setLoaded(true);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    const prevComments = comments;
    const prevCount = count;
    setComments((c) => c.filter((c2) => c2._id !== commentId));
    setCount((c) => Math.max(0, c - 1));
    try {
      await deleteComment(updateId, commentId);
    } catch {
      setComments(prevComments); // roll back — deletion failed server-side
      setCount(prevCount);
    }
  };

  return {
    expanded, loading, comments, count, page, hasMore, text, setText, posting, error,
    toggle, submit, handleDelete, load, setExpanded, setLoaded,
  };
}

// Icon + count only — for placing in a corner overlay, separate from the
// thread body. Toggling opens/closes the thread wherever <CommentsThread>
// for the same `thread` state happens to be rendered.
export function CommentsToggleButton({ thread, compact = true, theme = 'default', className = '' }) {
  const color = theme === 'onDark'
    ? 'hover:opacity-70'
    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); thread.toggle(); }}
      className={`inline-flex items-center gap-1.5 transition-colors ${color} ${className}`}
    >
      <box-icon name="comment" size={compact ? '15px' : '17px'} color="currentColor"></box-icon>
      <span className={compact ? 'text-xs font-medium' : 'text-sm font-medium'}>{thread.count}</span>
    </button>
  );
}

// The input + comment list. Renders nothing while collapsed unless
// `startExpanded` — pass a `thread` from useCommentsThread(), shared with a
// <CommentsToggleButton> elsewhere for the same post.
export function CommentsThread({ thread, postedBy, startExpanded = false, className = '' }) {
  const navigate = useNavigate();
  const viewerId = getCurrentUserId();
  if (!thread.expanded && !startExpanded) return null;

  const onKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); thread.submit(); }
  };

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-3">
        <input
          value={thread.text}
          onChange={(e) => thread.setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={(e) => { e.stopPropagation(); if (!isLoggedIn()) navigate('/login'); }}
          maxLength={MAX_LENGTH}
          placeholder={isLoggedIn() ? 'Write a comment…' : 'Log in to comment'}
          disabled={!isLoggedIn() || thread.posting}
          className="input-mono flex-1 py-2 text-sm disabled:opacity-60"
        />
        <button
          onClick={(e) => { e.stopPropagation(); thread.submit(); }}
          disabled={!thread.text.trim() || thread.posting}
          className="btn-mono w-9 h-9 flex-shrink-0 flex items-center justify-center disabled:opacity-40"
          aria-label="Post comment"
        >
          <box-icon name="send" size="15px" color="currentColor"></box-icon>
        </button>
      </div>
      {thread.error && <p className="text-xs text-red-500 mb-2">{thread.error}</p>}

      {thread.loading && thread.comments.length === 0 ? (
        <div className="space-y-2">
          {[0, 1].map((i) => <div key={i} className="h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />)}
        </div>
      ) : thread.comments.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">No comments yet — be the first.</p>
      ) : (
        <div className="space-y-3">
          {thread.comments.map((c) => (
            <CommentRow
              key={c._id}
              comment={c}
              canDelete={!!viewerId && (String(c.user?._id) === String(viewerId) || String(postedBy) === String(viewerId))}
              onDelete={thread.handleDelete}
            />
          ))}
          {thread.hasMore && (
            <button
              onClick={(e) => { e.stopPropagation(); thread.load(thread.page + 1); }}
              disabled={thread.loading}
              className="btn-ghost w-full py-1.5 text-xs disabled:opacity-50"
            >
              {thread.loading ? 'Loading…' : 'Load more comments'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Inline comment thread — collapsed toggle by default (for cards), or always
// expanded (for the detail page, via `startExpanded`). Deletion is allowed for
// the comment's own author or the post's owner; the server re-checks both, so
// this is UI-convenience only, not the authorization boundary.
//
// Combines the toggle + thread in one place, stacked vertically. Use
// useCommentsThread()/<CommentsToggleButton>/<CommentsThread> directly instead
// when the toggle needs to live somewhere else in the layout (e.g. a corner
// overlay) than the expanded thread body.
export default function CommentsPanel({ updateId, postedBy, initialCount = 0, startExpanded = false, className = '' }) {
  const thread = useCommentsThread(updateId, initialCount);

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      {!startExpanded && <CommentsToggleButton thread={thread} />}
      <CommentsThread
        thread={thread}
        postedBy={postedBy}
        startExpanded={startExpanded}
        className={startExpanded ? 'mt-4' : (thread.expanded ? 'mt-3 pt-3 border-t border-black/[0.06] dark:border-white/10' : '')}
      />
    </div>
  );
}
