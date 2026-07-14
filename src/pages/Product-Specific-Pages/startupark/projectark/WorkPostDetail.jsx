import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjectArk } from './useProjectArk';
import TrustBadge from './TrustBadge';
import ProposalForm from './ProposalForm';
import ProposalManager from './ProposalManager';

const BUDGET_LABEL = { fixed: 'Fixed', hourly: '/hr', equity: 'Equity', volunteer: 'Volunteer', negotiable: 'Negotiable' };
const LOCATION_ICON = { remote: '🌐', onsite: '📍', hybrid: '⇌' };

function formatBudget(post) {
  if (post.budgetType === 'volunteer') return 'Volunteer';
  if (post.budgetType === 'equity') return 'Equity';
  if (post.budgetType === 'negotiable') return 'Negotiable';
  if (!post.budgetMin && !post.budgetMax) return 'Open';
  const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${n}`;
  if (post.budgetMin && post.budgetMax) return `${fmt(post.budgetMin)} – ${fmt(post.budgetMax)}`;
  if (post.budgetMax) return `≤ ${fmt(post.budgetMax)}`;
  return `${fmt(post.budgetMin)}+`;
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

function getUserRole() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u.startuparkRole || u.role || (u.isStartup ? 'startup' : 'user');
  } catch { return 'user'; }
}

const TYPE_STYLES = {
  project:     { badge: 'ring-blue-800 text-blue-400 bg-blue-950/40', label: 'PROJECT' },
  requirement: { badge: 'ring-purple-800 text-purple-400 bg-purple-950/40', label: 'REQUIREMENT' },
};

const MILESTONE_STATUS_COLOR = {
  pending: 'text-zinc-500', in_progress: 'text-blue-400', submitted: 'text-amber-400',
  approved: 'text-green-400', rejected: 'text-red-400'
};

export default function WorkPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { fetchPost, submitProposal, fetchProposals } = useProjectArk();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('details');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalSubmitting, setProposalSubmitting] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const [myProposal, setMyProposal] = useState(null);

  const user = getCurrentUser();
  const userRole = getUserRole();
  const isOwner = post && (post.postedBy?._id === user._id || post.postedBy?._id === user.id);
  const canApply = post && (
    (post.postType === 'project' && userRole !== 'startup') ||
    (post.postType === 'requirement' && userRole === 'startup')
  );

  useEffect(() => {
    fetchPost(postId)
      .then(p => {
        setPost(p);
        return p;
      })
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [postId, fetchPost]);

  useEffect(() => {
    if (!post || isOwner) return;
    fetchProposals({ mine: true })
      .then(proposals => {
        const mine = proposals.find(p => p.workPostId?._id === postId || p.workPostId === postId);
        if (mine) setMyProposal(mine);
      })
      .catch(() => {});
  }, [post, postId, isOwner, fetchProposals]);

  async function handleProposalSubmit(payload) {
    setProposalSubmitting(true);
    try {
      await submitProposal(payload);
      setShowProposalForm(false);
      setProposalSuccess(true);
      setMyProposal({ status: 'pending', workPostId: postId });
    } finally {
      setProposalSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (err || !post) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-400">{err || 'Post not found'}</p>
        <button onClick={() => navigate('/startupark/projectark')} className="text-xs text-zinc-500 hover:text-zinc-300">
          Back to Project Ark
        </button>
      </div>
    );
  }

  const typeStyle = TYPE_STYLES[post.postType] || TYPE_STYLES.project;
  const startup = post.startupId;
  const poster = post.postedBy;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/startupark/projectark')}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            ← Project Ark
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 line-clamp-1 flex-1">{post.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Title block */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 tracking-wider ${typeStyle.badge}`}>
                {typeStyle.label}
              </span>
              <span className="text-xs text-zinc-500 capitalize">{post.category?.replace('-', ' ')}</span>
              {post.domain && <span className="text-xs text-zinc-600">{post.domain}</span>}
            </div>
            <h1 className="text-xl font-bold text-zinc-100 leading-snug">{post.title}</h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
              <span>{LOCATION_ICON[post.workLocation] || '🌐'} <span className="capitalize">{post.workLocation || 'remote'}</span></span>
              <span className="text-zinc-700">·</span>
              <span className="font-semibold text-zinc-300">{formatBudget(post)}{post.budgetType === 'hourly' ? '/hr' : ''}</span>
              {post.estimatedDuration && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>{post.estimatedDuration}</span>
                </>
              )}
              <span className="text-zinc-700">·</span>
              <span>{post.proposalCount || 0} proposals</span>
              <span className="text-zinc-700">·</span>
              <span>{post.viewCount || 0} views</span>
            </div>
          </div>

          {/* CTA area */}
          {!isOwner && (
            <div className="shrink-0">
              {proposalSuccess || myProposal ? (
                <div className="text-xs px-3 py-2 rounded-lg ring-1 ring-green-800/50 bg-green-950/20 text-green-400">
                  Proposal {myProposal?.status || 'submitted'}
                </div>
              ) : canApply && post.status === 'open' ? (
                <button
                  onClick={() => setShowProposalForm(true)}
                  className="btn-mono px-4 py-2 text-sm"
                >
                  Submit Proposal
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Poster info */}
        <div className="glass-card px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {poster?.profilePicture ? (
              <img src={poster.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm text-zinc-400">
                {poster?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-zinc-200">{poster?.username}</div>
              {(poster?.city || poster?.state) && (
                <div className="text-xs text-zinc-500">{[poster.city, poster.state].filter(Boolean).join(', ')}</div>
              )}
            </div>
            {startup && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-zinc-800/60">
                {startup.logo ? (
                  <img src={startup.logo} alt="" className="w-5 h-5 rounded object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded bg-zinc-700 flex items-center justify-center text-[9px] text-zinc-400">
                    {startup.companyName?.[0] || 'S'}
                  </div>
                )}
                <span className="text-xs text-zinc-400">{startup.companyName}</span>
              </div>
            )}
          </div>
          {post.posterTrust && <TrustBadge trust={post.posterTrust} size="sm" />}
        </div>

        {/* Tabs (show Proposals tab only for owner) */}
        {isOwner && (
          <div className="flex gap-1 border-b border-zinc-800/60 pb-0">
            {['details', 'proposals'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-zinc-400 text-zinc-200'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        {(!isOwner || tab === 'details') && (
          <div className="space-y-5">
            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{post.description}</p>
            </div>

            {/* Skills */}
            {post.requiredSkills?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.requiredSkills.map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/60">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Work Type', value: post.workType?.replace('-', ' ') },
                { label: 'Budget Type', value: BUDGET_LABEL[post.budgetType] || post.budgetType },
                { label: 'Deadline', value: post.deadline ? new Date(post.deadline).toLocaleDateString() : null },
                { label: 'Experience', value: post.preferredExperience },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="glass-card px-3 py-2.5">
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className="text-xs text-zinc-300 capitalize">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Milestones */}
            {post.milestones?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Milestones</h3>
                <div className="space-y-2">
                  {post.milestones.map((m, i) => (
                    <div key={i} className="glass-card px-4 py-3 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-200">{m.title}</div>
                        {m.description && <p className="text-xs text-zinc-500 mt-0.5">{m.description}</p>}
                        {m.dueDate && (
                          <p className="text-[10px] text-zinc-600 mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status badge */}
            {post.status !== 'open' && (
              <div className="glass-card px-4 py-3 text-center">
                <span className="text-xs text-zinc-500 capitalize">This post is <strong className="text-zinc-300">{post.status}</strong></span>
              </div>
            )}
          </div>
        )}

        {isOwner && tab === 'proposals' && (
          <ProposalManager workPostId={postId} />
        )}
      </div>

      {/* Proposal form modal */}
      {showProposalForm && (
        <ProposalForm
          post={post}
          onSubmit={handleProposalSubmit}
          onClose={() => setShowProposalForm(false)}
          loading={proposalSubmitting}
        />
      )}
    </div>
  );
}
