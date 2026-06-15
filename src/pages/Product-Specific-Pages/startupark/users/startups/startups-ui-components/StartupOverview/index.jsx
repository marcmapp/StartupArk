import React from 'react';
import { FiExternalLink, FiLinkedin, FiTwitter, FiFacebook } from 'react-icons/fi';

const StartupOverview = ({ startupData }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 sm:mb-4">About Us</h2>
            <div className="prose max-w-none text-zinc-600 dark:text-zinc-300 text-sm sm:text-base">
              <p className="mb-3 sm:mb-4">{startupData.description}</p>
              <p className="mb-3 sm:mb-4">{startupData.bio}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 sm:mb-4">Our Solution</h2>
            <div className="prose max-w-none text-zinc-600 dark:text-zinc-300 text-sm sm:text-base">
              <h3 className="font-medium text-zinc-900 dark:text-white">Problem Statement</h3>
              <p className="mb-3 sm:mb-4">{startupData.problemStatement || 'Not specified'}</p>

              <h3 className="font-medium text-zinc-900 dark:text-white">Unique Proposition</h3>
              <p className="mb-3 sm:mb-4">{startupData.uniqueProposition || 'Not specified'}</p>

              <h3 className="font-medium text-zinc-900 dark:text-white">Technology Stack</h3>
              {startupData.technologyStack && startupData.technologyStack.length > 0 ? (
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                  {startupData.technologyStack.map((tech, index) => (
                    <span key={index} className="glass-inset text-zinc-700 dark:text-zinc-200 text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Not specified</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 sm:mb-4">Mission & Vision</h2>
            <div className="prose max-w-none text-zinc-600 dark:text-zinc-300 text-sm sm:text-base">
              <h3 className="font-medium text-zinc-900 dark:text-white">Mission</h3>
              <p className="mb-3 sm:mb-4">{startupData.mission || 'Not specified'}</p>

              <h3 className="font-medium text-zinc-900 dark:text-white">Vision</h3>
              <p>{startupData.vision || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-inset p-3 sm:p-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 sm:mb-4">Key Details</h2>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Industry</h3>
                <p className="text-zinc-900 dark:text-white text-sm sm:text-base">{startupData.industry || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Business Model</h3>
                <p className="text-zinc-900 dark:text-white text-sm sm:text-base">{startupData.businessModel || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Founded</h3>
                <p className="text-zinc-900 dark:text-white text-sm sm:text-base">{startupData.foundedYear || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Team Size</h3>
                <p className="text-zinc-900 dark:text-white text-sm sm:text-base">{startupData.teamSize || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Funding Stage</h3>
                <p className="text-zinc-900 dark:text-white text-sm sm:text-base">{startupData.fundingStage || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</h3>
                <p className="text-zinc-900 dark:text-white text-sm sm:text-base">
                  {(typeof startupData.location === 'object'
                    ? [startupData.location?.city, startupData.location?.state].filter(Boolean).join(', ')
                    : startupData.location) || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-inset p-3 sm:p-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 sm:mb-4">Contact</h2>
            <div className="space-y-2 sm:space-y-3">
              {startupData.website && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Website</h3>
                  <a
                    href={startupData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 dark:text-white hover:underline flex items-center text-sm sm:text-base font-medium"
                  >
                    {startupData.website.replace(/^https?:\/\//, '')}
                    <FiExternalLink className="ml-1" />
                  </a>
                </div>
              )}
              {startupData.phone && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Phone</h3>
                  <p className="text-zinc-900 dark:text-white text-sm sm:text-base">{startupData.phone}</p>
                </div>
              )}
              {startupData.email && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</h3>
                  <p className="text-zinc-900 dark:text-white text-sm sm:text-base">{startupData.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-inset p-3 sm:p-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 sm:mb-4">Social Media</h2>
            <div className="flex space-x-3 sm:space-x-4">
              {startupData.linkedin && (
                <a
                  href={startupData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <FiLinkedin className="h-5 w-5" />
                </a>
              )}
              {startupData.twitter && (
                <a
                  href={startupData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <FiTwitter className="h-5 w-5" />
                </a>
              )}
              {startupData.facebook && (
                <a
                  href={startupData.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FiFacebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupOverview;