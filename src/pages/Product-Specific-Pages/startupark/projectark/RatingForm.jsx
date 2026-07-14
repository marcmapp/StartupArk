import React, { useState } from 'react';
import { useProjectArk } from './useProjectArk';

const DIMENSIONS = [
  { key: 'communication', label: 'Communication' },
  { key: 'quality', label: 'Quality of Work' },
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'professionalism', label: 'Professionalism' },
];

function StarRow({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-lg leading-none transition-colors ${n <= value ? 'text-amber-400' : 'text-zinc-700 hover:text-zinc-500'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function RatingForm({ engagementId, onClose, onSuccess }) {
  const { submitRating } = useProjectArk();
  const [overallScore, setOverallScore] = useState(0);
  const [dimensions, setDimensions] = useState({ communication: 0, quality: 0, timeliness: 0, professionalism: 0 });
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  function setDim(key, val) {
    setDimensions(d => ({ ...d, [key]: val }));
    if (err) setErr('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!overallScore) { setErr('Please give an overall rating'); return; }

    setSubmitting(true);
    try {
      await submitRating({
        engagementId,
        overallScore,
        dimensions,
        review: review.trim() || undefined
      });
      setDone(true);
      if (onSuccess) onSuccess();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-zinc-100">Rate & Review</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">×</button>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center space-y-3">
            <div className="text-2xl">★</div>
            <p className="text-sm font-medium text-zinc-200">Rating submitted!</p>
            <p className="text-xs text-zinc-500">Your trust score will be updated shortly.</p>
            <button onClick={onClose} className="btn-mono px-4 py-2 text-xs mt-2">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Overall */}
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Overall Rating <span className="text-zinc-600">(required)</span></label>
              <StarRow value={overallScore} onChange={setOverallScore} />
            </div>

            {/* Dimensions */}
            <div className="space-y-3">
              {DIMENSIONS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 w-32">{label}</span>
                  <StarRow value={dimensions[key]} onChange={v => setDim(key, v)} />
                </div>
              ))}
            </div>

            {/* Review */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Written Review <span className="text-zinc-600">(optional)</span></label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Share your experience working together..."
                className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
              />
              <div className="text-right text-[10px] text-zinc-600 mt-1">{review.length}/1000</div>
            </div>

            {err && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">{err}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-medium rounded-lg ring-1 ring-zinc-700 text-zinc-400 hover:ring-zinc-500 hover:text-zinc-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 text-xs font-medium btn-mono rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
