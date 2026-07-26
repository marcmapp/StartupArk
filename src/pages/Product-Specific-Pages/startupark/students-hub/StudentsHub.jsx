import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users2, Sparkles } from 'lucide-react';
import TalentDirectory from '../projectark/TalentDirectory';
import TalentPostBoard from '../projectark/TalentPostBoard';
import { useProjectArk } from '../projectark/useProjectArk';

const PILL_ACTIVE = 'ring-transparent bg-zinc-900 text-white dark:bg-white dark:text-zinc-900';
const PILL_INACTIVE = 'ring-1 ring-black/10 dark:ring-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 hover:ring-black/20 dark:hover:ring-white/20 hover:text-zinc-700 dark:hover:text-zinc-200';

const TABS = [
  { v: 'students', label: 'Students', icon: Users2, hint: 'Browse student & professional profiles — skills, portfolios, and how to reach them' },
  { v: 'talent', label: 'Talent', icon: Sparkles, hint: 'Self-posted talent listings — startups can invite you directly' },
];

// Students Hub — C#8. Reuses the existing auto-listed profile directory
// (TalentDirectory, formerly ProjectArk's "talent" mode) on the Students tab, and
// surfaces the new self-marketing Talent Posts on the Talent tab. Reachable by
// all three roles, no gating beyond login.
export default function StudentsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchViewerContext } = useProjectArk();
  const [viewer, setViewer] = useState(null);

  const initialTab = ['students', 'talent'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'students';
  const [tab, setTab] = useState(initialTab);

  function switchTab(v) {
    setTab(v);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', v);
      return next;
    }, { replace: true });
  }

  useEffect(() => {
    fetchViewerContext().then(setViewer).catch(() => setViewer(null));
  }, [fetchViewerContext]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10 px-4 md:px-6 py-4">
        <div className="max-w-6xl lg:max-w-[1600px] mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] ring-1 ring-black/10 dark:ring-white/10 flex items-center justify-center shrink-0">
            <Users2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Students Hub</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{TABS.find(t => t.v === tab)?.hint}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl lg:max-w-[1600px] mx-auto px-4 md:px-6 py-5 space-y-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.v}
                onClick={() => switchTab(t.v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === t.v ? PILL_ACTIVE : PILL_INACTIVE
                }`}
                title={t.hint}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'students' ? <TalentDirectory /> : <TalentPostBoard viewerId={viewer?.userId} viewerRole={viewer?.role} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
