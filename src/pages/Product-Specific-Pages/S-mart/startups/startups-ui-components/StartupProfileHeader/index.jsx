import React from 'react';
import { FiEdit2, FiCalendar, FiClock } from 'react-icons/fi';
import { formatAvailability } from '../../shared/utils/startupDataFormatter';

const StartupProfileHeader = ({ 
  startupData, 
  onEdit, 
  onEditAvailability,
  isPublicView = false 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-10">
      <div className="p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* Left Side - Logo & Info */}
          <div className="flex items-start space-x-4 sm:space-x-5">
            {startupData.logo ? (
              <img
                src={startupData.logo}
                alt="Startup logo"
                className="h-18 w-18 sm:h-24 sm:w-24 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                onError={(e) => {
                  e.target.src = '/default-startup-logo.png';
                  e.target.onerror = null;
                }}
              />
            ) : (
              <div className="h-18 w-18 sm:h-24 sm:w-24 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center shadow-sm">
                <span className="text-2xl sm:text-3xl font-bold text-gray-400">
                  {startupData.startupName?.charAt(0) || 'S'}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {startupData.startupName}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {startupData.tagline}
              </p>

              {/* Enhanced Availability Badge */}
              {startupData?.availability?.days?.length > 0 ? (
                <div className="flex items-center mt-2">
                  <div className="flex items-center bg-blue-50 rounded-full px-3 py-1.5">
                    <FiClock className="text-blue-600 mr-2" size={14} />
                    <span className="text-sm font-medium text-gray-700">
                      Available: {formatAvailability(startupData.availability)}
                    </span>
                    {!isPublicView && (
                      <button
                        onClick={onEditAvailability}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label="Edit availability"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                !isPublicView && (
                  <button
                    onClick={onEditAvailability}
                    className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FiCalendar className="mr-1.5" size={14} />
                    Set Availability
                  </button>
                )
              )}
            </div>
          </div>

          {/* Right Side - Buttons */}
          {!isPublicView && (
            <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              {!startupData.availability && (
                <button
                  onClick={onEditAvailability}
                  className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                >
                  <FiCalendar className="mr-2" />
                  Set Availability
                </button>
              )}
              <button
                onClick={onEdit}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                <FiEdit2 className="mr-2" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartupProfileHeader;