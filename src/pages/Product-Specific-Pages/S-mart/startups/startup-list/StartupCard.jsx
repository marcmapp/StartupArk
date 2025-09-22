import React from 'react';
import { Link } from 'react-router-dom';
import DefaultLogo from '../../../../../assets/MP-white-bg.png';
import { FiClock, FiCheckCircle, FiHeart, FiArrowRight } from 'react-icons/fi';
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
      className="block h-full group"
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full hover:border-indigo-100 relative">
        {/* Favorite button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100 transition-colors group/favorite"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <FiHeart 
            className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/favorite:text-red-300'}`} 
            strokeWidth={isFavorite ? 2 : 1.5}
          />
        </button>

        {/* Current user badge */}
        {isCurrentUser && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-indigo-100/90 backdrop-blur-sm text-indigo-800 text-xs font-medium flex items-center shadow-sm">
            <FiCheckCircle className="mr-1.5" size={12} />
            Your Startup
          </div>
        )}

        {/* Logo and basic info */}
        <div className="p-5 pb-4 flex items-start gap-4">
          <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center group-hover:border-indigo-200 transition-colors">
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
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
              {startup.startupName}
            </h3>
            <p className="text-indigo-600 font-medium text-sm truncate">
              {startup.tagline}
            </p>
          </div>
        </div>

        {/* Description and tags */}
        <div className="px-5 pb-4 flex-grow">
          <p className="text-gray-600 mb-3 line-clamp-3 text-sm leading-relaxed">
            {startup.description}
          </p>

          {/* Availability badge */}
          {startup.availability?.days?.length > 0 && (
            <div className="flex items-center mb-3 text-sm text-gray-500 bg-gray-50/50 px-3 py-1.5 rounded-lg">
              <FiClock className="mr-2" size={14} />
              <span>
                {formatAvailability(startup.availability)}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-100">
              {startup.industry}
            </span>
            {startup.fundingStage && (
              <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full border border-green-100">
                {startup.fundingStage}
              </span>
            )}
            {startup.location && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-100">
                {startup.location}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 group-hover:bg-indigo-50/30 transition-colors">
          <div className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center group/link">
            View details
            <FiArrowRight className="ml-2 transition-transform group-hover/link:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StartupCard;
