import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectArk } from './useProjectArk';
import RequiredPositionsEditor from './RequiredPositionsEditor';
import { POST_TYPE_LABELS, POST_TYPE_HINTS } from './projectArkLabels';

const CATEGORIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'design', label: 'Design' },
  { value: 'photography', label: 'Photography' },
  { value: 'videography', label: 'Videography' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'content-creation', label: 'Content Creation' },
  { value: 'legal', label: 'Legal' },
  { value: 'finance', label: 'Finance & Accounting' },
  { value: 'events', label: 'Events Management' },
  { value: 'food-catering', label: 'Food & Catering' },
  { value: 'education', label: 'Education & Coaching' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'entertainment', label: 'Music & Entertainment' },
  { value: 'trades', label: 'Trades & Maintenance' },
  { value: 'other', label: 'Other' },
];

const SEL = 'input-mono text-sm w-full [&>option]:bg-zinc-900 [&>option]:text-zinc-100';

export default function CreateWorkPost() {
  const navigate = useNavigate();
  const { createPost, fetchViewerContext } = useProjectArk();
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    fetchViewerContext().then(setViewer).catch(() => setViewer({ role: 'user' }));
  }, [fetchViewerContext]);

  const userRole = viewer?.role || 'user';

  // postType is locked to role — startups post projects, users/students post requirements
  const lockedPostType = userRole === 'startup' ? 'project' : 'requirement';

  // Only startups may choose engagementMode; everyone else is always 'gig'
  const [engagementMode, setEngagementMode] = useState('gig');
  const isRole = userRole === 'startup' && engagementMode === 'role';
  const [positions, setPositions] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    workType: 'one-time',
    workLocation: 'remote',
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    estimatedDuration: '',
    deadline: '',
    requiredSkillsRaw: '',
    preferredExperience: '',
    roleType: 'job',
    internshipType: 'paid',
    perksRaw: '',
    price: '',
    salaryText: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.category) { setError('Please select a category.'); return; }
    if (isRole && form.roleType === 'course' && !form.price) { setError('Course price is required.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        postType: lockedPostType,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        workLocation: form.workLocation,
        deadline: form.deadline || undefined,
        preferredExperience: form.preferredExperience,
        requiredSkills: form.requiredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (userRole === 'startup' && lockedPostType === 'project') {
        payload.requiredPositions = positions;
      }

      if (isRole) {
        payload.engagementMode = 'role';
        payload.roleType = form.roleType;
        if (form.roleType === 'internship') payload.internshipType = form.internshipType;
        if (form.roleType === 'course') payload.price = Number(form.price);
        payload.salaryText = form.salaryText.trim();
        payload.perks = form.perksRaw.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        payload.workType = form.workType;
        payload.budgetType = form.budgetType;
        payload.budgetMin = form.budgetMin ? Number(form.budgetMin) : 0;
        payload.budgetMax = form.budgetMax ? Number(form.budgetMax) : 0;
        payload.estimatedDuration = form.estimatedDuration;
      }

      await createPost(payload);
      navigate(`/startupark/projectark`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const showBudget = form.budgetType !== 'volunteer' && form.budgetType !== 'equity' && form.budgetType !== 'negotiable';

  const roleLabel = userRole === 'startup' ? 'Startup' : userRole === 'student' ? 'Student' : 'User';
  const postTypeLabel = isRole ? 'Job / Internship' : POST_TYPE_LABELS[lockedPostType];
  const postTypeDesc = isRole
    ? 'Post a job, internship, course, or freelance opening — applicants will submit a resume'
    : (lockedPostType === 'project'
      ? `You need talent — ${POST_TYPE_HINTS.project}, applicants submit proposals`
      : `You need a startup — ${POST_TYPE_HINTS.requirement}, startups will pitch to you`);

  if (!viewer) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800/60 px-4 md:px-6 py-4 sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost text-xs px-3 py-1.5 shrink-0">← Back</button>
          <div>
            <h1 className="text-base font-bold">Post {postTypeLabel}</h1>
            <p className="text-xs text-zinc-500">{postTypeDesc}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-4">

        {/* Gig / Role selector — startups only */}
        {userRole === 'startup' && (
          <div className="glass-card p-4 space-y-2">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Posting Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'gig', label: 'Project', sub: 'proposals & milestones' },
                { v: 'role', label: 'Job / Internship', sub: 'jobs, internships, courses' },
              ].map(m => (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setEngagementMode(m.v)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium ring-1 transition-all text-left ${
                    engagementMode === m.v
                      ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                      : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-[10px] opacity-70 font-normal">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Post type pill */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full ring-1 ring-zinc-700 bg-zinc-800/70 text-zinc-300 tracking-wider">
            {postTypeLabel.toUpperCase()}
          </span>
          <span className="text-xs text-zinc-500">Posting as <span className="text-zinc-300">{roleLabel}</span></span>
        </div>

        {/* Required Positions — startups building a project can list who they need */}
        {userRole === 'startup' && lockedPostType === 'project' && (
          <RequiredPositionsEditor positions={positions} onChange={setPositions} />
        )}

        {error && (
          <div className="glass-inset p-3 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="glass-card p-4 space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Title *</label>
            <input
              type="text"
              placeholder={isRole
                ? 'e.g. Frontend Engineer Intern'
                : lockedPostType === 'project'
                  ? 'e.g. Need a React developer for 3-month project'
                  : 'e.g. Looking for a branding startup for our product launch'}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="input-mono text-sm w-full mt-1"
              maxLength={120}
              required
            />
            <p className="text-[10px] text-zinc-600 text-right">{form.title.length}/120</p>
          </div>

          {/* Description */}
          <div className="glass-card p-4 space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Description *</label>
            <textarea
              rows={5}
              placeholder="Describe the work in detail — scope, deliverables, context, and any constraints…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="input-mono text-sm w-full resize-none mt-1"
              required
            />
          </div>

          {/* Category + Work Location */}
          <div className="glass-card p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={SEL} required>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Work Mode</label>
                <select value={form.workLocation} onChange={e => set('workLocation', e.target.value)} className={SEL}>
                  <option value="remote">🌐 Remote</option>
                  <option value="onsite">📍 On-site</option>
                  <option value="hybrid">⇌ Hybrid</option>
                </select>
              </div>
            </div>

            {!isRole && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Work Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { v: 'one-time', label: 'One-time' },
                    { v: 'ongoing', label: 'Ongoing' },
                    { v: 'part-time', label: 'Part-time' },
                    { v: 'contract', label: 'Contract' },
                  ].map(wt => (
                    <button
                      key={wt.v}
                      type="button"
                      onClick={() => set('workType', wt.v)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium ring-1 transition-all ${
                        form.workType === wt.v
                          ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                          : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {wt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isRole ? (
            <>
              {/* Role Type */}
              <div className="glass-card p-4 space-y-3">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Role Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { v: 'job', label: 'Job' },
                    { v: 'internship', label: 'Internship' },
                    { v: 'course', label: 'Course' },
                    { v: 'freelance', label: 'Freelance' },
                  ].map(rt => (
                    <button
                      key={rt.v}
                      type="button"
                      onClick={() => set('roleType', rt.v)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium ring-1 transition-all ${
                        form.roleType === rt.v
                          ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                          : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>

                {form.roleType === 'internship' && (
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
                            form.internshipType === it.v
                              ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                              : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                          }`}
                        >
                          {it.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.roleType === 'course' && (
                  <div className="space-y-1 pt-1">
                    <label className="text-xs text-zinc-500">Course Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 4999"
                      value={form.price}
                      onChange={e => set('price', e.target.value)}
                      className="input-mono text-sm w-full"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  <label className="text-xs text-zinc-500">Salary / Compensation</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹6-10 LPA / Not disclosed"
                    value={form.salaryText}
                    onChange={e => set('salaryText', e.target.value)}
                    className="input-mono text-sm w-full"
                  />
                </div>
              </div>

              {/* Perks */}
              <div className="glass-card p-4 space-y-1">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Perks</label>
                <input
                  type="text"
                  placeholder="Flexible hours, Health insurance, Certificate  (comma-separated)"
                  value={form.perksRaw}
                  onChange={e => set('perksRaw', e.target.value)}
                  className="input-mono text-sm w-full"
                />
                {form.perksRaw && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {form.perksRaw.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Budget */
            <div className="glass-card p-4 space-y-3">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Budget</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { v: 'fixed', label: 'Fixed' },
                  { v: 'hourly', label: 'Hourly' },
                  { v: 'equity', label: 'Equity' },
                  { v: 'volunteer', label: 'Volunteer' },
                  { v: 'negotiable', label: 'Negotiate' },
                ].map(bt => (
                  <button
                    key={bt.v}
                    type="button"
                    onClick={() => set('budgetType', bt.v)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium ring-1 transition-all ${
                      form.budgetType === bt.v
                        ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                        : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>

              {showBudget && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Min (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      min="0"
                      value={form.budgetMin}
                      onChange={e => set('budgetMin', e.target.value)}
                      className="input-mono text-sm w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Max (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20000"
                      min="0"
                      value={form.budgetMax}
                      onChange={e => set('budgetMax', e.target.value)}
                      className="input-mono text-sm w-full"
                    />
                  </div>
                </div>
              )}

              {form.budgetType === 'volunteer' && (
                <p className="text-xs text-zinc-500 bg-zinc-900 rounded-lg px-3 py-2">
                  Volunteer posts are unpaid — great for portfolio building and community work.
                </p>
              )}
              {form.budgetType === 'equity' && (
                <p className="text-xs text-zinc-500 bg-zinc-900 rounded-lg px-3 py-2">
                  Equity-based — clearly describe the stake offered in your description.
                </p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isRole && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Est. Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 3 weeks, 2 months"
                  value={form.estimatedDuration}
                  onChange={e => set('estimatedDuration', e.target.value)}
                  className="input-mono text-sm w-full"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                className="input-mono text-sm w-full"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Required Skills</label>
              <input
                type="text"
                placeholder="React, Node.js, Figma  (comma-separated)"
                value={form.requiredSkillsRaw}
                onChange={e => set('requiredSkillsRaw', e.target.value)}
                className="input-mono text-sm w-full"
              />
              {form.requiredSkillsRaw && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {form.requiredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Preferred Experience</label>
              <input
                type="text"
                placeholder="e.g. 2+ years in product design, prior startup experience preferred"
                value={form.preferredExperience}
                onChange={e => set('preferredExperience', e.target.value)}
                className="input-mono text-sm w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-ghost flex-1 py-3 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-mono flex-1 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? 'Posting…' : `Post ${postTypeLabel}`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
