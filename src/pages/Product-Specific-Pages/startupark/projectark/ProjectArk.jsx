import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { useProjectArk } from './useProjectArk';
import WorkPostCard from './WorkPostCard';
import TalentDirectory from './TalentDirectory';
import {
  MODE_LABELS, MODE_HINTS, MODE_ICONS,
  POST_TYPE_LABELS, POST_TYPE_HINTS,
  ROLE_TYPE_LABELS, ROLE_TYPE_ICONS,
} from './projectArkLabels';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'technology', label: 'Tech' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'content-creation', label: 'Content' },
  { value: 'photography', label: 'Photo' },
  { value: 'videography', label: 'Video' },
  { value: 'legal', label: 'Legal' },
  { value: 'finance', label: 'Finance' },
  { value: 'events', label: 'Events' },
  { value: 'food-catering', label: 'Food' },
  { value: 'education', label: 'Education' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'health', label: 'Health' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'trades', label: 'Trades' },
  { value: 'other', label: 'Other' },
];

// Hybrid category pattern: the first few stay as always-visible pills, the long tail
// moves into a "More categories" dropdown — avoids the horizontal-scroll cutoff/scrollbar
// issue entirely for a 16-category list. No usage analytics exist yet to rank these by
// popularity, so this is a fixed, sensible default order (All + the 4 broadest crafts).
const TOP_CATEGORIES = CATEGORIES.slice(0, 5); // All, Tech, Design, Marketing, Content
const MORE_CATEGORIES = CATEGORIES.slice(5);

// Compact, content-sized select — deliberately not `.input-mono` (which is w-full and
// meant for form fields), so filter dropdowns sit inline like pills instead of
// stretching to fill the row.
const SELECT_PILL = 'w-auto shrink-0 bg-zinc-900 border border-white/10 rounded-lg px-2.5 h-8 text-xs text-zinc-300 ' +
  'outline-none focus:border-zinc-500 [&>option]:bg-zinc-900 [&>option]:text-zinc-100';

const ROLE_TYPES = [
  { v: '', label: 'All' },
  { v: 'job', label: ROLE_TYPE_LABELS.job },
  { v: 'internship', label: ROLE_TYPE_LABELS.internship },
  { v: 'course', label: ROLE_TYPE_LABELS.course },
  { v: 'freelance', label: ROLE_TYPE_LABELS.freelance },
];

