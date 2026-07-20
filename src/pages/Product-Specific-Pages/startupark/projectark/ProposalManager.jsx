import React, { useEffect, useState } from 'react';
import { useProjectArk } from './useProjectArk';

const STATUS_STYLES = {
  pending:     'text-zinc-400 bg-zinc-800/60 ring-zinc-700',
  viewed:      'text-blue-400 bg-blue-950/30 ring-blue-800/50',
  shortlisted: 'text-amber-400 bg-amber-950/30 ring-amber-800/50',
  accepted:    'text-green-400 bg-green-950/30 ring-green-800/50',
  rejected:    'text-red-400 bg-red-950/30 ring-red-800/50',
  withdrawn:   'text-zinc-500 bg-zinc-800/40 ring-zinc-700/50',
};

export default function ProposalManager({ workPostId, positions = [] }) {
  const { fetchProposals, updateProposalStatus } = useProjectArk();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchProposals({ workPostId })
      .then(setProposals)
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [workPostId, fetchProposals]);

  // Group by position when the project has required positions, so the owner reviews
  // applicants position-by-position instead of one flat mixed list.
  const groups = positions.length
    ? [
        ...positions.map(pos => ({
          key: pos._id,
          label: pos.title,
          items: proposals.filter(p => String(p.positionId) === String(pos._id)),
        })),
        { key: 'general', label: 'General', items: proposals.filter(p => !p.positionId) },
      ].filter(g => g.items.length)
    : [{ key: 'all', label: null, items: proposals }];

  async function handleStatus(proposalId, status) {
    setUpdating(proposalId + status);
    try {
      const updated = await updateProposalStatus(proposalId, status);
      setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, ...updated } : p));
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-zinc-600 text-sm">Loading proposals...</div>
    );
  }

  if (err) {
    return <p className="text-xs text-red-400 py-4">{err}</p>;
  }

  if (!proposals.length) {
    return <p className="text-sm text-zinc-600 py-6 text-center">No proposals yet.</p>;
  }

  return (
    <div className="space-y-5">
      {groups.map(group => (
      <div key={group.key} className="space-y-3">
        {group.label && (
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{group.label}</h4>
        )}
      {group.items.map(p => {
        const proposer = p.proposedBy;
        const startup = p.startupId;
        const canAct = !['accepted', 'rejected', 'withdrawn'].includes(p.status);

        return (
          <div key={p._id} className="glass-card px-4 py-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {proposer?.profilePicture ? (
                  <img src={proposer.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                    {proposer?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-zinc-200">{proposer?.username || 'Unknown'}</div>
                  {startup && (
                    <div className="text-xs text-zinc-500">{startup.companyName}</div>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ring-1 capitalize ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}>
                {p.status}
              </span>
            </div>

            {/* Cover note */}
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{p.coverNote}</p>

            {/* Budget / timeline */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              {p.proposedBudget && (
                <span>Budget: <span className="text-zinc-300">₹{p.proposedBudget.toLocaleString()}</span></span>
              )}
              {p.proposedTimeline && (
                <span>Timeline: <span className="text-zinc-300">{p.proposedTimeline}</span></span>
              )}
              {p.portfolioLinks?.length > 0 && (
                <a href={p.portfolioLinks[0]} target="_blank" rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                  Portfolio
                </a>
              )}
            </div>

            {/* Action buttons */}
            {canAct && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleStatus(p._id, 'shortlisted')}
                  disabled={!!updating || p.status === 'shortlisted'}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-amber-800/60 text-amber-400 hover:ring-amber-700 hover:bg-amber-950/20 disabled:opacity-40 transition-all"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatus(p._id, 'accepted')}
                  disabled={!!updating}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-green-800/60 text-green-400 hover:ring-green-700 hover:bg-green-950/20 disabled:opacity-40 transition-all"
                >
                  {updating === p._id + 'accepted' ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleStatus(p._id, 'rejected')}
                  disabled={!!updating}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-red-900/60 text-red-400 hover:ring-red-800 hover:bg-red-950/20 disabled:opacity-40 transition-all"
                >
                  Reject
                </button>
              </div>
            )}

            {p.status === 'accepted' && p.engagementId && (
              <a
                href={`/startupark/engagements/${p.engagementId}`}
                className="text-xs text-green-400 hover:text-green-300 underline underline-offset-2"
              >
                View Engagement
              </a>
            )}
          </div>
        );
      })}
      </div>
      ))}
    </div>
  );
}
