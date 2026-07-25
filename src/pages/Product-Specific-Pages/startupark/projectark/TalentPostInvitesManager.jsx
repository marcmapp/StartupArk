import React, { useEffect, useState } from 'react';
import { useTalentPosts } from './useTalentPosts';

// Incoming invites on a Talent Post owner's own post — the reverse of
// OpportunityApplicantsManager/RoleApplicantsManager: here the owner is the one
// responding (accept/reject), not the one reviewing applicants they posted for.
const STATUS_STYLES = {
  pending:  'text-zinc-400 bg-zinc-800/60 ring-zinc-700',
  accepted: 'text-green-400 bg-green-950/30 ring-green-800/50',
  rejected: 'text-red-400 bg-red-950/30 ring-red-800/50',
};

export default function TalentPostInvitesManager({ talentPostId }) {
  const { fetchApplications, updateApplicationStatus } = useTalentPosts();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchApplications('student')
      .then(all => setInvites(all.filter(a =>
        (a.talentPostId?._id || a.talentPostId) === talentPostId && a.direction === 'startup_initiated'
      )))
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [talentPostId, fetchApplications]);

  async function handleStatus(applicationId, status) {
    setUpdating(applicationId + status);
    try {
      const updated = await updateApplicationStatus(applicationId, { status });
      setInvites(prev => prev.map(a => a._id === applicationId ? { ...a, ...updated } : a));
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="py-8 text-center text-zinc-600 text-sm">Loading invites...</div>;
  if (err) return <p className="text-xs text-red-400 py-4">{err}</p>;
  if (!invites.length) return <p className="text-sm text-zinc-600 py-6 text-center">No invites yet.</p>;

  return (
    <div className="space-y-3">
      {invites.map(a => {
        const startup = a.startupId;
        const canAct = a.status === 'pending';

        return (
          <div key={a._id} className="glass-card px-4 py-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {startup?.logo ? (
                  <img src={startup.logo} alt="" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                    {startup?.companyName?.[0] || 'S'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-zinc-200">{startup?.companyName || 'A startup'}</div>
                  {a.appliedAt && <div className="text-xs text-zinc-500">Invited {new Date(a.appliedAt).toLocaleDateString()}</div>}
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ring-1 capitalize ${STATUS_STYLES[a.status] || STATUS_STYLES.pending}`}>
                {a.status}
              </span>
            </div>

            {a.status === 'accepted' && a.conversationId && (
              <a href="/startupark/chat" className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 self-start">
                Open chat
              </a>
            )}

            {canAct && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleStatus(a._id, 'accepted')}
                  disabled={!!updating}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-green-800/60 text-green-400 hover:ring-green-700 hover:bg-green-950/20 disabled:opacity-40 transition-all"
                >
                  {updating === a._id + 'accepted' ? 'Updating...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleStatus(a._id, 'rejected')}
                  disabled={!!updating}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-red-900/60 text-red-400 hover:ring-red-800 hover:bg-red-950/20 disabled:opacity-40 transition-all"
                >
                  {updating === a._id + 'rejected' ? 'Updating...' : 'Decline'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
