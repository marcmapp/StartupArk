import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const AVAILABILITY_LABEL = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  internship: 'Internship',
  freelance: 'Freelance',
  'not-available': 'Not available',
};

export default function TalentPostCard({ talentPost, isOwner }) {
  const navigate = useNavigate();
  const owner = talentPost.owner;
  const detailPath = `/startupark/students-hub/talent/${talentPost._id}`;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      onClick={() => navigate(detailPath)}
      className={`glass-card flex flex-col gap-3 p-4 cursor-pointer transition-all duration-200 ${
        isOwner ? 'ring-2 ring-zinc-400 dark:ring-zinc-500' : 'hover:ring-1 hover:ring-black/10 dark:hover:ring-zinc-600'
      }`}
    >
      <div className="flex items-center gap-3">
        {owner?.profilePicture ? (
          <img src={owner.profilePicture} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-black/[0.06] dark:bg-zinc-800 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
            {owner?.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link
            to={detailPath}
            onClick={e => e.stopPropagation()}
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-white transition-colors truncate block"
          >
            {talentPost.headline}
          </Link>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500 truncate">{owner?.username || 'Member'}</div>
        </div>
        {isOwner && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ring-black/10 dark:ring-zinc-600 bg-black/[0.05] dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 shrink-0">
            Yours
          </span>
        )}
        {talentPost.visibility === 'draft' && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ring-amber-700/50 bg-amber-950/30 text-amber-400 shrink-0">
            Draft
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{talentPost.pitch}</p>

      {talentPost.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {talentPost.skills.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 ring-1 ring-black/10 dark:ring-zinc-700/60">
              {s}
            </span>
          ))}
          {talentPost.skills.length > 4 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 self-center">+{talentPost.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" strokeWidth={2} />
          {AVAILABILITY_LABEL[talentPost.availability] || talentPost.availability}
        </span>
      </div>
    </motion.div>
  );
}
