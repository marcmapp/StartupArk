import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, TrendingUp, Globe, MapPin, GitMerge } from 'lucide-react';
import { useProjectArk } from './useProjectArk';
import TrustBadge from './TrustBadge';
import ProposalForm from './ProposalForm';
import ProposalManager from './ProposalManager';
import RoleApplyForm from './RoleApplyForm';
import RoleApplicantsManager from './RoleApplicantsManager';
import {
  POST_TYPE_SHORT, ROLE_TYPE_LABELS, ROLE_TYPE_ICONS,
  POSITION_CATEGORY, POSITION_STATUS_STYLE, COMMITMENT_LABELS, COMPENSATION_LABELS,
} from './projectArkLabels';

const BUDGET_LABEL = { fixed: 'Fixed', hourly: '/hr', equity: 'Equity', volunteer: 'Volunteer', negotiable: 'Negotiable' };
const LOCATION_ICON = { remote: Globe, onsite: MapPin, hybrid: GitMerge };
const INTERNSHIP_LABEL = { paid: 'Paid', unpaid: 'Unpaid', stipend: 'Stipend' };

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

function formatPrice(n) {
  if (n == null) return '';
  return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${n}`;
}

// A single position sub-card with its own apply/propose CTA — the "team you're
// building" view for a project that lists several open positions.
function PositionCard({ position, post, isOwner, myResponse, onApply }) {
  const cat = POSITION_CATEGORY[position.positionCategory] || POSITION_CATEGORY['core-team'];
  const CatIcon = cat.icon;
  const statusStyle = POSITION_STATUS_STYLE[position.status] || POSITION_STATUS_STYLE.open;

  return (
    <div className="glass-card px-4 py-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center shrink-0">
            <CatIcon className="w-4 h-4 text-zinc-300" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-100 truncate">{position.title}</div>
            <div className="text-[11px] text-zinc-500">{cat.label} · {COMMITMENT_LABELS[position.commitment]}</div>
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${statusStyle.className}`}>
          {statusStyle.label}
        </span>
      </div>

      {position.description && (
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{position.description}</p>
      )}

      {position.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {position.requiredSkills.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/60">{s}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/60">
        <span className="text-xs text-zinc-400">
          {COMPENSATION_LABELS[position.compensationType]}
          {position.compensationText ? ` · ${position.compensationText}` : ''}
        </span>
        {!isOwner && (
          myResponse ? (
            <span className="text-[11px] px-2.5 py-1 rounded-lg ring-1 ring-green-800/50 bg-green-950/20 text-green-400">
              {myResponse.status || 'submitted'}
            </span>
          ) : position.status === 'open' && post.status === 'open' ? (
            <button onClick={() => onApply(position)} className="btn-mono px-3 py-1.5 text-xs">
              {position.applyVia === 'application' ? 'Apply' : 'Propose'}
            </button>
          ) : null
        )}
      </div>
    </div>
  );
}

