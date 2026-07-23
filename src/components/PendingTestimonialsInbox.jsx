// PendingTestimonialsInbox — approve or decline testimonials about you.
// The second half of the two-sided opt-in: the rater asked to publish, this is
// where the subject decides (Tier 3 C#1).
import { useState, useEffect, useCallback } from 'react';
import {
  fetchPendingElevations, approveElevation, declineElevation
} from '../services/bookingRatings';
import { getImageUrl } from '../utils/imageUrls';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const Stars = ({ score }) => (
  <span className="text-amber-400 text-sm" aria-label={`${score} out of 5`}>
    {'★'.repeat(score)}
    <span className="text-zinc-300 dark:text-zinc-700">{'★'.repeat(5 - score)}</span>
  </span>
);

const PendingTestimonialsInbox = ({ onClose, onResolved, focusRatingId }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPending(await fetchPendingElevations());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (ratingId, approve) => {
    setBusyId(ratingId);
    setError('');
    try {
      await (approve ? approveElevation(ratingId) : declineElevation(ratingId));
      setPending(prev => prev.filter(r => r._id !== ratingId));
      if (onResolved) onResolved(approve);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  // A deep link from a notification floats that one to the top.
  const ordered = focusRatingId
    ? [...pending].sort((a, b) => (a._id === focusRatingId ? -1 : b._id === focusRatingId ? 1 : 0))
    : pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-zinc-200 dark:border-white/10">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Testimonials awaiting your approval
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Only what you approve becomes visible on your profile.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 py-8">Loading…</p>
          ) : ordered.length === 0 ? (
            <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 py-8">
              Nothing awaiting approval.
            </p>
          ) : (
            ordered.map(rating => {
              const avatar = getImageUrl(rating.ratedBy?.profilePicture, baseUrl);
              const busy = busyId === rating._id;
              return (
                <div key={rating._id} className="glass-inset p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    {avatar ? (
                      <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[11px] text-zinc-500 dark:text-zinc-400">
                        {(rating.ratedBy?.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {rating.ratedBy?.username || 'Anonymous'}
                    </span>
                    <span className="ml-auto"><Stars score={rating.overallScore} /></span>
                  </div>

                  {rating.review && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 whitespace-pre-line">
                      {rating.review}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      disabled={busy}
                      onClick={() => decide(rating._id, true)}
                      className="flex-1 py-2 text-xs font-medium btn-mono rounded-lg disabled:opacity-50"
                    >
                      {busy ? 'Saving…' : 'Approve — show publicly'}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => decide(rating._id, false)}
                      className="flex-1 py-2 text-xs font-medium rounded-lg ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-600 dark:text-zinc-400 hover:ring-zinc-400 dark:hover:ring-zinc-500 transition-all disabled:opacity-50"
                    >
                      Decline — keep private
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingTestimonialsInbox;
