import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTalentPosts } from './useTalentPosts';
import TalentPostCard from './TalentPostCard';

// Talent tab of the Students Hub — self-marketing Talent Posts (opt-in listings
// the owner writes themselves). Distinct from the Students tab, which reuses the
// existing auto-listed profile directory (TalentDirectory.jsx).
export default function TalentPostBoard({ viewerId }) {
  const { talentPosts, pagination, loading, error, fetchTalentPosts } = useTalentPosts();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const doFetch = useCallback(() => {
    fetchTalentPosts({ q, page });
  }, [q, page, fetchTalentPosts]);

  useEffect(() => { doFetch(); }, [doFetch]);

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by headline…"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            className="input-mono text-sm w-full pl-9 h-10"
          />
        </div>
        <Link to="/startupark/students-hub/talent/create" className="btn-mono text-sm px-4 py-2 shrink-0">
          + Post your talent
        </Link>
      </div>

      {!loading && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {pagination.total} {pagination.total === 1 ? 'talent post' : 'talent posts'}
          {q ? ` matching "${q}"` : ''}
        </p>
      )}

      {error && <div className="glass-inset p-4 text-red-500 dark:text-red-400 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-black/[0.06] dark:bg-zinc-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded bg-black/[0.06] dark:bg-zinc-800" />
                  <div className="h-2.5 w-1/2 rounded bg-black/[0.06] dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : talentPosts.length === 0 ? (
        <div className="glass-inset flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-xl bg-black/[0.05] dark:bg-zinc-800 flex items-center justify-center">
            <Search className="w-6 h-6 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 font-semibold text-base">No talent posts yet</p>
          <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center max-w-xs">
            Be the first to post your skills and let startups invite you directly.
          </p>
          <Link to="/startupark/students-hub/talent/create" className="btn-mono text-sm px-5 py-2 mt-1">
            + Post your talent
          </Link>
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
              {talentPosts.map(tp => (
                <motion.div
                  key={tp._id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <TalentPostCard talentPost={tp} isOwner={!!(viewerId && tp.owner?._id && String(tp.owner._id) === String(viewerId))} />
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
