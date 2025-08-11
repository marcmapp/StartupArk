import { getImageUrl } from '../../../../../../utils/imageUrls';
const StartupDetailHeader = ({ startup }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const logoUrl = getImageUrl(startup.logo, baseUrl);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-start gap-4">
            {logoUrl && (
              <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-white border border-gray-200 overflow-hidden">
                <img
  src={logoUrl}
  alt={`${startup.startupName} logo`}
  className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-sm"
  onError={(e) => {
    e.target.src = '/default-startup-logo.png';
  }}
/>
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{startup.startupName}</h1>
              <p className="text-lg sm:text-xl text-indigo-600 mt-1">{startup.tagline}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Visit Website
                <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            
            {startup.pitchDeck && (
              <a
                href={startup.pitchDeck}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Pitch Deck
                <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </a>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">
            {startup.industry}
          </span>
          {startup.fundingStage && (
            <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
              {startup.fundingStage}
            </span>
          )}
          {startup.location && (
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
              {startup.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartupDetailHeader;