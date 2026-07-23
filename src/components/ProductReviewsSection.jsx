// ProductReviewsSection — click-gated, self-reported product reviews (Tier 3 C#2).
// Unlike TestimonialsSection (keyed by userId, approved-only), this is keyed
// by productId and shows every review immediately (products default to public
// visibility — no elevation handshake). Kept separate from TestimonialsSection
// rather than forked into it: the two query fundamentally different things
// (reviews of a product vs. testimonials about a person).
import { useState, useEffect, useCallback } from 'react';
import {
  fetchProductReviews, fetchReviewEligibility, submitProductReview, respondToReview
} from '../services/productRatings';
import { getImageUrl } from '../utils/imageUrls';

const MAX_REVIEW = 1000;
const MAX_RESPONSE = 1000;

function getCurrentUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u._id || u.id;
  } catch { return null; }
}

const relativeDate = (value) => {
  const days = Math.floor((Date.now() - new Date(value)) / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

function Stars({ score }) {
  return (
    <span className="text-amber-400 text-sm" aria-label={`${score} out of 5`}>
      {'★'.repeat(score)}
      <span className="text-zinc-300 dark:text-zinc-700">{'★'.repeat(5 - score)}</span>
    </span>
  );
}

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

function OwnerReplyForm({ ratingId, onSubmitted }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:underline">
        Reply as the product owner
      </button>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await respondToReview(ratingId, text.trim());
      onSubmitted(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX_RESPONSE))}
        rows={2}
        maxLength={MAX_RESPONSE}
        placeholder="Reply to this review…"
        className="input-mono w-full text-xs resize-none"
        autoFocus
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:underline">Cancel</button>
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="text-xs font-medium btn-mono px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting…' : 'Post reply'}
        </button>
      </div>
    </form>
  );
}

function ReviewCard({ review, isOwner, onOwnerResponseSubmitted }) {
  const avatar = getImageUrl(review.ratedBy?.profilePicture);
  return (
    <div className="glass-inset p-4 rounded-xl">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Stars score={review.overallScore} />
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{relativeDate(review.createdAt)}</span>
      </div>

      {review.review && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 whitespace-pre-line">{review.review}</p>
      )}

      <div className="flex items-center gap-2">
        {avatar ? (
          <img src={avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 dark:text-zinc-400">
            {(review.ratedBy?.username || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{review.ratedBy?.username || 'Anonymous'}</span>
      </div>

      {review.ownerResponse?.text ? (
        <div className="mt-3 ml-3 pl-3 border-l-2 border-zinc-300 dark:border-zinc-700">
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
            Response from the team
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-line">{review.ownerResponse.text}</p>
        </div>
      ) : isOwner ? (
        <OwnerReplyForm ratingId={review._id} onSubmitted={onOwnerResponseSubmitted} />
      ) : null}
    </div>
  );
}

const ProductReviewsSection = ({ productId, productOwnerId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null); // { alreadyRated, eligible } | null
  const [formOpen, setFormOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentUserId = getCurrentUserId();
  const isOwner = !!currentUserId && !!productOwnerId && String(currentUserId) === String(productOwnerId);
  const isLoggedIn = !!localStorage.getItem('token');

  const load = useCallback(() => {
    if (!productId) return;
    setLoading(true);
    fetchProductReviews(productId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));

    if (isLoggedIn) {
      fetchReviewEligibility(productId).then(setEligibility).catch(() => setEligibility(null));
    }
  }, [productId, isLoggedIn]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!score) return;
    setSubmitting(true);
    setError('');
    try {
      await submitProductReview(productId, { score, review: text.trim() });
      setFormOpen(false);
      setScore(0);
      setText('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOwnerResponse = (updatedRating) => {
    setReviews(prev => prev.map(r => (r._id === updatedRating._id ? updatedRating : r)));
  };

  return (
    <section className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">{reviews.length}</span>
          )}
        </h2>
      </div>

      {/* Write-a-review affordance */}
      {isLoggedIn && !isOwner && eligibility && !eligibility.alreadyRated && (
        eligibility.eligible ? (
          formOpen ? (
            <form onSubmit={handleSubmit} className="glass-inset p-4 rounded-xl space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  Your rating <span className="text-zinc-400 dark:text-zinc-600">(required)</span>
                </label>
                <StarInput value={score} onChange={setScore} />
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, MAX_REVIEW))}
                rows={3}
                maxLength={MAX_REVIEW}
                placeholder="What did you think?"
                className="input-mono w-full resize-none text-sm"
              />
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setFormOpen(false)} className="flex-1 py-2 text-xs font-medium rounded-lg ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-600 dark:text-zinc-400">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!score || submitting}
                  className="flex-1 py-2 text-xs font-medium btn-mono rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setFormOpen(true)} className="btn-ghost text-xs px-4 py-2">
              Write a review
            </button>
          )
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 glass-inset px-3 py-2 rounded-lg">
            Visit the product first to leave a review.
          </p>
        )
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-600">No reviews yet.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {reviews.map(review => (
          <ReviewCard
            key={review._id}
            review={review}
            isOwner={isOwner}
            onOwnerResponseSubmitted={handleOwnerResponse}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductReviewsSection;
