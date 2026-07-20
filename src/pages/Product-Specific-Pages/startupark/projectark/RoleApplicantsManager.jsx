import React, { useEffect, useState } from 'react';
import { useProjectArk } from './useProjectArk';

const STATUS_STYLES = {
  pending:     'text-zinc-400 bg-zinc-800/60 ring-zinc-700',
  reviewed:    'text-blue-400 bg-blue-950/30 ring-blue-800/50',
  shortlisted: 'text-amber-400 bg-amber-950/30 ring-amber-800/50',
  interview:   'text-orange-400 bg-orange-950/30 ring-orange-800/50',
  accepted:    'text-green-400 bg-green-950/30 ring-green-800/50',
  rejected:    'text-red-400 bg-red-950/30 ring-red-800/50',
};

const STATUS_ACTIONS = [
  { v: 'reviewed', label: 'Review', ring: 'ring-blue-800/60 text-blue-400 hover:ring-blue-700 hover:bg-blue-950/20' },
  { v: 'shortlisted', label: 'Shortlist', ring: 'ring-amber-800/60 text-amber-400 hover:ring-amber-700 hover:bg-amber-950/20' },
  { v: 'interview', label: 'Interview', ring: 'ring-orange-800/60 text-orange-400 hover:ring-orange-700 hover:bg-orange-950/20' },
  { v: 'accepted', label: 'Accept', ring: 'ring-green-800/60 text-green-400 hover:ring-green-700 hover:bg-green-950/20' },
  { v: 'rejected', label: 'Reject', ring: 'ring-red-900/60 text-red-400 hover:ring-red-800 hover:bg-red-950/20' },
];

export default function RoleApplicantsManager({ workPostId, positions = [] }) {
  const { fetchApplications, updateApplicationStatus, fetchApplicationResumeUrl } = useProjectArk();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchApplications('startup')
      .then(all => {
        const mine = all.filter(a => (a.workPostId?._id || a.workPostId) === workPostId);
        setApplicants(mine);
      })
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [workPostId, fetchApplications]);

  // Group by position when the project has required positions, so the owner reviews
  // applicants position-by-position instead of one flat mixed list.
  const groups = positions.length
    ? [
        ...positions.map(pos => ({
          key: pos._id,
          label: pos.title,
          items: applicants.filter(a => String(a.positionId) === String(pos._id)),
        })),
        { key: 'general', label: 'General', items: applicants.filter(a => !a.positionId) },
      ].filter(g => g.items.length)
    : [{ key: 'all', label: null, items: applicants }];

  async function handleStatus(applicationId, status) {
    setUpdating(applicationId + status);
    try {
      const updated = await updateApplicationStatus(applicationId, { status });
      setApplicants(prev => prev.map(a => a._id === applicationId ? { ...a, ...updated } : a));
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleDownloadResume(applicationId) {
    setDownloadingId(applicationId);
    try {
      const url = await fetchApplicationResumeUrl(applicationId);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-zinc-600 text-sm">Loading applicants...</div>
    );
  }

  if (err) {
    return <p className="text-xs text-red-400 py-4">{err}</p>;
  }

  if (!applicants.length) {
    return <p className="text-sm text-zinc-600 py-6 text-center">No applicants yet.</p>;
  }

  return (
    <div className="space-y-5">
      {groups.map(group => (
      <div key={group.key} className="space-y-3">
        {group.label && (
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{group.label}</h4>
        )}
      {group.items.map(a => {
        const applicant = a.studentId || a.userId || a.applicantId;
        const canAct = !['accepted', 'rejected'].includes(a.status);

        return (
          <div key={a._id} className="glass-card px-4 py-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {applicant?.profilePicture ? (
                  <img src={applicant.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                    {(applicant?.username || applicant?.name)?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-zinc-200">{applicant?.username || applicant?.name || 'Unknown'}</div>
                  {applicant?.email && (
                    <div className="text-xs text-zinc-500">{applicant.email}</div>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ring-1 capitalize ${STATUS_STYLES[a.status] || STATUS_STYLES.pending}`}>
                {a.status}
              </span>
            </div>

            {/* Cover letter */}
            {a.coverLetter && (
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{a.coverLetter}</p>
            )}

            {/* Resume + applied date */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              {a.appliedAt && (
                <span>Applied: <span className="text-zinc-300">{new Date(a.appliedAt).toLocaleDateString()}</span></span>
              )}
              {a.resume && (
                <button
                  onClick={() => handleDownloadResume(a._id)}
                  disabled={downloadingId === a._id}
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2 disabled:opacity-50"
                >
                  {downloadingId === a._id ? 'Opening…' : 'Download Resume'}
                </button>
              )}
            </div>

            {/* Action buttons */}
            {canAct && (
              <div className="flex gap-2 pt-1 flex-wrap">
                {STATUS_ACTIONS.map(action => (
                  <button
                    key={action.v}
                    onClick={() => handleStatus(a._id, action.v)}
                    disabled={!!updating || a.status === action.v}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg ring-1 disabled:opacity-40 transition-all ${action.ring}`}
                  >
                    {updating === a._id + action.v ? 'Updating...' : action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      </div>
      ))}
    </div>
  );
}
