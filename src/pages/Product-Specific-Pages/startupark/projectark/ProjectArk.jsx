import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProjectArk } from './useProjectArk';
import WorkPostCard from './WorkPostCard';

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

function getUserRole() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u.startuparkRole || u.role || (u.isStartup ? 'startup' : 'user');
  } catch { return 'user'; }
}

export default function ProjectArk() {
  const navigate = useNavigate();
  const { posts, pagination, loading, error, fetchPosts } = useProjectArk();
  const userRole = getUserRole();

  const [activeType, setActiveType] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const doFetch = useCallback(() => {
    fetchPosts({ postType: activeType, category: activeCategory, workLocation, budgetType, q, page });
  }, [activeType, activeCategory, workLocation, budgetType, q, page, fetchPosts]);

  useEffect(() => { doFetch(); }, [doFetch]);

  function clearAll() {
    setActiveType(''); setActiveCategory(''); setWorkLocation('');
    setBudgetType(''); setQ(''); setPage(1);
  }

  const hasFilter = activeType || activeCategory || workLocation || budgetType || q;

  const postLabel = userRole === 'startup' ? 'Post a Project' : 'Post a Requirement';
  const postHint  = userRole === 'startup'
    ? 'You need talent — startups post projects'
    : 'You need a startup — users post requirements';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Project Ark</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Work marketplace · connect talent with startups</p>
          </div>
          <Link to="/startupark/projectark/create" className="btn-mono text-sm px-4 py-2 shrink-0">
            + {postLabel}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 space-y-5">

        {/* Type tabs + search row */}
        <div className="glass-card p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, skill, or keyword…"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
              className="input-mono text-sm w-full pl-9 h-10"
            />
          </div>

          {/* Type toggle */}
          <div className="flex items-center gap-1">
            {[
              { v: '', label: 'All Posts' },
              { v: 'project', label: 'Projects', sub: 'startups need talent' },
              { v: 'requirement', label: 'Requirements', sub: 'users need startups' },
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
                {opt.sub && <span className="text-zinc-500 font-normal hidden sm:inline">· {opt.sub}</span>}
              </button>
            ))}
            {hasFilter && (
              <button onClick={clearAll} className="ml-auto btn-ghost text-xs px-3 py-1.5">
                Clear all
              </button>
            )}
          </div>

          {/* Category pills — horizontal scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {CATEGORIES.map(cat => (
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
          </div>

          {/* Secondary filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={workLocation}
              onChange={e => { setWorkLocation(e.target.value); setPage(1); }}
              className="input-mono text-xs h-8 [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
            >
              <option value="">Any location</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              value={budgetType}
              onChange={e => { setBudgetType(e.target.value); setPage(1); }}
              className="input-mono text-xs h-8 [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
            >
              <option value="">Any budget</option>
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
              <option value="equity">Equity</option>
              <option value="volunteer">Volunteer</option>
              <option value="negotiable">Negotiable</option>
            </select>
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
            <p className="text-zinc-400 font-medium">No posts yet</p>
            <p className="text-zinc-600 text-sm">Be the first to post!</p>
            <Link to="/startupark/projectark/create" className="btn-mono text-sm px-5 py-2 mt-1">
              + {postLabel}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(post => (
                <WorkPostCard key={post._id} post={post} userRole={userRole} />
              ))}
            </div>

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
      </div>
    </div>
  );
}
