import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';

// Shared Components
import StartupProfileHeader from '../startups-ui-components/StartupProfileHeader/index';
import StartupTabs from '../startups-ui-components/StartupTabs/index';
import StartupOverview from '../startups-ui-components/StartupOverview/index';
import StartupTeam from '../startups-ui-components/StartupTeam/index';
import StartupGallery from '../startups-ui-components/StartupGallery/index';
import StartupProducts from '../startups-ui-components/products/index';
import StartupVirtualCard from '../startups-ui-components/StartupVirtualCard/index';
import AvailabilityManager from '../startups-ui-components/AvailabilityManager/index';

// Shared Hooks
import { useStartupData } from '../shared/hooks/useStartupData';

// UI Components
import Loader from '../../../../../../components/Loader';

const StartupProfile = ({ startupId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  
  const { startupData, loading, error, refetch } = useStartupData();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

 
  const handleEdit = () => {
    navigate('/startupark/startup-edit-profile');
  };

  // Error State Component
  const ErrorState = ({ error }) => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="text-center py-4 sm:py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="text-center py-4 sm:py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Startup Data Found</h3>
        <p className="text-gray-600">You haven't submitted your startup information yet.</p>
        <button
          onClick={() => navigate('/startup/onboarding')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
        >
          Complete Startup Profile
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!startupData) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      {/* Header */}
      <StartupProfileHeader
        startupData={startupData}
        onEdit={handleEdit}
        onEditAvailability={() => setIsEditingAvailability(true)}
      />

      {/* Tabs Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-4 sm:mb-8">
        <StartupTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          startupData={startupData}
        />

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <StartupOverview startupData={startupData} />
          )}

          {activeTab === 'team' && (
            <StartupTeam team={startupData.team} />
          )}

          {activeTab === 'gallery' && (
            <StartupGallery gallery={startupData.gallery} />
          )}

          {activeTab === 'pitch' && (
            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Pitch Deck</h2>
              {startupData.pitchDeck ? (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 flex flex-col items-center">
                  {startupData.pitchDeck.endsWith('.pdf') ? (
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white rounded-lg shadow-inner">
                      <svg className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                        <path d="M14 2v6h6" />
                        <path d="M14 12h4" />
                        <path d="M14 16h4" />
                        <path d="M14 20h4" />
                      </svg>
                    </div>
                  ) : (
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white rounded-lg shadow-inner">
                      <svg className="h-12 w-12 sm:h-16 sm:w-16 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                        <path d="M14 2v6h6" />
                        <path d="M8 12h8" />
                        <path d="M8 16h8" />
                        <path d="M8 20h5" />
                      </svg>
                    </div>
                  )}

                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base text-center">
                    {startupData.pitchDeck.split('/').pop()}
                  </p>

                  <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
                    <a
                      href={startupData.pitchDeck}
                      download
                      className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm sm:text-base"
                    >
                      <FiExternalLink className="mr-1 sm:mr-2" />
                      Download
                    </a>

                    {startupData.pitchDeck.endsWith('.pdf') && (
                      <a
                        href={startupData.pitchDeck}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm sm:text-base"
                      >
                        <FiExternalLink className="mr-1 sm:mr-2" />
                        Preview
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-600 mb-4">No pitch deck uploaded yet.</p>
                  <button
                    onClick={() => navigate('/startup/edit')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
                  >
                    Upload Pitch Deck
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <StartupProducts 
              startupId={startupData._id}
              isEditable={true}
              baseUrl={baseUrl}
            />
          )}

          {activeTab === 'vc' && (
            <StartupVirtualCard 
              startupData={startupData}
              baseUrl={baseUrl}
              isPublicView={false}
            />
          )}
        </div>
      </div>

      {/* Availability Manager Modal */}
      <AvailabilityManager
        isOpen={isEditingAvailability}
        onClose={() => setIsEditingAvailability(false)}
        startupData={startupData}
        onUpdate={refetch}
      />
    </div>
  );
};

export default StartupProfile;