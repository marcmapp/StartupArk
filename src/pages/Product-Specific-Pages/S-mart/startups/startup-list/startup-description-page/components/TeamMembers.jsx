import React from 'react';
import PropTypes from 'prop-types';

const TeamMembers = ({ team }) => {
  if (!team || team.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-gray-600">No team members added yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Our Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {team.map((member, index) => {
          // Handle Mongoose _doc property if present
          const memberData = member._doc || member;
          const { name, position, avatar, bio } = memberData;
          
          return (
            <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 border border-gray-100 rounded-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt={`${name}'s avatar`}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-medium text-gray-500">
                    {name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-sm sm:text-base">{name || 'Team Member'}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{position || 'Team Position'}</p>
                {bio && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{bio}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

TeamMembers.propTypes = {
  team: PropTypes.arrayOf(
    PropTypes.shape({
      _doc: PropTypes.shape({
        name: PropTypes.string,
        position: PropTypes.string,
        avatar: PropTypes.string,
        bio: PropTypes.string,
      }),
      name: PropTypes.string,
      position: PropTypes.string,
      avatar: PropTypes.string,
      bio: PropTypes.string,
    })
  ),
};

export default TeamMembers;