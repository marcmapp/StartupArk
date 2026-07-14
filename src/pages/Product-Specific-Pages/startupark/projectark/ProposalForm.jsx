import React, { useState } from 'react';

export default function ProposalForm({ post, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    coverNote: '',
    proposedBudget: '',
    proposedTimeline: '',
    portfolioLinks: ''
  });
  const [err, setErr] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (err) setErr('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.coverNote.trim()) { setErr('Cover note is required'); return; }

    const payload = {
      workPostId: post._id,
      coverNote: form.coverNote.trim(),
      proposedBudget: form.proposedBudget ? parseFloat(form.proposedBudget) : undefined,
      proposedTimeline: form.proposedTimeline.trim() || undefined,
      portfolioLinks: form.portfolioLinks
        ? form.portfolioLinks.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    try {
      await onSubmit(payload);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800/60">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Submit Proposal</h2>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{post.title}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Cover Note <span className="text-zinc-600">(required)</span>
            </label>
            <textarea
              value={form.coverNote}
              onChange={e => set('coverNote', e.target.value)}
              rows={5}
              maxLength={3000}
              placeholder="Describe your approach, relevant experience, and why you're a great fit..."
              className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="text-right text-[10px] text-zinc-600 mt-1">{form.coverNote.length}/3000</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Proposed Budget (₹)</label>
              <input
                type="number"
                value={form.proposedBudget}
                onChange={e => set('proposedBudget', e.target.value)}
                min={0}
                placeholder="e.g. 50000"
                className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Proposed Timeline</label>
              <input
                type="text"
                value={form.proposedTimeline}
                onChange={e => set('proposedTimeline', e.target.value)}
                placeholder="e.g. 2 weeks"
                className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Portfolio Links <span className="text-zinc-600">(comma-separated)</span></label>
            <input
              type="text"
              value={form.portfolioLinks}
              onChange={e => set('portfolioLinks', e.target.value)}
              placeholder="https://yourportfolio.com, https://github.com/you"
              className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {err && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">{err}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-medium rounded-lg ring-1 ring-zinc-700 text-zinc-400 hover:ring-zinc-500 hover:text-zinc-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-xs font-medium btn-mono rounded-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
