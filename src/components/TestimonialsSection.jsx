// TestimonialsSection — public testimonials on a profile (Tier 3 C#1).
// Shows approved booking testimonials and public ProjectArk engagement ratings
// together; the chip is the only thing that distinguishes them.
import { useState, useEffect } from 'react';
import { fetchTestimonials } from '../services/bookingRatings';
import { getImageUrl } from '../utils/imageUrls';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const PREVIEW_COUNT = 6;

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

const Stars = ({ score }) => (
  <span className="text-amber-400 text-sm" aria-label={`${score} out of 5`}>
    {'★'.repeat(score)}
    <span className="text-zinc-300 dark:text-zinc-700">{'★'.repeat(5 - score)}</span>
  </span>
);

const TestimonialCard = ({ item }) => {
  const avatar = getImageUrl(item.rater?.profilePicture, baseUrl);
  return (
    <div className="glass-inset p-4 rounded-xl">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Stars score={item.score} />
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
          {item.contextType === 'booking' ? 'from a booking' : 'from a ProjectArk engagement'}
        </span>
      </div>

      {item.comment && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 whitespace-pre-line">
          {item.comment}
        </p>
      )}

      <div className="flex items-center gap-2">
        {avatar ? (
          <img src={avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 dark:text-zinc-400">
            {(item.rater?.username || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {item.rater?.username || 'Anonymous'}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
          · {relativeDate(item.createdAt)}
        </span>
      </div>
    </div>
  );
};

const TestimonialsSection = ({ userId }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!userId) { setLoading(false); return; }

    setLoading(true);
    fetchTestimonials(userId)
      .then(data => { if (!cancelled) setTestimonials(data); })
      .catch(err => { if (!cancelled) console.error('Failed to load testimonials:', err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  // An empty testimonial list is not worth a section header.
  if (loading || testimonials.length === 0) return null;

  const visible = showAll ? testimonials : testimonials.slice(0, PREVIEW_COUNT);

  return (
    <section className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Testimonials
          <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {testimonials.length}
          </span>
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map(item => <TestimonialCard key={item._id} item={item} />)}
      </div>

      {testimonials.length > PREVIEW_COUNT && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          {showAll ? 'Show less' : `Show all ${testimonials.length}`}
        </button>
      )}
    </section>
  );
};

export default TestimonialsSection;
