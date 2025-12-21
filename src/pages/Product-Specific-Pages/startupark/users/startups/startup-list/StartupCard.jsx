import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiTrendingUp, FiUsers, FiStar } from 'react-icons/fi';
import { MdRocketLaunch, MdWorkspacePremium } from 'react-icons/md';
import DefaultLogo from '../../../../../../assets/MP-white-bg.png';
import { getImageUrl } from '../../../../../../utils/imageUrls';

const StartupCard = ({ startup, isFavorite, onToggleFavorite, isCurrentUser, isHovered }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const logoUrl = getImageUrl(startup.logo, baseUrl);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await onToggleFavorite(startup._id, !isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Get industry color
  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': 'from-blue-500 to-cyan-500',
      'Finance': 'from-emerald-500 to-teal-500',
      'Healthcare': 'from-rose-500 to-pink-500',
      'Education': 'from-violet-500 to-purple-500',
      'E-commerce': 'from-amber-500 to-orange-500',
      'Default': 'from-gray-500 to-slate-500'
    };
    return colors[industry] || colors['Default'];
  };

  return (
    <Link 
      to={`/startupark/startups/${startup._id}`} 
      className="block group relative"
    >
      {/* Glow effect on hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getIndustryColor(startup.industry)} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500 ${isHovered ? 'opacity-30' : ''}`}></div>
      
      <div className="relative bg-gradient-to-b from-white to-gray-50/50 rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full backdrop-blur-sm">
        {/* Card Header with gradient */}
        <div className={`relative h-40 bg-gradient-to-br ${getIndustryColor(startup.industry)} p-6`}>
          {/* Favorite button */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-300 group/favorite"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FiHeart 
              className={`h-5 w-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-500 group-hover/favorite:text-red-400'}`} 
              strokeWidth={isFavorite ? 2 : 1.5}
            />
          </button>

          {/* Trending badge */}
          {startup.trending && (
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-amber-600">
              <FiTrendingUp className="h-3 w-3" />
              Trending
            </div>
          )}

          {/* Match score */}
          <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
            <div className="text-xs font-bold text-white">{startup.matchScore}%</div>
          </div>

          {/* Logo */}
          <div className="absolute -bottom-8 left-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-white/30 rounded-xl blur-md"></div>
              <div className="relative h-20 w-20 rounded-xl bg-white shadow-2xl border-2 border-white/30 overflow-hidden flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={`${startup.startupName} logo`}
                  className={`h-16 w-16 ${logoUrl === DefaultLogo ? 'object-contain p-3' : 'object-cover'}`}
                  onError={(e) => {
                    e.target.src = DefaultLogo;
                    e.target.className = 'h-16 w-16 object-contain p-3';
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="pt-12 px-6 pb-6">
          {/* Startup name and tagline */}
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate pr-2">
                {startup.startupName}
              </h3>
              {startup.matchScore > 85 && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs px-2 py-1 rounded-full">
                  <FiStar className="h-3 w-3" />
                  Top Match
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {startup.tagline}
            </p>
          </div>

          {/* Short description */}
          <p className="text-gray-500 text-sm mb-5 line-clamp-3 leading-relaxed">
            {startup.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            {startup.teamSize && (
              <div className="flex items-center gap-1">
                <FiUsers className="h-4 w-4" />
                <span>{startup.teamSize} team</span>
              </div>
            )}
            {startup.fundingStage && (
              <div className="flex items-center gap-1">
                <MdRocketLaunch className="h-4 w-4" />
                <span>{startup.fundingStage}</span>
              </div>
            )}
            {startup.location && (
              <div className="flex items-center gap-1">
                <FiMapPin className="h-4 w-4" />
                <span>{startup.location}</span>
              </div>
            )}
          </div>

          {/* Industry and tags */}
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              <span className={`bg-gradient-to-r ${getIndustryColor(startup.industry)} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
                {startup.industry}
              </span>
              {startup.fundingStage && startup.fundingStage !== startup.industry && (
                <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {startup.fundingStage}
                </span>
              )}
            </div>
          </div>

          {/* Availability indicator */}
          {startup.availability?.days?.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>Available for meetings</span>
              </div>
            </div>
          )}

          {/* Footer with CTA */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                View details
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${isFavorite ? 'text-red-500' : 'text-indigo-500'}`}>
                {isFavorite ? 'Saved' : 'Explore'}
                <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Hover effect border */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-indigo-200/50 transition-all duration-500 ${isHovered ? 'border-indigo-300/50' : ''}`}></div>
      </div>
    </Link>
  );
};

export default StartupCard;