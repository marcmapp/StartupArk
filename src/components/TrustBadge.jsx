// TrustBadge — trust tier pill for a profile header (Tier 3 C#1).
//
// Tiers mirror model/projectark/TrustScore.cjs exactly:
//   >=80 elite | >=60 verified | >=40 trusted | >=20 rising | else newcomer
// Kept mono per the design system — tier is conveyed by fill weight, not hue.
import { useState, useEffect } from 'react';
import { fetchTrustScore } from '../services/bookingRatings';

const TIERS = {
  newcomer: { label: 'Newcomer', className: 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400' },
  rising:   { label: 'Rising',   className: 'bg-black/[0.06] dark:bg-white/[0.09] text-zinc-600 dark:text-zinc-300' },
  trusted:  { label: 'Trusted',  className: 'bg-black/[0.08] dark:bg-white/[0.12] text-zinc-700 dark:text-zinc-200' },
  verified: { label: 'Verified', className: 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900' },
  elite:    { label: 'Elite',    className: 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold' }
};

const TrustBadge = ({ userId, showScore = false, className = '' }) => {
  const [trust, setTrust] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    fetchTrustScore(userId)
      .then(data => { if (!cancelled) setTrust(data); })
      .catch(() => { /* absent trust score is not an error worth surfacing */ });

    return () => { cancelled = true; };
  }, [userId]);

  if (!trust || !trust.badge) return null;
  const tier = TIERS[trust.badge] || TIERS.newcomer;

  return (
    <span
      title={`Trust score ${trust.overallScore}/100`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] tracking-wide ${tier.className} ${className}`}
    >
      {tier.label}
      {showScore && <span className="opacity-70">· {trust.overallScore}</span>}
    </span>
  );
};

export default TrustBadge;
