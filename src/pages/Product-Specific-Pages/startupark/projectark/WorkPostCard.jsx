import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TrustBadge from './TrustBadge';

const BUDGET_LABEL = { fixed: 'Fixed', hourly: '/hr', equity: 'Equity', volunteer: 'Volunteer', negotiable: 'Negotiable' };
const LOCATION_ICON = { remote: '🌐', onsite: '📍', hybrid: '⇌' };

function formatBudget(post) {
  if (post.budgetType === 'volunteer') return 'Volunteer';
  if (post.budgetType === 'equity') return 'Equity';
  if (post.budgetType === 'negotiable') return 'Negotiable';
  if (!post.budgetMin && !post.budgetMax) return 'Open';
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${n}`;
  if (post.budgetMin && post.budgetMax) return `${fmt(post.budgetMin)} – ${fmt(post.budgetMax)}`;
  if (post.budgetMax) return `≤ ${fmt(post.budgetMax)}`;
  return `${fmt(post.budgetMin)}+`;
}

const TYPE_STYLES = {
  project:     { badge: 'ring-blue-800 text-blue-400 bg-blue-950/40', label: 'PROJECT' },
  requirement: { badge: 'ring-purple-800 text-purple-400 bg-purple-950/40', label: 'REQUIREMENT' },
};

export default function WorkPostCard({ post, userRole }) {
  const navigate = useNavigate();
  const typeStyle = TYPE_STYLES[post.postType] || TYPE_STYLES.project;
  const startup = post.startupId;
  const canApply = (post.postType === 'project' && userRole !== 'startup') ||
                   (post.postType === 'requirement' && userRole === 'startup');

  return (
    <div className="glass-card flex flex-col gap-3 overflow-hidden group hover:ring-zinc-600 transition-all duration-200">
      {/* Colored top strip */}
      <div className={`h-0.5 w-full ${post.postType === 'project' ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-purple-600 to-purple-400'}`} />

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 tracking-wider ${typeStyle.badge}`}>
              {typeStyle.label}
            </span>
            <span className="text-[10px] text-zinc-500 capitalize">{post.category?.replace('-', ' ')}</span>
          </div>
          {post.posterTrust && <TrustBadge trust={post.posterTrust} size="xs" />}
        </div>

        {/* Title */}
        <Link
          to={`/startupark/projectark/posts/${post._id}`}
          className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 hover:text-white transition-colors"
        >
          {post.title}
        </Link>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {post.description}
        </p>

        {/* Skills */}
        {post.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.requiredSkills.slice(0, 4).map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/60">
                {s}
              </span>
            ))}
            {post.requiredSkills.length > 4 && (
              <span className="text-[10px] text-zinc-600 self-center">+{post.requiredSkills.length - 4}</span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
          <div className="flex items-center gap-3">
            {/* Budget */}
            <div>
              <span className="text-xs font-semibold text-zinc-200">{formatBudget(post)}</span>
              {post.budgetType === 'hourly' && <span className="text-[10px] text-zinc-500 ml-0.5">/hr</span>}
            </div>
            {/* Location */}
            <span className="text-xs text-zinc-500 flex items-center gap-0.5">
              <span>{LOCATION_ICON[post.workLocation] || '🌐'}</span>
              <span className="capitalize">{post.workLocation || 'remote'}</span>
            </span>
          </div>
          {/* Proposal count */}
          <span className="text-[10px] text-zinc-600">
            {post.proposalCount || 0} {post.proposalCount === 1 ? 'proposal' : 'proposals'}
          </span>
        </div>

        {/* Startup badge (for project posts) */}
        {startup && (
          <div className="flex items-center gap-1.5 -mt-1">
            {startup.logo ? (
              <img src={startup.logo} alt="" className="w-4 h-4 rounded object-cover" />
            ) : (
              <div className="w-4 h-4 rounded bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-400">
                {startup.companyName?.[0] || 'S'}
              </div>
            )}
            <span className="text-[10px] text-zinc-500 truncate">{startup.companyName}</span>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate(`/startupark/projectark/posts/${post._id}`)}
          className={`w-full py-2 text-xs font-medium rounded-lg ring-1 transition-all ${
            canApply
              ? 'btn-mono ring-0'
              : 'ring-zinc-800 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300 bg-zinc-900/50'
          }`}
        >
          {canApply ? 'View & Apply' : 'View Details'}
        </button>
      </div>
    </div>
  );
}
