import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, GitMerge } from 'lucide-react';
import { ROLE_TYPE_LABELS, ROLE_TYPE_ICONS } from './projectArkLabels';
import { formatCurrency } from '../../../../utils/currency';

const LOCATION_ICON = { remote: Globe, onsite: MapPin, hybrid: GitMerge };

const STATUS_STYLE = {
  draft:  { label: 'Draft', className: 'text-zinc-400 dark:text-zinc-500 ring-black/10 dark:ring-zinc-800 bg-black/[0.03] dark:bg-zinc-900/60' },
  closed: { label: 'Closed', className: 'text-zinc-400 dark:text-zinc-500 ring-black/10 dark:ring-zinc-800 bg-black/[0.03] dark:bg-zinc-900/60' },
};

function formatPrice(n) {
  if (n == null) return '';
  return formatCurrency(n, { compact: true });
}

export default function OpportunityCard({ opportunity, isOwner }) {
  const navigate = useNavigate();
  const LocationIcon = LOCATION_ICON[opportunity.location] || Globe;
  const TypeIcon = ROLE_TYPE_ICONS[opportunity.type] || ROLE_TYPE_ICONS.job;
  const startup = opportunity.startupId;
  const detailPath = `/startupark/projectark/opportunities/${opportunity._id}`;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      onClick={() => navigate(detailPath)}
      className={`glass-card flex flex-col gap-3 p-4 cursor-pointer transition-all duration-200 ${
        isOwner ? 'ring-2 ring-zinc-400 dark:ring-zinc-500' : 'hover:ring-1 hover:ring-black/10 dark:hover:ring-zinc-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ring-black/10 dark:ring-zinc-700 bg-black/[0.04] dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300 tracking-wider">
            <TypeIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
            {ROLE_TYPE_LABELS[opportunity.type] || 'Job'}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">{opportunity.category}</span>
          {STATUS_STYLE[opportunity.status] && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ring-1 ${STATUS_STYLE[opportunity.status].className}`}>
              {STATUS_STYLE[opportunity.status].label}
            </span>
          )}
          {isOwner && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ring-black/10 dark:ring-zinc-600 bg-black/[0.05] dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200">
              Your Post
            </span>
          )}
        </div>
      </div>

      <Link
        to={detailPath}
        onClick={e => e.stopPropagation()}
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 hover:text-zinc-600 dark:hover:text-white transition-colors"
      >
        {opportunity.title}
      </Link>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{opportunity.description}</p>

      {opportunity.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {opportunity.skills.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 ring-1 ring-black/10 dark:ring-zinc-700/60">
              {s}
            </span>
          ))}
          {opportunity.skills.length > 4 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 self-center">+{opportunity.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-zinc-800/60">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          {opportunity.type === 'course'
            ? (opportunity.price != null ? formatPrice(opportunity.price) : 'Price not disclosed')
            : (opportunity.salary || 'Salary not disclosed')}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
          <LocationIcon className="w-3 h-3" strokeWidth={2} />
          <span className="capitalize">{opportunity.location || 'remote'}</span>
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-600 -mt-1">
        <span>{opportunity.applicationCount || 0} {opportunity.applicationCount === 1 ? 'applicant' : 'applicants'}</span>
      </div>

      {startup && (
        <div className="flex items-center gap-1.5 -mt-1">
          {startup.logo ? (
            <img src={startup.logo} alt="" className="w-4 h-4 rounded object-cover" />
          ) : (
            <div className="w-4 h-4 rounded bg-black/[0.08] dark:bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-500 dark:text-zinc-400">
              {startup.companyName?.[0] || 'S'}
            </div>
          )}
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{startup.companyName}</span>
        </div>
      )}
    </motion.div>
  );
}
