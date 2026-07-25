import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTalentPosts } from './useTalentPosts';

export default function CreateTalentPost() {
  const navigate = useNavigate();
  const { talentPostId } = useParams();
  const isEdit = !!talentPostId;
  const { fetchTalentPost, createTalentPost, updateTalentPost } = useTalentPosts();

  const [form, setForm] = useState({
    headline: '',
    pitch: '',
    skillsRaw: '',
    availability: 'part-time',
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    fetchTalentPost(talentPostId)
      .then(post => setForm({
        headline: post.headline || '',
        pitch: post.pitch || '',
        skillsRaw: (post.skills || []).join(', '),
        availability: post.availability || 'part-time',
      }))
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [isEdit, talentPostId, fetchTalentPost]);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e, visibility) {
    e.preventDefault();
    if (!form.headline.trim()) { setError('Headline is required.'); return; }
    if (!form.pitch.trim()) { setError('Pitch is required.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        headline: form.headline.trim(),
        pitch: form.pitch.trim(),
        skills: form.skillsRaw.split(',').map(s => s.trim()).filter(Boolean),
        availability: form.availability,
        visibility,
      };
      const saved = isEdit ? await updateTalentPost(talentPostId, payload) : await createTalentPost(payload);
      navigate(`/startupark/students-hub/talent/${saved._id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/60 px-4 md:px-6 py-4 sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost text-xs px-3 py-1.5 shrink-0">← Back</button>
          <div>
            <h1 className="text-base font-bold">{isEdit ? 'Edit Talent Post' : 'Post Your Talent'}</h1>
            <p className="text-xs text-zinc-500">A short pitch startups see before inviting you directly</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-4">
        {error && (
          <div className="glass-inset p-3 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={e => handleSubmit(e, 'published')} className="space-y-4">
          <div className="glass-card p-4 space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Headline *</label>
            <input
              type="text"
              placeholder="e.g. Frontend developer who ships fast"
              value={form.headline}
              onChange={e => set('headline', e.target.value)}
              className="input-mono text-sm w-full mt-1"
              maxLength={120}
              required
            />
            <p className="text-[10px] text-zinc-600 text-right">{form.headline.length}/120</p>
          </div>

          <div className="glass-card p-4 space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Pitch *</label>
            <textarea
              rows={5}
              placeholder="What you're good at, what you're looking for, and why a startup should reach out…"
              value={form.pitch}
              onChange={e => set('pitch', e.target.value)}
              className="input-mono text-sm w-full resize-none mt-1"
              maxLength={2000}
              required
            />
            <p className="text-[10px] text-zinc-600 text-right">{form.pitch.length}/2000</p>
          </div>

          <div className="glass-card p-4 space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Skills</label>
            <input
              type="text"
              placeholder="React, Node.js, Figma  (comma-separated)"
              value={form.skillsRaw}
              onChange={e => set('skillsRaw', e.target.value)}
              className="input-mono text-sm w-full"
            />
            {form.skillsRaw && (
              <div className="flex flex-wrap gap-1 pt-1">
                {form.skillsRaw.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700">{s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4 space-y-2">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Availability</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { v: 'full-time', label: 'Full-time' },
                { v: 'part-time', label: 'Part-time' },
                { v: 'internship', label: 'Internship' },
                { v: 'freelance', label: 'Freelance' },
                { v: 'not-available', label: 'Not available' },
              ].map(a => (
                <button
                  key={a.v}
                  type="button"
                  onClick={() => set('availability', a.v)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium ring-1 transition-all ${
                    form.availability === a.v ? 'ring-zinc-400 bg-zinc-700 text-zinc-100' : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pb-8">
            <button type="button" onClick={e => handleSubmit(e, 'draft')} disabled={submitting} className="btn-ghost flex-1 py-3 text-sm disabled:opacity-50">
              Save Draft
            </button>
            <button type="submit" disabled={submitting} className="btn-mono flex-1 py-3 text-sm font-semibold disabled:opacity-50">
              {submitting ? 'Saving…' : isEdit ? 'Publish Changes' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
