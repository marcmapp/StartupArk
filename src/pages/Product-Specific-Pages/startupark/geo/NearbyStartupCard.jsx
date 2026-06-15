// src/pages/.../startupark/geo/NearbyStartupCard.jsx
// Handles both startup entity (companyName/logo) and user entity (username/profilePicture).
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { formatDistance } from '../../../../services/geoLocator';

const R2_BASE = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

export default function NearbyStartupCard({ startup: item, entity = 'startup' }) {
  const isStartup = entity === 'startup' || !!(item.companyName);

  const displayName = isStartup
    ? item.companyName
    : (item.username || item.email || 'User');

  const subtitle = isStartup
    ? (item.tagline || item.industry || '')
    : (item.profession || item.expertise?.[0] || '');

  const imageKey = isStartup ? item.logo : item.profilePicture;
  const imageSrc = imageKey ? `${R2_BASE}/${imageKey}` : null;

  const badge = isStartup
    ? item.fundingStage
    : (item.expertise?.[0] ?? null);

  const linkTo = isStartup
    ? `/startupark/startups/${item._id}`
    : '#';

  const distLabel =
    item.distanceKm != null
      ? formatDistance(item.distanceKm)
      : item.location?.city || '';

  return (
    <Link to={linkTo} className="block group">
      <div className="glass-card p-4 h-full hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={displayName}
              className="h-10 w-10 rounded-lg object-contain bg-white dark:bg-zinc-800 p-1 flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="h-10 w-10 rounded-lg glass-inset flex items-center justify-center text-sm font-bold text-zinc-500 flex-shrink-0">
              {(displayName || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm truncate group-hover:underline">
              {displayName}
            </h3>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {isStartup && item.tagline && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
            {item.tagline}
          </p>
        )}

        {!isStartup && item.expertise && item.expertise.length > 1 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
            {item.expertise.slice(0, 3).join(' · ')}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          {distLabel && (
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <FiMapPin className="h-3 w-3 flex-shrink-0" />
              <span>{distLabel}</span>
            </div>
          )}
          {badge && (
            <span className="glass-inset text-xs text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full ml-auto">
              {badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
