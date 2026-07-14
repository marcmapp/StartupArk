import React, { useState } from 'react';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'text-zinc-500',  ring: 'ring-zinc-700',   bg: 'bg-zinc-800/40' },
  in_progress: { label: 'In Progress', color: 'text-blue-400',  ring: 'ring-blue-800/50', bg: 'bg-blue-950/20' },
  submitted:   { label: 'Submitted',   color: 'text-amber-400', ring: 'ring-amber-800/50', bg: 'bg-amber-950/20' },
  approved:    { label: 'Approved',    color: 'text-green-400', ring: 'ring-green-800/50', bg: 'bg-green-950/20' },
  rejected:    { label: 'Rejected',    color: 'text-red-400',   ring: 'ring-red-900/50',  bg: 'bg-red-950/20' },
};

export default function MilestoneCard({ milestone, index, isClient, isProvider, onUpdate, updating }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const sc = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.pending;

  async function handleAction(status) {
    if (status === 'rejected' && !showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    await onUpdate(milestone._id, status, status === 'rejected' ? rejectReason : undefined);
    setShowRejectInput(false);
    setRejectReason('');
  }

  const canMarkInProgress = isProvider && milestone.status === 'pending';
  const canSubmit = isProvider && milestone.status === 'in_progress';
  const canApprove = isClient && milestone.status === 'submitted';
  const canReject = isClient && milestone.status === 'submitted';

  return (
    <div className="glass-card px-4 py-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ring-1 ${sc.bg} ${sc.ring} ${sc.color}`}>
            {index + 1}
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-200">{milestone.title}</div>
            {milestone.description && (
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{milestone.description}</p>
            )}
            {milestone.dueDate && (
              <p className="text-[10px] text-zinc-600 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ring-1 shrink-0 ${sc.bg} ${sc.ring} ${sc.color}`}>
          {sc.label}
        </span>
      </div>

      {milestone.status === 'rejected' && milestone.rejectionReason && (
        <p className="text-xs text-red-400 bg-red-950/20 rounded px-2.5 py-1.5 ring-1 ring-red-900/40">
          Rejection reason: {milestone.rejectionReason}
        </p>
      )}

      {showRejectInput && (
        <div className="space-y-2">
          <input
            type="text"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('rejected')}
              disabled={updating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-red-900/60 text-red-400 hover:ring-red-800 disabled:opacity-40 transition-all"
            >
              {updating ? 'Rejecting...' : 'Confirm Reject'}
            </button>
            <button
              onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showRejectInput && (
        <div className="flex gap-2 flex-wrap">
          {canMarkInProgress && (
            <button
              onClick={() => handleAction('in_progress')}
              disabled={updating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-blue-800/60 text-blue-400 hover:ring-blue-700 disabled:opacity-40 transition-all"
            >
              {updating ? 'Updating...' : 'Start'}
            </button>
          )}
          {canSubmit && (
            <button
              onClick={() => handleAction('submitted')}
              disabled={updating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-amber-800/60 text-amber-400 hover:ring-amber-700 disabled:opacity-40 transition-all"
            >
              {updating ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          {canApprove && (
            <button
              onClick={() => handleAction('approved')}
              disabled={updating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-green-800/60 text-green-400 hover:ring-green-700 disabled:opacity-40 transition-all"
            >
              {updating ? 'Approving...' : 'Approve'}
            </button>
          )}
          {canReject && (
            <button
              onClick={() => handleAction('rejected')}
              disabled={updating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg ring-1 ring-red-900/60 text-red-400 hover:ring-red-800 disabled:opacity-40 transition-all"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}
