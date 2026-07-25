import React from 'react';

// Tiers mirror model/projectark/TrustScore.cjs exactly, and the grayscale ramp
// (fill weight, not hue) matches the sibling components/TrustBadge.jsx tokens —
// mono-glass design system, color reserved for genuine status elsewhere.
const TIERS = {
  newcomer: { label: 'Newcomer', bg: 'bg-black/[0.05] dark:bg-zinc-800', text: 'text-zinc-500 dark:text-zinc-400', ring: 'ring-black/10 dark:ring-zinc-700' },
  rising:   { label: 'Rising',   bg: 'bg-black/[0.06] dark:bg-white/[0.09]', text: 'text-zinc-600 dark:text-zinc-300', ring: 'ring-black/10 dark:ring-zinc-700' },
  trusted:  { label: 'Trusted',  bg: 'bg-black/[0.08] dark:bg-white/[0.12]', text: 'text-zinc-700 dark:text-zinc-200', ring: 'ring-black/10 dark:ring-zinc-600' },
  verified: { label: 'Verified', bg: 'bg-zinc-800 dark:bg-zinc-200', text: 'text-white dark:text-zinc-900', ring: 'ring-zinc-800 dark:ring-zinc-200' },
  elite:    { label: 'Elite',    bg: 'bg-zinc-900 dark:bg-white', text: 'text-white dark:text-zinc-900', ring: 'ring-zinc-500 dark:ring-zinc-400' },
};

export default function TrustBadge({ trust, size = 'sm' }) {
  if (!trust) return null;
  const tier = TIERS[trust.badge] || TIERS.newcomer;
  const score = Math.round(trust.overallScore ?? 0);

  if (size === 'xs') {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ${tier.bg} ${tier.text} ${tier.ring}`}>
        {tier.label}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ring-1 ${tier.bg} ${tier.ring}`}>
      <span className={`text-xs font-semibold ${tier.text}`}>{tier.label}</span>
      <span className="text-zinc-500 dark:text-zinc-500 text-xs">{score}/100</span>
    </div>
  );
}
