import React from 'react';
import PropTypes from 'prop-types';

const TeamMembers = ({ team }) => {
  if (!team || team.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Our Team</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                {member.avatar ? (
                  <img 
                    className="h-16 w-16 rounded-full object-cover" 
                    src={member.avatar} 
                    alt={`${member.name}'s avatar`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl font-medium text-indigo-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                  <p className="text-indigo-600">{member.position}</p>
                </div>
              </div>
              
              {member.bio && (
                <p className="mt-4 text-gray-600 text-sm line-clamp-3">{member.bio}</p>
              )}
              
              {(member.linkedin || member.twitter) && (
                <div className="mt-4 flex space-x-3">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TeamMembers.propTypes = {
  team: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
      bio: PropTypes.string,
      avatar: PropTypes.string,
      linkedin: PropTypes.string,
      twitter: PropTypes.string,
    })
  ),
};

export default TeamMembers;