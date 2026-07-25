import React, { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOpportunities } from './useOpportunities';
import OpportunityCard from './OpportunityCard';
import { ROLE_TYPE_LABELS } from './projectArkLabels';

const SELECT_PILL = 'w-auto shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 h-8 text-xs text-zinc-700 dark:text-zinc-300 ' +
  'outline-none focus:border-zinc-400 dark:focus:border-zinc-500 [&>option]:bg-white dark:[&>option]:bg-zinc-900 [&>option]:text-zinc-900 dark:[&>option]:text-zinc-100';
const PILL_ACTIVE = 'ring-transparent bg-zinc-900 text-white dark:bg-white dark:text-zinc-900';
const PILL_INACTIVE = 'ring-1 ring-black/10 dark:ring-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 hover:ring-black/20 dark:hover:ring-white/20 hover:text-zinc-700 dark:hover:text-zinc-200';

const TYPES = [
  { v: '', label: 'All' },
  { v: 'job', label: ROLE_TYPE_LABELS.job },
  { v: 'internship', label: ROLE_TYPE_LABELS.internship },
  { v: 'course', label: ROLE_TYPE_LABELS.course },
  { v: 'freelance', label: ROLE_TYPE_LABELS.freelance },
];

// Standalone Opportunities board — the Project Ark "Opportunities" tab. Manages
// its own fetching (like TalentDirectory did before it moved to Students Hub),
// since the shape (Opportunity, not WorkPost) doesn't fit useProjectArk's posts state.
export default function OpportunityBoard({ userRole, viewerStartupId }) {
  const { opportunities, pagination, loading, error, fetchOpportunities } = useOpportunities();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);

  const doFetch = useCallback(() => {
    fetchOpportunities({ q, type, location, status: 'active', page });
  }, [q, type, location, page, fetchOpportunities]);

  useEffect(() => { doFetch(); }, [doFetch]);

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 space-y-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search opportunities by title…"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            className="input-mono text-sm w-full pl-9 h-10"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {TYPES.map(opt => (
            <button
              key={opt.v}
              onClick={() => { setType(opt.v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === opt.v ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {opt.label}
            </button>
          ))}
          <select value={location} onChange={e => { setLocation(e.target.value); setPage(1); }} className={`${SELECT_PILL} ml-auto`}>
            <option value="">Any location</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {pagination.total} {pagination.total === 1 ? 'opportunity' : 'opportunities'}
          {q ? ` matching "${q}"` : ''}
        </p>
      )}

      {error && <div className="glass-inset p-4 text-red-500 dark:text-red-400 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3 animate-pulse">
              <div className="h-3 w-20 rounded bg-black/[0.06] dark:bg-zinc-800" />
              <div className="h-4 w-full rounded bg-black/[0.06] dark:bg-zinc-800" />
              <div className="h-3 w-3/4 rounded bg-black/[0.06] dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="glass-inset flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-xl bg-black/[0.05] dark:bg-zinc-800 flex items-center justify-center">
            <Search className="w-6 h-6 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 font-semibold text-base">No opportunities posted yet</p>
          <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center max-w-xs">
            {userRole === 'startup' ? 'Be the first to post a job, internship, course, or freelance opening.' : 'Check back soon for new openings.'}
          </p>
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
              {opportunities.map(opp => (
                <motion.div
                  key={opp._id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <OpportunityCard
                    opportunity={opp}
                    isOwner={!!(viewerStartupId && opp.startupId?._id && String(opp.startupId._id) === String(viewerStartupId))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs px-4 py-2 disabled:opacity-40">← Prev</button>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2">{page} / {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs px-4 py-2 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
