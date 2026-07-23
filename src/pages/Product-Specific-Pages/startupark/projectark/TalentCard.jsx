import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase } from 'lucide-react';
import TrustBadge from './TrustBadge';

export default function TalentCard({ profile }) {
  const navigate = useNavigate();
  const detailPath = `/startupark/projectark/talent/${profile.profileType}/${profile.id}`;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      onClick={() => navigate(detailPath)}
      className="glass-card flex flex-col gap-3 p-4 cursor-pointer hover:ring-1 hover:ring-black/10 dark:hover:ring-zinc-600 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        {profile.profilePicture ? (
          <img src={profile.profilePicture} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-black/[0.06] dark:bg-zinc-800 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
            {profile.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link
            to={detailPath}
            onClick={e => e.stopPropagation()}
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-white transition-colors truncate block"
          >
            {profile.username || 'Member'}
          </Link>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500 truncate">{profile.headline}</div>
        </div>
        {profile.posterTrust && <TrustBadge trust={profile.posterTrust} size="xs" />}
      </div>

      {profile.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.skills.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 ring-1 ring-black/10 dark:ring-zinc-700/60">
              {s}
            </span>
          ))}
          {profile.skills.length > 4 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 self-center">+{profile.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-500">
        <span className="flex items-center gap-1">
          <Briefcase className="w-3 h-3" strokeWidth={2} />
          {profile.portfolioCount || 0} portfolio {profile.portfolioCount === 1 ? 'item' : 'items'}
        </span>
        {(profile.city || profile.state) && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" strokeWidth={2} />
            {[profile.city, profile.state].filter(Boolean).join(', ')}
          </span>
        )}
      </div>
    </motion.div>
  );
}
