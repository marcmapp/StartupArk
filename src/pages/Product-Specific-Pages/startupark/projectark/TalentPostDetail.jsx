import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { useTalentPosts } from './useTalentPosts';
import { useProjectArk } from './useProjectArk';
import TalentPostInvitesManager from './TalentPostInvitesManager';

const AVAILABILITY_LABEL = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  internship: 'Internship',
  freelance: 'Freelance',
  'not-available': 'Not available',
};

export default function TalentPostDetail() {
  const { talentPostId } = useParams();
  const navigate = useNavigate();
  const { fetchTalentPost, deleteTalentPost, inviteTalentPost } = useTalentPosts();
  const { fetchViewerContext } = useProjectArk();

  const [post, setPost] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('details');
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchViewerContext().then(setViewer).catch(() => setViewer(null));
  }, [fetchViewerContext]);

  useEffect(() => {
    fetchTalentPost(talentPostId)
      .then(setPost)
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [talentPostId, fetchTalentPost]);

  const isOwner = !!(viewer?.userId && post?.owner?._id && String(post.owner._id) === String(viewer.userId));
  const canInvite = !isOwner && viewer?.role === 'startup';

  async function handleInvite() {
    setInviting(true);
    try {
      await inviteTalentPost(talentPostId);
      setInviteSent(true);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this talent post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteTalentPost(talentPostId);
      navigate('/startupark/students-hub?tab=talent');
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
      setDeleting(false);
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
        <p className="text-sm text-red-400">{err || 'Talent post not found'}</p>
        <button onClick={() => navigate('/startupark/students-hub?tab=talent')} className="text-xs text-zinc-500 hover:text-zinc-300">
          Back to Students Hub
        </button>
      </div>
    );
  }

  const owner = post.owner;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/startupark/students-hub?tab=talent')} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            ← Students Hub
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 line-clamp-1 flex-1">{post.headline}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {owner?.profilePicture ? (
              <img src={owner.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm text-zinc-400">
                {owner?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-zinc-100 leading-snug">{post.headline}</h1>
              <div className="text-xs text-zinc-500">{owner?.username}</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={() => navigate(`/startupark/students-hub/talent/${talentPostId}/edit`)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs px-3 py-1.5 rounded-lg ring-1 ring-red-900/60 text-red-400 hover:ring-red-800 hover:bg-red-950/20 disabled:opacity-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </>
            )}
            {canInvite && (
              inviteSent ? (
                <span className="text-xs px-3 py-2 rounded-lg ring-1 ring-green-800/50 bg-green-950/20 text-green-400">Invite sent</span>
              ) : (
                <button onClick={handleInvite} disabled={inviting} className="btn-mono px-4 py-2 text-sm disabled:opacity-50">
                  {inviting ? 'Sending…' : 'Invite'}
                </button>
              )
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-1 border-b border-zinc-800/60 pb-0">
            {['details', 'invites'].map(t => (
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
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pitch</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{post.pitch}</p>
            </div>

            {post.skills?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.skills.map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/60">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card px-3 py-2.5 w-fit flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
              <span className="text-xs text-zinc-300">{AVAILABILITY_LABEL[post.availability] || post.availability}</span>
            </div>

            {isOwner && post.visibility === 'draft' && (
              <div className="glass-card px-4 py-3 text-center">
                <span className="text-xs text-zinc-500">This post is a <strong className="text-zinc-300">draft</strong> — publish it from Edit to make it visible on the Talent tab.</span>
              </div>
            )}
          </div>
        )}

        {isOwner && tab === 'invites' && (
          <TalentPostInvitesManager talentPostId={talentPostId} />
        )}
      </div>
    </div>
  );
}
