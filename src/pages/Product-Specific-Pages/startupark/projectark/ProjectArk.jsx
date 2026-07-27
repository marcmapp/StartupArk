import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { useProjectArk } from './useProjectArk';
import WorkPostCard from './WorkPostCard';
import OpportunityBoard from './OpportunityBoard';
import { TAB_LABELS, TAB_HINTS, TAB_ICONS } from './projectArkLabels';

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

const SELECT_PILL = 'w-auto shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 h-8 text-xs text-zinc-700 dark:text-zinc-300 ' +
  'outline-none focus:border-zinc-400 dark:focus:border-zinc-500 [&>option]:bg-white dark:[&>option]:bg-zinc-900 [&>option]:text-zinc-900 dark:[&>option]:text-zinc-100';

const PILL_ACTIVE = 'ring-transparent bg-zinc-900 text-white dark:bg-white dark:text-zinc-900';
const PILL_INACTIVE = 'ring-1 ring-black/10 dark:ring-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 hover:ring-black/20 dark:hover:ring-white/20 hover:text-zinc-700 dark:hover:text-zinc-200';

export default function ProjectArk() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { posts, pagination, loading, error, fetchPosts, fetchViewerContext, fetchStats } = useProjectArk();

  const [viewer, setViewer] = useState(null); // { role, startupId, userId } — authoritative, from server
  const [stats, setStats] = useState(null); // { total, projects, requirements }
  const isAuthenticated = !!localStorage.getItem('token');

  // The Talent Directory mode moved to the Students Hub page (C#8) — send anyone
  // still landing here with the old ?mode=talent shortcut (e.g. the startup nav
  // item, or a bookmark) straight there instead of silently falling back to gig
  // mode and losing their ?type filter.
  useEffect(() => {
    if (searchParams.get('mode') === 'talent') {
      const type = searchParams.get('type');
      navigate(`/startupark/students-hub?tab=students${type ? `&type=${type}` : ''}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only ?mode=opportunity is a real deep-link target now — ?mode=role/gig
  // used to pick a sub-tab that no longer exists; Projects is a single feed.
  const [activeTab, setActiveTab] = useState(searchParams.get('mode') === 'opportunity' ? 'opportunity' : 'projects');
  const [activeCategory, setActiveCategory] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchViewerContext().then(setViewer).catch(() => setViewer(null));
  }, [fetchViewerContext]);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, [fetchStats]);

  const isProjects = activeTab === 'projects';
  const isOpportunity = activeTab === 'opportunity';

  const doFetch = useCallback(() => {
    // The Opportunities tab manages its own fetching (standalone Opportunity
    // records, not WorkPosts) — see OpportunityBoard. Projects deliberately
    // omits engagementMode/postType/roleType/budgetType/workLocation filters —
    // it's one feed now; each card shows its own type via a badge.
    if (!isProjects) return;
    fetchPosts({ category: activeCategory, q, page });
  }, [isProjects, activeCategory, q, page, fetchPosts]);

  useEffect(() => { doFetch(); }, [doFetch]);

  function switchTab(tab) {
    setActiveTab(tab);
    setActiveCategory('');
    setQ('');
    setPage(1);
  }

  const userRole = viewer?.role || 'user';

  // Role-aware primary CTA. A startup can post either a project or a job/internship
  // — that choice lives inside CreateWorkPost's own mode picker, not here, so this
  // page doesn't need to know about it. Everyone else pitches themselves.
  let postLabel, postHref;
  if (isOpportunity) {
    postLabel = 'Post an Opportunity';
    postHref = '/startupark/projectark/opportunities/create';
  } else if (isAuthenticated && userRole === 'startup') {
    postLabel = 'Post a Project';
    postHref = '/startupark/projectark/create';
  } else if (isAuthenticated) {
    postLabel = 'Pitch Yourself to Startups';
    postHref = '/startupark/projectark/create';
  } else {
    postLabel = 'Post a Project';
    postHref = '/startupark/projectark/create';
  }
  // Opportunities are startup-only; Projects is open to everyone.
  const canPost = isProjects || userRole === 'startup';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10 px-4 md:px-6 py-4">
        <div className="max-w-6xl lg:max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] ring-1 ring-black/10 dark:ring-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-300" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Project Ark</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isOpportunity ? 'Standalone jobs, internships, courses & freelance work' : 'Startup projects, pitches & jobs, connected'}
              </p>
            </div>
          </div>
          {canPost && (
            <Link to={postHref} className="btn-mono text-sm px-4 py-2 shrink-0">
              + {postLabel}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl lg:max-w-[1600px] mx-auto px-4 md:px-6 py-5 space-y-5">

        {/* Primary tabs: Projects | Opportunities — the only toggle on this page */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['projects', 'opportunity'].map(v => {
            const Icon = TAB_ICONS[v];
            return (
              <button
                key={v}
                onClick={() => switchTab(v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === v ? PILL_ACTIVE : PILL_INACTIVE
                }`}
                title={TAB_HINTS[v]}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {TAB_LABELS[v]}
              </button>
            );
          })}
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600 hidden sm:inline ml-1">{TAB_HINTS[activeTab]}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            {isOpportunity ? (
              <OpportunityBoard userRole={userRole} viewerStartupId={viewer?.startupId} />
            ) : (
              <>
                {/* Stat row — live counts pulled from the posts collection */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Live listings', value: stats?.total },
                    { label: 'Startup projects', value: stats?.projects },
                    { label: 'Startup pitches', value: stats?.requirements },
                  ].map(stat => (
                    <div key={stat.label} className="glass-card px-4 py-3">
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{stat.label}</div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
                        {stat.value ?? <span className="inline-block w-6 h-5 rounded bg-black/[0.06] dark:bg-white/10 animate-pulse align-middle" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Search + category — the only filters. Each card carries its own type
                    badge (Project / Pitch / Job / Internship / Course / Freelance) and,
                    for projects with sub-roles, an expandable required-positions list. */}
                <div className="glass-card p-4 space-y-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                    <input
                      type="text"
                      placeholder="Search by title, skill, or keyword…"
                      value={q}
                      onChange={e => { setQ(e.target.value); setPage(1); }}
                      className="input-mono text-sm w-full pl-9 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">Category</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {TOP_CATEGORIES.map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                            activeCategory === cat.value ? PILL_ACTIVE : PILL_INACTIVE
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
                </div>

                {/* Results header */}
                {!loading && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {pagination.total} {pagination.total === 1 ? 'post' : 'posts'}
                    {activeCategory ? ` in ${CATEGORIES.find(c => c.value === activeCategory)?.label}` : ''}
                    {q ? ` matching "${q}"` : ''}
                  </p>
                )}

                {/* Error */}
                {error && (
                  <div className="glass-inset p-4 text-red-500 dark:text-red-400 text-sm flex items-center gap-2">
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
                        <div className="h-3 w-20 rounded bg-black/[0.06] dark:bg-zinc-800" />
                        <div className="h-4 w-full rounded bg-black/[0.06] dark:bg-zinc-800" />
                        <div className="h-3 w-3/4 rounded bg-black/[0.06] dark:bg-zinc-800" />
                        <div className="flex gap-1 pt-1">
                          {[1,2,3].map(j => <div key={j} className="h-5 w-16 rounded-full bg-black/[0.06] dark:bg-zinc-800" />)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="glass-inset flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black/[0.05] dark:bg-zinc-800 flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 font-semibold text-base">No projects posted yet</p>
                    <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center max-w-xs">
                      {canPost ? `Be the first to ${postLabel.toLowerCase()} and start connecting.` : 'Check back soon for new listings.'}
                    </p>
                    {canPost && (
                      <Link to={postHref} className="btn-mono text-sm px-5 py-2 mt-1">
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
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2">
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