export default function WorkPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const {
    fetchPost, fetchViewerContext, submitProposal, fetchProposals, applyToPost, fetchApplications,
    expressInvestInterest, initiateStartupConversation,
  } = useProjectArk();

  const [post, setPost] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('details');

  const [activePosition, setActivePosition] = useState(null); // position being applied to, or 'flat'
  const [submitting, setSubmitting] = useState(false);
  const [myResponses, setMyResponses] = useState({}); // key: positionId || 'flat' -> { status }

  const [messaging, setMessaging] = useState(false);
  const [showInvest, setShowInvest] = useState(false);
  const [investMessage, setInvestMessage] = useState('');
  const [investSubmitting, setInvestSubmitting] = useState(false);
  const [investSent, setInvestSent] = useState(false);

  useEffect(() => {
    fetchViewerContext().then(setViewer).catch(() => setViewer(null));
  }, [fetchViewerContext]);

  useEffect(() => {
    fetchPost(postId)
      .then(setPost)
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [postId, fetchPost]);

  const isOwner = !!(viewer?.userId && post?.postedBy?._id && String(post.postedBy._id) === String(viewer.userId));
  const isRole = post?.engagementMode === 'role';
  const positions = post?.requiredPositions || [];
  const hasPositions = positions.length > 0;

  const canApplyFlat = post && viewer && !isOwner && !hasPositions && (
    isRole
      ? viewer?.role !== 'startup'
      : ((post.postType === 'project' && viewer?.role !== 'startup') ||
         (post.postType === 'requirement' && viewer?.role === 'startup'))
  );

  useEffect(() => {
    if (!post || isOwner) return;
    Promise.all([
      fetchProposals({ mine: true }).catch(() => []),
      fetchApplications('student').catch(() => []),
    ]).then(([proposals, applications]) => {
      const mine = {};
      proposals
        .filter(p => (p.workPostId?._id || p.workPostId) === postId)
        .forEach(p => { mine[p.positionId || 'flat'] = { status: p.status, kind: 'proposal' }; });
      applications
        .filter(a => (a.workPostId?._id || a.workPostId) === postId)
        .forEach(a => { mine[a.positionId || 'flat'] = { status: a.status, kind: 'application' }; });
      setMyResponses(mine);
    });
  }, [post, postId, isOwner, fetchProposals, fetchApplications]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      const isApplication = activePosition === 'flat' ? isRole : activePosition?.applyVia === 'application';
      if (isApplication) {
        await applyToPost(postId, payload);
      } else {
        await submitProposal(payload);
      }
      const key = activePosition === 'flat' ? 'flat' : activePosition._id;
      setMyResponses(prev => ({ ...prev, [key]: { status: 'pending' } }));
      setActivePosition(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMessageStartup() {
    if (!post?.startupId) return;
    setMessaging(true);
    try {
      const startupId = post.startupId._id || post.startupId;
      await initiateStartupConversation(startupId);
      navigate(`/startupark/chat/${startupId}`);
    } catch {
      navigate(`/startupark/chat/${post.startupId._id || post.startupId}`);
    } finally {
      setMessaging(false);
    }
  }

  async function handleInvestSubmit() {
    setInvestSubmitting(true);
    try {
      await expressInvestInterest(postId, investMessage.trim() || undefined);
      setInvestSent(true);
      setShowInvest(false);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setInvestSubmitting(false);
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

  const RoleIcon = isRole ? (ROLE_TYPE_ICONS[post.roleType] || ROLE_TYPE_ICONS.job) : null;
  const typeLabel = isRole ? ROLE_TYPE_LABELS[post.roleType] || 'Job' : POST_TYPE_SHORT[post.postType] || 'PROJECT';
  const startup = post.startupId;
  const poster = post.postedBy;
  const secondTab = isRole ? 'applicants' : 'proposals';
  const LocationIcon = LOCATION_ICON[post.workLocation] || Globe;
  const canInvest = !isOwner && post.status === 'in_progress';

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
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ring-zinc-700 bg-zinc-800/70 text-zinc-300 tracking-wider">
                {RoleIcon && <RoleIcon className="w-2.5 h-2.5" strokeWidth={2.5} />}
                {typeLabel}
              </span>
              <span className="text-xs text-zinc-500 capitalize">{post.category?.replace('-', ' ')}</span>
              {post.domain && <span className="text-xs text-zinc-600">{post.domain}</span>}
              {isOwner && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ring-zinc-600 bg-zinc-700/60 text-zinc-200">Your Post</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-zinc-100 leading-snug">{post.title}</h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
              <span className="flex items-center gap-1"><LocationIcon className="w-3 h-3" strokeWidth={2} /> <span className="capitalize">{post.workLocation || 'remote'}</span></span>
              <span className="text-zinc-700">·</span>
              {isRole ? (
                <span className="font-semibold text-zinc-300">
                  {post.roleType === 'course'
                    ? (post.price != null ? formatPrice(post.price) : 'Price not disclosed')
                    : (post.salaryText || 'Salary not disclosed')}
                </span>
              ) : (
                <span className="font-semibold text-zinc-300">{formatBudget(post)}{post.budgetType === 'hourly' ? '/hr' : ''}</span>
              )}
              {post.estimatedDuration && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>{post.estimatedDuration}</span>
                </>
              )}
              <span className="text-zinc-700">·</span>
              <span>{post.proposalCount || 0} {isRole ? 'applicants' : 'proposals'}</span>
              <span className="text-zinc-700">·</span>
              <span>{post.viewCount || 0} views</span>
            </div>
          </div>

          {/* CTA area — flat posts only; positioned projects apply per-position below */}
          {!isOwner && !hasPositions && (
            <div className="shrink-0">
              {myResponses.flat ? (
                <div className="text-xs px-3 py-2 rounded-lg ring-1 ring-green-800/50 bg-green-950/20 text-green-400">
                  {isRole ? 'Application' : 'Proposal'} {myResponses.flat.status}
                </div>
              ) : canApplyFlat && post.status === 'open' ? (
                <button onClick={() => setActivePosition('flat')} className="btn-mono px-4 py-2 text-sm">
                  {isRole ? 'Apply Now' : 'Submit Proposal'}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Poster info + contact/invest actions */}
        <div className="glass-card px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
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
          <div className="flex items-center gap-2">
            {post.posterTrust && <TrustBadge trust={post.posterTrust} size="sm" />}
            {!isOwner && startup && (
              <button
                onClick={handleMessageStartup}
                disabled={messaging}
                className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                {messaging ? 'Opening…' : 'Message'}
              </button>
            )}
            {canInvest && (
              investSent ? (
                <span className="text-xs px-3 py-1.5 rounded-lg ring-1 ring-green-800/50 bg-green-950/20 text-green-400">
                  Interest sent
                </span>
              ) : (
                <button
                  onClick={() => setShowInvest(true)}
                  className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
                  Invest Interest
                </button>
              )
            )}
          </div>
        </div>

        {/* Tabs (show Proposals/Applicants tab only for owner) */}
        {isOwner && (
          <div className="flex gap-1 border-b border-zinc-800/60 pb-0">
            {['details', secondTab].map(t => (
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

            {/* Required Positions — the team this project is building */}
            {hasPositions && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Team You're Building ({positions.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {positions.map(position => (
                    <PositionCard
                      key={position._id}
                      position={position}
                      post={post}
                      isOwner={isOwner}
                      myResponse={myResponses[position._id]}
                      onApply={setActivePosition}
                    />
                  ))}
                </div>
              </div>
            )}

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

            {/* Perks (role posts) */}
            {isRole && post.perks?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Perks</h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.perks.map(p => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/60">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(isRole ? [
                { label: 'Role Type', value: post.roleType },
                { label: 'Internship Type', value: post.roleType === 'internship' ? INTERNSHIP_LABEL[post.internshipType] : null },
                { label: post.roleType === 'course' ? 'Price' : 'Salary', value: post.roleType === 'course' ? (post.price != null ? formatPrice(post.price) : null) : post.salaryText },
                { label: 'Deadline', value: post.deadline ? new Date(post.deadline).toLocaleDateString() : null },
                { label: 'Experience', value: post.preferredExperience },
              ] : [
                { label: 'Work Type', value: post.workType?.replace('-', ' ') },
                { label: 'Budget Type', value: BUDGET_LABEL[post.budgetType] || post.budgetType },
                { label: 'Deadline', value: post.deadline ? new Date(post.deadline).toLocaleDateString() : null },
                { label: 'Experience', value: post.preferredExperience },
              ]).filter(i => i.value).map(item => (
                <div key={item.label} className="glass-card px-3 py-2.5">
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className="text-xs text-zinc-300 capitalize">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Milestones (gig-only) */}
            {!isRole && post.milestones?.length > 0 && (
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

        {isOwner && tab === 'proposals' && !isRole && (
          <ProposalManager workPostId={postId} positions={positions} />
        )}

        {isOwner && tab === 'applicants' && isRole && (
          <RoleApplicantsManager workPostId={postId} positions={positions} />
        )}
      </div>

      {/* Proposal form modal */}
      {activePosition && (activePosition === 'flat' ? !isRole : activePosition.applyVia === 'proposal') && (
        <ProposalForm
          post={post}
          position={activePosition === 'flat' ? null : activePosition}
          onSubmit={handleSubmit}
          onClose={() => setActivePosition(null)}
          loading={submitting}
        />
      )}

      {/* Role apply form modal */}
      {activePosition && (activePosition === 'flat' ? isRole : activePosition.applyVia === 'application') && (
        <RoleApplyForm
          post={post}
          position={activePosition === 'flat' ? null : activePosition}
          onSubmit={handleSubmit}
          onClose={() => setActivePosition(null)}
          loading={submitting}
        />
      )}

      {/* Invest interest modal */}
      {showInvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800/60">
              <h2 className="text-sm font-semibold text-zinc-100">Express Investment Interest</h2>
              <button onClick={() => setShowInvest(false)} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-zinc-500">
                This lets {startup?.companyName || 'the founder'} know you'd like to talk about investing in "{post.title}".
                No money or equity terms are exchanged here — it just notifies them so they can follow up with you directly.
              </p>
              <textarea
                value={investMessage}
                onChange={e => setInvestMessage(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="A short note about your interest (optional)…"
                className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowInvest(false)} className="flex-1 py-2 text-xs font-medium rounded-lg ring-1 ring-zinc-700 text-zinc-400 hover:ring-zinc-500 hover:text-zinc-200 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleInvestSubmit}
                  disabled={investSubmitting}
                  className="flex-1 py-2 text-xs font-medium btn-mono rounded-lg disabled:opacity-50"
                >
                  {investSubmitting ? 'Sending…' : 'Send Interest'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
