import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjectArk } from './useProjectArk';
import MilestoneCard from './MilestoneCard';
import RatingForm from './RatingForm';

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

const STATUS_COLOR = {
  active: 'text-green-400 ring-green-800/50 bg-green-950/20',
  paused: 'text-amber-400 ring-amber-800/50 bg-amber-950/20',
  completed: 'text-blue-400 ring-blue-800/50 bg-blue-950/20',
  disputed: 'text-red-400 ring-red-900/50 bg-red-950/20',
  cancelled: 'text-zinc-500 ring-zinc-700 bg-zinc-800/40',
};

export default function EngagementDetail() {
  const { engagementId } = useParams();
  const navigate = useNavigate();
  const { fetchEngagement, updateMilestone, markEngagementComplete, cancelEngagement } = useProjectArk();

  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [updatingMilestone, setUpdatingMilestone] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const user = getCurrentUser();
  const userId = user._id || user.id;

  const load = useCallback(() => {
    fetchEngagement(engagementId)
      .then(setEngagement)
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [engagementId, fetchEngagement]);

  useEffect(() => { load(); }, [load]);

  const isClient = engagement && (
    engagement.clientId?._id === userId || engagement.clientId?._id?.toString() === userId
  );
  const isProvider = engagement && (
    engagement.providerId?._id === userId || engagement.providerId?._id?.toString() === userId
  );

  async function handleMilestoneUpdate(milestoneId, status, rejectionReason) {
    setUpdatingMilestone(milestoneId);
    try {
      const updated = await updateMilestone(engagementId, milestoneId, status, rejectionReason);
      setEngagement(updated);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setUpdatingMilestone(null);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      const updated = await markEngagementComplete(engagementId);
      setEngagement(updated);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setCompleting(false);
    }
  }

  async function handleCancel() {
    if (!showCancelInput) { setShowCancelInput(true); return; }
    setCancelling(true);
    try {
      await cancelEngagement(engagementId, cancelReason);
      load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setCancelling(false);
      setShowCancelInput(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (err || !engagement) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-400">{err || 'Engagement not found'}</p>
        <button onClick={() => navigate(-1)} className="text-xs text-zinc-500 hover:text-zinc-300">Go back</button>
      </div>
    );
  }

  const post = engagement.workPostId;
  const client = engagement.clientId;
  const provider = engagement.providerId;
  const clientStartup = engagement.clientStartupId;
  const providerStartup = engagement.providerStartupId;
  const sc = STATUS_COLOR[engagement.status] || STATUS_COLOR.active;

  const myCompletionMarked = isClient ? engagement.clientMarkedComplete : engagement.providerMarkedComplete;
  const canMarkComplete = engagement.status === 'active' && !myCompletionMarked;
  const canRate = engagement.status === 'completed';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            ← Back
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 flex-1 line-clamp-1">
            Engagement: {post?.title || engagementId}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Status + title */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {post?.title && (
              <Link
                to={`/startupark/projectark/posts/${post._id}`}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
              >
                {post.title}
              </Link>
            )}
            <h1 className="text-lg font-bold text-zinc-100">Engagement</h1>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded ring-1 capitalize ${sc}`}>
            {engagement.status}
          </span>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { role: 'Client', person: client, startup: clientStartup, isMe: isClient },
            { role: 'Provider', person: provider, startup: providerStartup, isMe: isProvider },
          ].map(({ role, person, startup, isMe }) => (
            <div key={role} className="glass-card px-4 py-3 flex items-center gap-3">
              {person?.profilePicture ? (
                <img src={person.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                  {person?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider">{role}{isMe ? ' (You)' : ''}</div>
                <div className="text-sm font-medium text-zinc-200">{person?.username}</div>
                {startup && <div className="text-xs text-zinc-500">{startup.companyName}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Terms */}
        <div className="glass-card px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Agreed Budget</div>
            <div className="text-sm font-semibold text-zinc-200">
              {engagement.agreedBudget ? `₹${engagement.agreedBudget.toLocaleString()}` : 'Not set'}
            </div>
          </div>
          {engagement.agreedTimeline && (
            <div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Timeline</div>
              <div className="text-sm text-zinc-300">{engagement.agreedTimeline}</div>
            </div>
          )}
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Progress</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 rounded-full transition-all"
                  style={{ width: `${engagement.completionPercentage || 0}%` }}
                />
              </div>
              <span className="text-xs text-zinc-400">{engagement.completionPercentage || 0}%</span>
            </div>
          </div>
          {engagement.startDate && (
            <div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Started</div>
              <div className="text-xs text-zinc-400">{new Date(engagement.startDate).toLocaleDateString()}</div>
            </div>
          )}
          {engagement.expectedEndDate && (
            <div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Expected End</div>
              <div className="text-xs text-zinc-400">{new Date(engagement.expectedEndDate).toLocaleDateString()}</div>
            </div>
          )}
          {engagement.status === 'completed' && engagement.actualEndDate && (
            <div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Completed</div>
              <div className="text-xs text-zinc-400">{new Date(engagement.actualEndDate).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* Completion status for active */}
        {engagement.status === 'active' && (
          <div className="glass-card px-4 py-3 flex items-center gap-4 text-xs text-zinc-500">
            <div className={`w-2 h-2 rounded-full ${engagement.clientMarkedComplete ? 'bg-green-500' : 'bg-zinc-700'}`} />
            <span>Client {engagement.clientMarkedComplete ? 'marked complete' : 'pending'}</span>
            <div className={`w-2 h-2 rounded-full ${engagement.providerMarkedComplete ? 'bg-green-500' : 'bg-zinc-700'}`} />
            <span>Provider {engagement.providerMarkedComplete ? 'marked complete' : 'pending'}</span>
          </div>
        )}

        {/* Milestones */}
        {engagement.milestones?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Milestones</h3>
            <div className="space-y-3">
              {engagement.milestones.map((m, i) => (
                <MilestoneCard
                  key={m._id || i}
                  milestone={m}
                  index={i}
                  isClient={isClient}
                  isProvider={isProvider}
                  onUpdate={handleMilestoneUpdate}
                  updating={updatingMilestone === m._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {err && (
          <p className="text-xs text-red-400 bg-red-950/20 border border-red-800/40 rounded-lg px-3 py-2">{err}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {canMarkComplete && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="btn-mono px-4 py-2 text-sm disabled:opacity-50"
            >
              {completing ? 'Marking...' : 'Mark My Side Complete'}
            </button>
          )}

          {canRate && (
            <button
              onClick={() => setShowRatingForm(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg ring-1 ring-amber-800/60 text-amber-400 hover:ring-amber-700 hover:bg-amber-950/20 transition-all"
            >
              Rate & Review
            </button>
          )}

          {engagement.status === 'active' && !showCancelInput && (
            <button
              onClick={() => setShowCancelInput(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg ring-1 ring-zinc-700 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300 transition-all"
            >
              Cancel Engagement
            </button>
          )}
        </div>

        {showCancelInput && (
          <div className="glass-card px-4 py-4 space-y-3">
            <p className="text-xs text-zinc-400">Reason for cancellation (optional):</p>
            <input
              type="text"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g. Scope changed, timeline issues..."
              className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-medium rounded-lg ring-1 ring-red-900/60 text-red-400 hover:ring-red-800 disabled:opacity-40 transition-all"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
              <button
                onClick={() => { setShowCancelInput(false); setCancelReason(''); }}
                className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Keep Engagement
              </button>
            </div>
          </div>
        )}
      </div>

      {showRatingForm && (
        <RatingForm
          engagementId={engagementId}
          onClose={() => setShowRatingForm(false)}
        />
      )}
    </div>
  );
}
