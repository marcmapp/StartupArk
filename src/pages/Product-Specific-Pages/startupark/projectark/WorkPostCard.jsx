import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Globe, GitMerge, Users2 } from 'lucide-react';
import TrustBadge from './TrustBadge';
import {
  POST_TYPE_SHORT, ROLE_TYPE_LABELS, ROLE_TYPE_ICONS,
  POSITION_CATEGORY, POSITION_STATUS_STYLE,
} from './projectArkLabels';

const LOCATION_ICON = { remote: Globe, onsite: MapPin, hybrid: GitMerge };

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

function formatPrice(n) {
  if (!n && n !== 0) return '';
  return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${n}`;
}

const VISIBLE_POSITIONS = 3;

export default function WorkPostCard({ post, userRole, viewerId }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const isRole = post.engagementMode === 'role';
  const isOwner = viewerId && post.postedBy?._id && String(post.postedBy._id) === String(viewerId);
  const LocationIcon = LOCATION_ICON[post.workLocation] || Globe;
  const RoleIcon = isRole ? (ROLE_TYPE_ICONS[post.roleType] || ROLE_TYPE_ICONS.job) : null;

  const canApply = !isOwner && (isRole
    ? userRole !== 'startup'
    : ((post.postType === 'project' && userRole !== 'startup') ||
       (post.postType === 'requirement' && userRole === 'startup')));

  const positions = post.requiredPositions || [];
  const visiblePositions = expanded ? positions : positions.slice(0, VISIBLE_POSITIONS);
  const hiddenCount = positions.length - visiblePositions.length;

  const typeLabel = isRole ? ROLE_TYPE_LABELS[post.roleType] || 'Job' : POST_TYPE_SHORT[post.postType] || 'PROJECT';
  const startup = post.startupId;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      onClick={() => navigate(`/startupark/projectark/posts/${post._id}`)}
      className={`glass-card flex flex-col gap-3 overflow-hidden cursor-pointer transition-all duration-200 ${
        isOwner ? 'ring-2 ring-zinc-500' : 'hover:ring-zinc-600'
      }`}
    >
      <div className="px-4 pt-4 pb-1 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ring-zinc-700 bg-zinc-800/70 text-zinc-300 tracking-wider">
              {RoleIcon && <RoleIcon className="w-2.5 h-2.5" strokeWidth={2.5} />}
              {typeLabel}
            </span>
            <span className="text-[10px] text-zinc-500 capitalize">{post.category?.replace('-', ' ')}</span>
            {isOwner && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ring-zinc-600 bg-zinc-700/60 text-zinc-200">
                Your Post
              </span>
            )}
          </div>
          {post.posterTrust && <TrustBadge trust={post.posterTrust} size="xs" />}
        </div>

        {/* Title */}
        <Link
          to={`/startupark/projectark/posts/${post._id}`}
          onClick={e => e.stopPropagation()}
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
            {isRole ? (
              <span className="text-xs font-semibold text-zinc-200">
                {post.roleType === 'course'
                  ? (post.price != null ? formatPrice(post.price) : 'Price not disclosed')
                  : (post.salaryText || 'Salary not disclosed')}
              </span>
            ) : (
              <span className="text-xs font-semibold text-zinc-200">
                {formatBudget(post)}{post.budgetType === 'hourly' && <span className="text-[10px] text-zinc-500 ml-0.5">/hr</span>}
              </span>
            )}
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <LocationIcon className="w-3 h-3" strokeWidth={2} />
              <span className="capitalize">{post.workLocation || 'remote'}</span>
            </span>
          </div>
          <span className="text-[10px] text-zinc-600">
            {post.proposalCount || 0} {isRole ? (post.proposalCount === 1 ? 'applicant' : 'applicants') : (post.proposalCount === 1 ? 'proposal' : 'proposals')}
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
      </div>

      {/* Required positions accordion — the "who this project needs" preview */}
      {positions.length > 0 && (
        <div className="px-4 pb-1">
          <div className="glass-inset divide-y divide-zinc-800/60 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <Users2 className="w-3 h-3" strokeWidth={2} />
              Required Positions ({positions.length})
            </div>
            {visiblePositions.map(pos => {
              const cat = POSITION_CATEGORY[pos.positionCategory] || POSITION_CATEGORY['core-team'];
              const CatIcon = cat.icon;
              const statusStyle = POSITION_STATUS_STYLE[pos.status] || POSITION_STATUS_STYLE.open;
              return (
                <div key={pos._id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CatIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                    <span className="text-xs text-zinc-300 truncate">{pos.title}</span>
                  </div>
                  <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ring-1 ${statusStyle.className}`}>
                    {statusStyle.label}
                  </span>
                </div>
              );
            })}
            {positions.length > VISIBLE_POSITIONS && (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={expanded ? 'less' : 'more'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    {expanded ? 'Show less' : `+${hiddenCount} more`}
                    <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                  </motion.span>
                </AnimatePresence>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pb-4">
        <button
          onClick={e => { e.stopPropagation(); navigate(`/startupark/projectark/posts/${post._id}`); }}
          className={`w-full py-2 text-xs font-medium rounded-lg ring-1 transition-all ${
            isOwner
              ? 'ring-zinc-600 text-zinc-200 hover:ring-zinc-400 bg-zinc-800/60'
              : canApply
                ? 'btn-mono ring-0'
                : 'ring-zinc-800 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300 bg-zinc-900/50'
          }`}
        >
          {isOwner
            ? (isRole ? 'Manage Applicants' : 'Manage Proposals')
            : (canApply && post.status === 'open' ? 'View & Apply' : 'View Details')}
        </button>
      </div>
    </motion.div>
  );
}
