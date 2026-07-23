// RatingModal — rate a completed booking (Tier 3 C#1).
// Elevating to a public testimonial is opt-in here and still requires the other
// party to approve, which the checkbox copy makes explicit.
import { useState } from 'react';
import { submitBookingRating } from '../services/bookingRatings';

const MAX_COMMENT = 500;

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating out of 5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition-colors ${
            n <= value ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-400 dark:hover:text-zinc-500'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const RatingModal = ({ booking, otherParticipant, onClose, onSubmit }) => {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [elevate, setElevate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const name = otherParticipant?.name || 'your counterpart';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!score) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await submitBookingRating(booking._id, {
        score,
        comment: comment.trim(),
        elevateForPublicApproval: elevate
      });
      if (onSubmit) onSubmit(res.data, booking);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md">
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-zinc-200 dark:border-white/10">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              How was your session with {name}?
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your rating contributes to their trust score.
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

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              Overall rating <span className="text-zinc-400 dark:text-zinc-600">(required)</span>
            </label>
            <StarInput value={score} onChange={setScore} />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
              Comment <span className="text-zinc-400 dark:text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value.slice(0, MAX_COMMENT))}
              rows={3}
              maxLength={MAX_COMMENT}
              placeholder="What stood out about this meeting?"
              className="input-mono resize-none"
            />
            <div className="text-right text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">
              {comment.length}/{MAX_COMMENT}
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={elevate}
              onChange={e => setElevate(e.target.checked)}
              className="mt-0.5 accent-zinc-900 dark:accent-white"
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Share this as a public testimonial on their profile
              <span className="text-zinc-400 dark:text-zinc-600"> (they'll need to approve it).</span>
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-medium rounded-lg ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-600 dark:text-zinc-400 hover:ring-zinc-400 dark:hover:ring-zinc-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!score || submitting}
              className="flex-1 py-2 text-xs font-medium btn-mono rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
