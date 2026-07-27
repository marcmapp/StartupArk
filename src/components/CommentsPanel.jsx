import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComments, addComment, deleteComment } from '../services/startupUpdates';
import { getImageUrl } from '../utils/imageUrls';
import { relativeTime } from '../utils/relativeTime';
import { isLoggedIn, getCurrentUserId } from '../utils/currentUser';
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

// Inline comment thread — collapsed toggle by default (for cards), or always
// expanded (for the detail page, via `startExpanded`). Deletion is allowed for
// the comment's own author or the post's owner; the server re-checks both, so
// this is UI-convenience only, not the authorization boundary.
export default function CommentsPanel({ updateId, postedBy, initialCount = 0, startExpanded = false, className = '' }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(startExpanded);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const viewerId = getCurrentUserId();

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

  const toggle = (e) => {
    e.stopPropagation();
    const next = !expanded;
    setExpanded(next);
    if (next && !loaded) load(1);
  };

  const submit = async (e) => {
    e.stopPropagation();
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

  const onKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); }
  };

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      {!startExpanded && (
        <button
          onClick={toggle}
          className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <box-icon name="comment" size="15px" color="currentColor"></box-icon>
          <span className="text-xs font-medium">{count}</span>
        </button>
      )}

      {(expanded || startExpanded) && (
        <div className={startExpanded ? 'mt-4' : 'mt-3 pt-3 border-t border-black/[0.06] dark:border-white/10'}>
          <div className="flex items-center gap-2 mb-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={(e) => { e.stopPropagation(); if (!isLoggedIn()) navigate('/login'); }}
              maxLength={MAX_LENGTH}
              placeholder={isLoggedIn() ? 'Write a comment…' : 'Log in to comment'}
              disabled={!isLoggedIn() || posting}
              className="input-mono flex-1 py-2 text-sm disabled:opacity-60"
            />
            <button
              onClick={submit}
              disabled={!text.trim() || posting}
              className="btn-mono w-9 h-9 flex-shrink-0 flex items-center justify-center disabled:opacity-40"
              aria-label="Post comment"
            >
              <box-icon name="send" size="15px" color="currentColor"></box-icon>
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

          {loading && comments.length === 0 ? (
            <div className="space-y-2">
              {[0, 1].map((i) => <div key={i} className="h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />)}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">No comments yet — be the first.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <CommentRow
                  key={c._id}
                  comment={c}
                  canDelete={!!viewerId && (String(c.user?._id) === String(viewerId) || String(postedBy) === String(viewerId))}
                  onDelete={handleDelete}
                />
              ))}
              {hasMore && (
                <button
                  onClick={(e) => { e.stopPropagation(); load(page + 1); }}
                  disabled={loading}
                  className="btn-ghost w-full py-1.5 text-xs disabled:opacity-50"
                >
                  {loading ? 'Loading…' : 'Load more comments'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
