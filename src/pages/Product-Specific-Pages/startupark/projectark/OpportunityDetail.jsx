import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Globe, MapPin, GitMerge } from 'lucide-react';
import { toast } from 'react-toastify';
import { useOpportunities } from './useOpportunities';
import { useProjectArk } from './useProjectArk';
import RoleApplyForm from './RoleApplyForm';
import OpportunityApplicantsManager from './OpportunityApplicantsManager';
import { ROLE_TYPE_LABELS, ROLE_TYPE_ICONS } from './projectArkLabels';
import { formatCurrency } from '../../../../utils/currency';

const LOCATION_ICON = { remote: Globe, onsite: MapPin, hybrid: GitMerge };
const INTERNSHIP_LABEL = { paid: 'Paid', unpaid: 'Unpaid', stipend: 'Stipend' };

function formatPrice(n) {
  if (n == null) return '';
  return formatCurrency(n, { compact: true });
}

export default function OpportunityDetail() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const { fetchOpportunity, applyToOpportunity, fetchApplications, initiateStartupConversation } = useOpportunities();
  const { fetchViewerContext } = useProjectArk();

  const [opportunity, setOpportunity] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('details');
  const [showApply, setShowApply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myResponse, setMyResponse] = useState(null);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    fetchViewerContext().then(setViewer).catch(() => setViewer(null));
  }, [fetchViewerContext]);

  useEffect(() => {
    fetchOpportunity(opportunityId)
      .then(setOpportunity)
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [opportunityId, fetchOpportunity]);

  const isOwner = !!(viewer?.startupId && opportunity?.startupId?._id && String(opportunity.startupId._id) === String(viewer.startupId));
  const canApply = opportunity && viewer && !isOwner && viewer.role !== 'startup';

  useEffect(() => {
    if (!opportunity || isOwner) return;
    fetchApplications('student').then(applications => {
      const mine = applications.find(a => (a.opportunityId?._id || a.opportunityId) === opportunityId);
      if (mine) setMyResponse(mine);
    }).catch(() => {});
  }, [opportunity, opportunityId, isOwner, fetchApplications]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      const application = await applyToOpportunity(opportunityId, payload);
      setMyResponse(application || { status: 'pending' });
      setShowApply(false);
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMessageStartup() {
    if (!opportunity?.startupId?._id) return;
    setMessaging(true);
    try {
      await initiateStartupConversation(opportunity.startupId._id);
      navigate('/startupark/chat');
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Could not start chat. Please try again.');
    } finally {
      setMessaging(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (err || !opportunity) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-400">{err || 'Opportunity not found'}</p>
        <button onClick={() => navigate('/startupark/projectark?mode=opportunity')} className="text-xs text-zinc-500 hover:text-zinc-300">
          Back to Project Ark
        </button>
      </div>
    );
  }

  const TypeIcon = ROLE_TYPE_ICONS[opportunity.type] || ROLE_TYPE_ICONS.job;
  const LocationIcon = LOCATION_ICON[opportunity.location] || Globe;
  const startup = opportunity.startupId;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-3">
        <div className="max-w-4xl lg:max-w-[1600px] mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/startupark/projectark?mode=opportunity')} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            ← Project Ark
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 line-clamp-1 flex-1">{opportunity.title}</span>
        </div>
      </div>

      <div className="max-w-4xl lg:max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ring-zinc-700 bg-zinc-800/70 text-zinc-300 tracking-wider">
                <TypeIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                {ROLE_TYPE_LABELS[opportunity.type] || 'Job'}
              </span>
              <span className="text-xs text-zinc-500 capitalize">{opportunity.category}</span>
              {isOwner && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ring-zinc-600 bg-zinc-700/60 text-zinc-200">Your Post</span>}
            </div>
            <h1 className="text-xl font-bold text-zinc-100 leading-snug">{opportunity.title}</h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
              <span className="flex items-center gap-1"><LocationIcon className="w-3 h-3" strokeWidth={2} /> <span className="capitalize">{opportunity.location || 'remote'}</span></span>
              <span className="text-zinc-700">·</span>
              <span className="font-semibold text-zinc-300">
                {opportunity.type === 'course'
                  ? (opportunity.price != null ? formatPrice(opportunity.price) : 'Price not disclosed')
                  : (opportunity.salary || 'Salary not disclosed')}
              </span>
              {opportunity.deadline && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>Deadline {new Date(opportunity.deadline).toLocaleDateString()}</span>
                </>
              )}
              <span className="text-zinc-700">·</span>
              <span>{opportunity.applicationCount || 0} applicants</span>
            </div>
          </div>

          {!isOwner && (
            <div className="shrink-0">
              {myResponse ? (
                <div className="text-xs px-3 py-2 rounded-lg ring-1 ring-green-800/50 bg-green-950/20 text-green-400 flex flex-col items-end gap-1">
                  <span>Application {myResponse.status}</span>
                  {myResponse.status === 'accepted' && myResponse.conversationId && (
                    <a href="/startupark/chat" className="text-emerald-300 underline underline-offset-2">Open chat</a>
                  )}
                </div>
              ) : canApply && opportunity.status === 'active' ? (
                <button onClick={() => setShowApply(true)} className="btn-mono px-4 py-2 text-sm">Apply Now</button>
              ) : null}
            </div>
          )}
        </div>

        <div className="glass-card px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {startup?.logo ? (
              <img src={startup.logo} alt="" className="w-9 h-9 rounded object-cover" />
            ) : (
              <div className="w-9 h-9 rounded bg-zinc-800 flex items-center justify-center text-sm text-zinc-400">
                {startup?.companyName?.[0] || 'S'}
              </div>
            )}
            <div className="text-sm font-medium text-zinc-200">{startup?.companyName}</div>
          </div>
          {!isOwner && startup && (
            <button onClick={handleMessageStartup} disabled={messaging} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50">
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
              {messaging ? 'Opening…' : 'Message'}
            </button>
          )}
        </div>

        {isOwner && (
          <div className="flex gap-1 border-b border-zinc-800/60 pb-0">
            {['details', 'applicants'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t ? 'border-zinc-400 text-zinc-200' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {(!isOwner || tab === 'details') && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{opportunity.description}</p>
            </div>

            {opportunity.requirements && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Requirements</h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{opportunity.requirements}</p>
              </div>
            )}

            {opportunity.skills?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.skills.map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/60">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {opportunity.perks?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Perks</h3>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.perks.map(p => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/60">{p}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Type', value: opportunity.type },
                { label: 'Internship Type', value: opportunity.type === 'internship' ? INTERNSHIP_LABEL[opportunity.internshipType] : null },
                { label: opportunity.type === 'course' ? 'Price' : 'Salary', value: opportunity.type === 'course' ? (opportunity.price != null ? formatPrice(opportunity.price) : null) : opportunity.salary },
                { label: 'Deadline', value: opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : null },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="glass-card px-3 py-2.5">
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className="text-xs text-zinc-300 capitalize">{item.value}</div>
                </div>
              ))}
            </div>

            {opportunity.status !== 'active' && (
              <div className="glass-card px-4 py-3 text-center">
                <span className="text-xs text-zinc-500 capitalize">This opportunity is <strong className="text-zinc-300">{opportunity.status}</strong></span>
              </div>
            )}
          </div>
        )}

        {isOwner && tab === 'applicants' && (
          <OpportunityApplicantsManager opportunityId={opportunityId} />
        )}
      </div>

      {showApply && (
        <RoleApplyForm
          post={opportunity}
          position={null}
          onSubmit={handleSubmit}
          onClose={() => setShowApply(false)}
          loading={submitting}
        />
      )}
    </div>
  );
}
