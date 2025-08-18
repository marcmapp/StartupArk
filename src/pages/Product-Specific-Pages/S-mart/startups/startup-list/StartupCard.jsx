import React from 'react';
import { Link } from 'react-router-dom';
import DefaultLogo from '../../../../../assets/MP-white-bg.png';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { FiClock, FiCheckCircle } from 'react-icons/fi';
import { getImageUrl } from '../../../../../utils/imageUrls';

const StartupCard = ({ startup, isFavorite, onToggleFavorite, isCurrentUser }) => {
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

  // Format availability display
  const formatAvailability = (availability) => {
    if (!availability || !availability.days || availability.days.length === 0) {
      return null;
    }

    const formatTime = (time) => {
      const [hours, mins] = time.split(':');
      const hour = parseInt(hours);
      return hour >= 12
        ? `${hour === 12 ? 12 : hour - 12}:${mins} PM`
        : `${hour}:${mins} AM`;
    };

    let timeRangeStr = '';
    if (availability.timeRange) {
      if (typeof availability.timeRange === 'string') {
        timeRangeStr = availability.timeRange;
      } else if (availability.timeRange.start && availability.timeRange.end) {
        timeRangeStr = `${formatTime(availability.timeRange.start)} - ${formatTime(availability.timeRange.end)}`;
      }
    }

    return `${availability.days.length} days • ${timeRangeStr}`;
  };

  return (
    <Link 
      to={`/smart/startups/${startup._id}`} 
      className="block h-full"
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group relative">
        {/* Favorite button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <HeartSolid className="h-5 w-5 text-red-500 fill-current" />
          ) : (
            <div className="relative">
              <HeartOutline className="h-5 w-5 text-gray-400 stroke-current" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 rounded-full transition-opacity" />
            </div>
          )}
        </button>

        {/* Current user badge */}
        {isCurrentUser && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium flex items-center">
            <FiCheckCircle className="mr-1" size={14} />
            Your Startup
          </div>
        )}

        {/* Logo and basic info */}
        <div className="p-5 flex items-start gap-4">
          <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
            <img
              src={logoUrl}
              alt={`${startup.startupName} logo`}
              className={`h-full w-full ${logoUrl === DefaultLogo ? 'object-contain p-2' : 'object-cover'}`}
              onError={(e) => {
                e.target.src = DefaultLogo;
                e.target.className = 'h-full w-full object-contain p-2';
              }}
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
              {startup.startupName}
            </h3>
            <p className="text-indigo-600 font-medium truncate">
              {startup.tagline}
            </p>
          </div>
        </div>

        {/* Description and tags */}
        <div className="px-5 pb-3 flex-grow">
          <p className="text-gray-600 mb-3 line-clamp-3 text-sm">
            {startup.description}
          </p>

          {/* Availability badge */}
          {startup.availability?.days?.length > 0 && (
            <div className="flex items-center mb-3 text-sm">
              <FiClock className="text-gray-400 mr-1.5" size={14} />
              <span className="text-gray-600">
                {formatAvailability(startup.availability)}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
              {startup.industry}
            </span>
            {startup.fundingStage && (
              <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">
                {startup.fundingStage}
              </span>
            )}
            {startup.location && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                {startup.location}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <div className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center group">
            View Details
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StartupCard;