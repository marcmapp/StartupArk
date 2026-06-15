import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiArrowUpRight } from 'react-icons/fi';
import DefaultLogo from '../../../../../../assets/MP-white-bg.png';
import { getImageUrl } from '../../../../../../utils/imageUrls';

const StartupCard = ({ startup, isFavorite, onToggleFavorite }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const logoUrl = getImageUrl(startup.logo, baseUrl);
  const bannerUrl = getImageUrl(startup.banner, baseUrl);
  const hasLogo = logoUrl && logoUrl !== DefaultLogo;
  const bgImage = bannerUrl || (hasLogo ? logoUrl : null);
  const name = startup.companyName || startup.startupName || 'Startup';
  const initial = name.charAt(0).toUpperCase();

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { await onToggleFavorite(startup._id, !isFavorite); }
    catch (err) { console.error('Error toggling favorite:', err); }
  };

  return (
    <Link to={`/startupark/startups/${startup._id}`} className="block group">
      <div className="relative h-56 rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">

        {/* Mono base layer (shows when no image / while loading) */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />

        {/* Background image */}
        {bgImage && (
          <img
            src={bgImage}
            alt={name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15 hover:bg-black/50 transition-all"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FiHeart className={`h-4 w-4 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} strokeWidth={isFavorite ? 2 : 1.5} />
        </button>

        {/* Availability badge */}
        {startup.availability?.days?.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">Available</span>
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-10">
          <div className="flex items-end gap-3">
            {/* Logo chip */}
            <div className="h-11 w-11 rounded-xl overflow-hidden border border-white/20 bg-white flex items-center justify-center flex-shrink-0 shadow-lg">
              {hasLogo ? (
                <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <div className={`h-full w-full ${hasLogo ? 'hidden' : 'flex'} items-center justify-center bg-zinc-900 text-white font-bold`}>
                {initial}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-base leading-tight truncate">{name}</h3>
              <p className="text-white/70 text-xs truncate">{startup.tagline || startup.industry || ''}</p>
            </div>

            <div className="flex-shrink-0 text-white/60 group-hover:text-white transition-colors">
              <FiArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {startup.industry && (
              <span className="text-[10px] font-medium text-white bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                {startup.industry}
              </span>
            )}
            {startup.fundingStage && (
              <span className="text-[10px] font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                {startup.fundingStage}
              </span>
            )}
            {startup.location && (
              <span className="text-[10px] text-white/70 flex items-center gap-0.5">
                <FiMapPin className="h-3 w-3" />
                {typeof startup.location === 'object'
                  ? [startup.location?.city, startup.location?.state].filter(Boolean).join(', ')
                  : startup.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StartupCard;
