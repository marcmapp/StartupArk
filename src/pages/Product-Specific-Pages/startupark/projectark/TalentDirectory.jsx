import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useTalentDirectory } from './useTalentDirectory';
import TalentCard from './TalentCard';

const PROFILE_TYPE_PILL = 'w-auto shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 h-8 text-xs text-zinc-700 dark:text-zinc-300 ' +
  'outline-none focus:border-zinc-400 dark:focus:border-zinc-500 [&>option]:bg-white dark:[&>option]:bg-zinc-900 [&>option]:text-zinc-900 dark:[&>option]:text-zinc-100';

export default function TalentDirectory() {
  const { profiles, pagination, loading, error, fetchTalent } = useTalentDirectory();
  const [searchParams] = useSearchParams();
  // Tier 3 C#9: startup-only "Students" nav entry opens this same directory via
  // ?type=student instead of forking a new page. Filter stays interactive after
  // landing — a startup can still switch back to "All profiles" if they want.
  const initialType = ['student', 'user'].includes(searchParams.get('type')) ? searchParams.get('type') : '';
  const [q, setQ] = useState('');
  const [profileType, setProfileType] = useState(initialType);
  const [page, setPage] = useState(1);

  const doFetch = useCallback(() => {
    fetchTalent({ q, profileType, page });
  }, [q, profileType, page, fetchTalent]);

  useEffect(() => { doFetch(); }, [doFetch]);

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by skill — e.g. React, Figma, marketing…"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            className="input-mono text-sm w-full pl-9 h-10"
          />
        </div>
        <select
          value={profileType}
          onChange={e => { setProfileType(e.target.value); setPage(1); }}
          className={PROFILE_TYPE_PILL}
        >
          <option value="">All profiles</option>
          <option value="student">Students</option>
          <option value="user">Professionals</option>
        </select>
      </div>

      {/* Results header */}
      {!loading && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {pagination.total} {pagination.total === 1 ? 'profile' : 'profiles'}
          {q ? ` matching "${q}"` : ''}
        </p>
      )}

      {error && (
        <div className="glass-inset p-4 text-red-500 dark:text-red-400 text-sm">{error}</div>
      )}

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
              <div className="flex gap-1">
                {[1, 2, 3].map(j => <div key={j} className="h-5 w-14 rounded-full bg-black/[0.06] dark:bg-zinc-800" />)}
              </div>
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="glass-inset flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-xl bg-black/[0.05] dark:bg-zinc-800 flex items-center justify-center">
            <Search className="w-6 h-6 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 font-semibold text-base">No profiles found</p>
          <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center max-w-xs">
            Profiles show up here once a student or professional adds at least one skill or portfolio item.
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
              {profiles.map(profile => (
                <motion.div
                  key={profile.id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <TalentCard profile={profile} />
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
              <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2">{page} / {pagination.pages}</span>
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
  );
}
