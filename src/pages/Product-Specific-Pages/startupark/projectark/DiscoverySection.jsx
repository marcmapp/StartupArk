import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
import { useProjectArk } from './useProjectArk';
import WorkPostCard from './WorkPostCard';
import OpportunityCard from './OpportunityCard';

// Pro-tier "For You" digest (feature: discovery_digest) — talent-side only
// (User/Student). Startups get the supply-side half of the same perk
// (priority_listing, a passive ranking boost) so this section doesn't apply
// to them and is skipped entirely.
export default function DiscoverySection({ role }) {
  const navigate = useNavigate();
  const { fetchDiscovery } = useProjectArk();
  const [items, setItems] = useState(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'startup') { setLoading(false); return; }
    let cancelled = false;
    fetchDiscovery({ limit: 6 })
      .then(data => { if (!cancelled) setItems(data.items || []); })
      .catch(err => {
        if (cancelled) return;
        if (err.response?.status === 403) setNeedsUpgrade(true);
        else setItems([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [role, fetchDiscovery]);

  if (role === 'startup' || loading) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-400" strokeWidth={2} />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">For You</h2>
      </div>

      {needsUpgrade ? (
        <div className="glass-card p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Unlock your personalized feed</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Upgrade to Pro for a "For You" digest matched to your skills & interests, with unlimited conversations.
            </p>
          </div>
          <button onClick={() => navigate('/pricing/startupArk')} className="btn-mono text-sm px-4 py-2 shrink-0">
            Upgrade to Pro
          </button>
        </div>
      ) : items && items.length === 0 ? (
        <div className="glass-inset p-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Nothing matched to your skills yet — check back as new posts come in.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map(item => (
            <div key={item._id} className="relative">
              {item.reason === 'Featured' && (
                <span className="absolute -top-2 left-3 z-10 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-zinc-900 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-current" strokeWidth={0} />
                  FEATURED
                </span>
              )}
              {item.sourceType === 'workpost' ? (
                <WorkPostCard post={item} userRole={role} viewerId={null} />
              ) : (
                <OpportunityCard opportunity={item} isOwner={false} />
              )}
              {item.reason && item.reason !== 'Featured' && (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 px-1">{item.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
