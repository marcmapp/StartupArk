import React from 'react';

const StartupTeam = ({ team = [] }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Our Team</h2>
      {team && team.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {team.map((member, index) => (
            <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 border border-gray-100 rounded-lg">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={`${member.name}'s avatar`}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-medium text-gray-500">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-sm sm:text-base">{member.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{member.position}</p>
                {member.bio && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{member.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <p className="text-gray-600">No team members added yet.</p>
        </div>
      )}
    </div>
  );
};

export default StartupTeam;