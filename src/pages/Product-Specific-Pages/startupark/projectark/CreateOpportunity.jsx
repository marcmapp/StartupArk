import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from './useOpportunities';

const CATEGORIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
];

const SEL = 'input-mono text-sm w-full [&>option]:bg-zinc-900 [&>option]:text-zinc-100';

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const { createOpportunity } = useOpportunities();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: 'remote',
    type: 'job',
    internshipType: 'paid',
    price: '',
    salary: '',
    requirements: '',
    skillsRaw: '',
    perksRaw: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e, status) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.category) { setError('Please select a category.'); return; }
    if (form.type === 'course' && !form.price) { setError('Course price is required.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location,
        type: form.type,
        requirements: form.requirements,
        skills: form.skillsRaw.split(',').map(s => s.trim()).filter(Boolean),
        perks: form.perksRaw.split(',').map(s => s.trim()).filter(Boolean),
        deadline: form.deadline || undefined,
        salary: form.salary.trim(),
        status,
      };
      if (form.type === 'internship') payload.internshipType = form.internshipType;
      if (form.type === 'course') payload.price = Number(form.price);

      await createOpportunity(payload);
      navigate('/startupark/projectark?mode=opportunity');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/60 px-4 md:px-6 py-4 sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-2xl lg:max-w-[1600px] mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost text-xs px-3 py-1.5 shrink-0">← Back</button>
          <div>
            <h1 className="text-base font-bold">Post an Opportunity</h1>
            <p className="text-xs text-zinc-500">Standalone job, internship, course, or freelance opening — not tied to a project</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl lg:max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-4">
        {error && (
          <div className="glass-inset p-3 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={e => handleSubmit(e, 'active')} className="space-y-4">
          {/* Type */}
          <div className="glass-card p-4 space-y-2">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { v: 'job', label: 'Job' },
                { v: 'internship', label: 'Internship' },
                { v: 'course', label: 'Course' },
                { v: 'freelance', label: 'Freelance' },
              ].map(t => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => set('type', t.v)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium ring-1 transition-all ${
                    form.type === t.v ? 'ring-zinc-400 bg-zinc-700 text-zinc-100' : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {form.type === 'internship' && (
              <div className="space-y-1 pt-1">
                <label className="text-xs text-zinc-500">Internship Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'paid', label: 'Paid' },
                    { v: 'unpaid', label: 'Unpaid' },
                    { v: 'stipend', label: 'Stipend' },
                  ].map(it => (
                    <button
                      key={it.v}
                      type="button"
                      onClick={() => set('internshipType', it.v)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium ring-1 transition-all ${
                        form.internshipType === it.v ? 'ring-zinc-400 bg-zinc-700 text-zinc-100' : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.type === 'course' && (
              <div className="space-y-1 pt-1">
                <label className="text-xs text-zinc-500">Course Price (₹) *</label>
                <input
                  type="number" min="0" placeholder="e.g. 4999"
                  value={form.price} onChange={e => set('price', e.target.value)}
                  className="input-mono text-sm w-full" required
                />
              </div>
            )}

            {form.type !== 'course' && (
              <div className="space-y-1 pt-1">
                <label className="text-xs text-zinc-500">Salary / Compensation</label>
                <input
                  type="text" placeholder="e.g. ₹6-10 LPA / Not disclosed"
                  value={form.salary} onChange={e => set('salary', e.target.value)}
                  className="input-mono text-sm w-full"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="glass-card p-4 space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Title *</label>
            <input
              type="text" placeholder="e.g. Backend Engineer" value={form.title}
              onChange={e => set('title', e.target.value)} className="input-mono text-sm w-full mt-1"
              maxLength={120} required
            />
          </div>

          {/* Description */}
          <div className="glass-card p-4 space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Description *</label>
            <textarea
              rows={5} placeholder="Describe the opportunity — scope, expectations, and context…"
              value={form.description} onChange={e => set('description', e.target.value)}
              className="input-mono text-sm w-full resize-none mt-1" required
            />
          </div>

          {/* Category + Location */}
          <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={SEL} required>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Location</label>
              <select value={form.location} onChange={e => set('location', e.target.value)} className={SEL}>
                <option value="remote">🌐 Remote</option>
                <option value="onsite">📍 On-site</option>
                <option value="hybrid">⇌ Hybrid</option>
              </select>
            </div>
          </div>

          {/* Requirements + Skills */}
          <div className="glass-card p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Requirements</label>
              <textarea
                rows={3} placeholder="List the requirements…" value={form.requirements}
                onChange={e => set('requirements', e.target.value)} className="input-mono text-sm w-full resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Skills</label>
              <input
                type="text" placeholder="React, Node.js, Figma  (comma-separated)" value={form.skillsRaw}
                onChange={e => set('skillsRaw', e.target.value)} className="input-mono text-sm w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Perks</label>
              <input
                type="text" placeholder="Flexible hours, Health insurance  (comma-separated)" value={form.perksRaw}
                onChange={e => set('perksRaw', e.target.value)} className="input-mono text-sm w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Deadline</label>
              <input
                type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                className="input-mono text-sm w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button type="button" onClick={e => handleSubmit(e, 'draft')} disabled={submitting} className="btn-ghost flex-1 py-3 text-sm disabled:opacity-50">
              Save Draft
            </button>
            <button type="submit" disabled={submitting} className="btn-mono flex-1 py-3 text-sm font-semibold disabled:opacity-50">
              {submitting ? 'Posting…' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
