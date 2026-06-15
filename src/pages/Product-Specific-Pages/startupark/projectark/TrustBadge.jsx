import React from 'react';

const TIERS = {
  newcomer: { label: 'Newcomer', bg: 'bg-zinc-800', text: 'text-zinc-400', ring: 'ring-zinc-700' },
  rising:   { label: 'Rising',   bg: 'bg-zinc-800', text: 'text-blue-400',  ring: 'ring-blue-800' },
  trusted:  { label: 'Trusted',  bg: 'bg-zinc-800', text: 'text-green-400', ring: 'ring-green-800' },
  verified: { label: 'Verified', bg: 'bg-zinc-800', text: 'text-amber-400', ring: 'ring-amber-700' },
  elite:    { label: 'Elite',    bg: 'bg-zinc-800', text: 'text-white',     ring: 'ring-zinc-400' },
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
      <span className="text-zinc-500 text-xs">{score}/100</span>
    </div>
  );
}