export default function ProjectArk() {
  const [searchParams] = useSearchParams();
  const { posts, pagination, loading, error, fetchPosts, fetchViewerContext, fetchStats } = useProjectArk();

  const [viewer, setViewer] = useState(null); // { role, startupId, userId } — authoritative, from server
  const [stats, setStats] = useState(null); // { total, projects, requirements }
  const isAuthenticated = !!localStorage.getItem('token');

  const initialMode = ['role', 'talent'].includes(searchParams.get('mode')) ? searchParams.get('mode') : 'gig';
  const [engagementMode, setEngagementMode] = useState(initialMode);
  const [activeType, setActiveType] = useState('');
  const [activeRoleType, setActiveRoleType] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchViewerContext().then(setViewer).catch(() => setViewer(null));
  }, [fetchViewerContext]);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, [fetchStats]);

  const doFetch = useCallback(() => {
    // The Talent Directory tab manages its own fetching (people, not WorkPosts).
    if (engagementMode === 'talent') return;
    fetchPosts({
      engagementMode,
      postType: engagementMode === 'gig' ? activeType : '',
      roleType: engagementMode === 'role' ? activeRoleType : '',
      category: activeCategory,
      workLocation,
      budgetType: engagementMode === 'gig' ? budgetType : '',
      q,
      page
    });
  }, [engagementMode, activeType, activeRoleType, activeCategory, workLocation, budgetType, q, page, fetchPosts]);

  useEffect(() => { doFetch(); }, [doFetch]);

  function switchMode(mode) {
    setEngagementMode(mode);
    setActiveType('');
    setActiveRoleType('');
    setBudgetType('');
    setPage(1);
  }

  function clearAll() {
    setActiveType(''); setActiveRoleType(''); setActiveCategory(''); setWorkLocation('');
    setBudgetType(''); setQ(''); setPage(1);
  }

  const hasFilter = activeType || activeRoleType || activeCategory || workLocation || budgetType || q;

  const isGig = engagementMode === 'gig';
  const isTalent = engagementMode === 'talent';
  const userRole = viewer?.role || 'user';

  // Role-aware primary CTA. Once authenticated, the server-derived role decides the
  // label/target — a startup always gets "Post a startup project", talent (user or
  // student) always gets "Post a talent request". Only when we genuinely don't know
  // who's asking (logged out) do we fall back to whatever sub-tab is active, so the
  // button still matches what the visitor is looking at. The Talent Directory tab has
  // no post action at all — profiles are edited on the existing student/user profile
  // pages, not created here.
  let postLabel, postType;
  if (!isGig && !isTalent) {
    postLabel = 'Post a Job / Internship';
    postType = 'role';
  } else if (isAuthenticated && userRole === 'startup') {
    postLabel = 'Post a Startup Project';
    postType = 'project';
  } else if (isAuthenticated) {
    postLabel = 'Post a Talent Request';
    postType = 'requirement';
  } else {
    postType = activeType === 'project' ? 'project' : 'requirement';
    postLabel = postType === 'project' ? 'Post a Startup Project' : 'Post a Talent Request';
  }

  const postHint = isGig
    ? (postType === 'project' ? `You need talent — ${POST_TYPE_HINTS.project}` : `You need a startup — ${POST_TYPE_HINTS.requirement}`)
    : 'Hire talent — post a job, internship, course, or freelance opening';
  // Jobs & Internships is startup-only; Projects mode is open to everyone (the label
  // above already routes each visitor to the right side of it); Talent Directory never posts.
  const canPost = !isTalent && (isGig || userRole === 'startup');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 ring-1 ring-zinc-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-300" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Project Ark</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {!isTalent && !loading && `${pagination.total} ${pagination.total === 1 ? 'listing' : 'listings'} live · `}
                {isTalent ? 'Browse skills & portfolios' : isGig ? 'Startups & talent, connected' : 'Jobs, internships, courses & freelance work'}
              </p>
            </div>
          </div>
          {canPost && (
            <Link to="/startupark/projectark/create" className="btn-mono text-sm px-4 py-2 shrink-0">
              + {postLabel}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 space-y-5">

        {/* Stat row — live counts pulled from the posts collection, not hardcoded */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Live listings', value: stats?.total },
            { label: 'Startup projects', value: stats?.projects },
            { label: 'Talent requests', value: stats?.requirements },
          ].map(stat => (
            <div key={stat.label} className="glass-card px-4 py-3">
              <div className="text-[11px] text-zinc-500">{stat.label}</div>
              <div className="text-2xl font-bold text-zinc-100 mt-0.5">
                {stat.value ?? <span className="inline-block w-6 h-5 rounded bg-zinc-800 animate-pulse align-middle" />}
              </div>
            </div>
          ))}
        </div>

        {/* Projects / Jobs / Talent Directory mode toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['gig', 'role', 'talent'].map(v => {
            const Icon = MODE_ICONS[v];
            return (
              <button
                key={v}
                onClick={() => switchMode(v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ring-1 transition-all ${
                  engagementMode === v
                    ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                    : 'ring-zinc-800 bg-zinc-900 text-zinc-400 hover:ring-zinc-600 hover:text-zinc-200'
                }`}
                title={MODE_HINTS[v]}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {MODE_LABELS[v]}
              </button>
            );
          })}
          <span className="text-[11px] text-zinc-600 hidden sm:inline ml-1">{MODE_HINTS[engagementMode]}</span>
        </div>

        {isTalent ? (
          <TalentDirectory />
        ) : (
        <>
        {/* Type tabs + search row */}
        <div className="glass-card p-4 space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search by title, skill, or keyword…"
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1); }}
                className="input-mono text-sm w-full pl-9 h-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`sm:hidden shrink-0 w-10 h-10 rounded-lg ring-1 flex items-center justify-center transition-all ${
                showFilters ? 'ring-zinc-400 bg-zinc-700' : 'ring-zinc-800 bg-zinc-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-zinc-300" strokeWidth={2} />
            </button>
          </div>

          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col gap-4`}>
            {/* Type toggle (gig mode) / Role type toggle (role mode) */}
            <div className="flex items-center gap-1 flex-wrap">
              {isGig ? (
                [
                  { v: '', label: 'All' },
                  { v: 'project', label: POST_TYPE_LABELS.project, sub: POST_TYPE_HINTS.project },
                  { v: 'requirement', label: POST_TYPE_LABELS.requirement, sub: POST_TYPE_HINTS.requirement },
                ].map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => { setActiveType(opt.v); setPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ring-1 transition-all ${
                      activeType === opt.v
                        ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                        : 'ring-zinc-800 bg-zinc-900 text-zinc-400 hover:ring-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {opt.label}
                    {opt.sub && <span className="text-zinc-500 font-normal hidden lg:inline">· {opt.sub}</span>}
                  </button>
                ))
              ) : (
                ROLE_TYPES.map(opt => {
                  const Icon = ROLE_TYPE_ICONS[opt.v];
                  return (
                    <button
                      key={opt.v}
                      onClick={() => { setActiveRoleType(opt.v); setPage(1); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ring-1 transition-all ${
                        activeRoleType === opt.v
                          ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                          : 'ring-zinc-800 bg-zinc-900 text-zinc-400 hover:ring-zinc-600 hover:text-zinc-200'
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" strokeWidth={2} />}
                      {opt.label}
                    </button>
                  );
                })
              )}
              {hasFilter && (
                <button onClick={clearAll} className="ml-auto btn-ghost text-xs px-3 py-1.5 flex items-center gap-1">
                  <X className="w-3 h-3" strokeWidth={2} /> Clear
                </button>
              )}
            </div>

            {/* Category — top pills + a dropdown for the long tail, so a 16-entry list
                never needs a scrollbar */}
            <div className="pt-3 border-t border-zinc-800/60 space-y-2">
              <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Category</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {TOP_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium ring-1 transition-all ${
                      activeCategory === cat.value
                        ? 'ring-zinc-300 bg-zinc-700 text-zinc-100'
                        : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:ring-zinc-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
                <select
                  value={MORE_CATEGORIES.some(c => c.value === activeCategory) ? activeCategory : ''}
                  onChange={e => { setActiveCategory(e.target.value); setPage(1); }}
                  className={`${SELECT_PILL} rounded-full`}
                >
                  <option value="">More categories</option>
                  {MORE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary filters — compact, content-sized selects (not full-width inputs) */}
            <div className="flex flex-wrap gap-2">
              <select
                value={workLocation}
                onChange={e => { setWorkLocation(e.target.value); setPage(1); }}
                className={SELECT_PILL}
              >
                <option value="">Any location</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {isGig && (
                <select
                  value={budgetType}
                  onChange={e => { setBudgetType(e.target.value); setPage(1); }}
                  className={SELECT_PILL}
                >
                  <option value="">Any budget</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                  <option value="equity">Equity</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Results header */}
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              {pagination.total} {pagination.total === 1 ? 'post' : 'posts'}
              {activeCategory ? ` in ${CATEGORIES.find(c => c.value === activeCategory)?.label}` : ''}
              {q ? ` matching "${q}"` : ''}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-inset p-4 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 space-y-3 animate-pulse">
                <div className="h-3 w-20 rounded bg-zinc-800" />
                <div className="h-4 w-full rounded bg-zinc-800" />
                <div className="h-3 w-3/4 rounded bg-zinc-800" />
                <div className="flex gap-1 pt-1">
                  {[1,2,3].map(j => <div key={j} className="h-5 w-16 rounded-full bg-zinc-800" />)}
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-inset flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-zinc-300 font-semibold text-base">
              No {isGig ? 'projects' : 'jobs'} posted yet
            </p>
            <p className="text-zinc-600 text-sm text-center max-w-xs">
              {canPost ? `Be the first to ${postLabel.toLowerCase()} and start connecting.` : postHint}
            </p>
            {canPost && (
              <Link to="/startupark/projectark/create" className="btn-mono text-sm px-5 py-2 mt-1">
                + {postLabel}
              </Link>
            )}
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
            >
              <AnimatePresence>
                {posts.map(post => (
                  <motion.div
                    key={post._id}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <WorkPostCard post={post} userRole={userRole} viewerId={viewer?.userId} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="btn-ghost text-xs px-4 py-2 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-xs text-zinc-500 px-2">
                  {page} / {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="btn-ghost text-xs px-4 py-2 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
        </>
        )}
      </div>
    </div>
  );
}
