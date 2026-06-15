import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// At the top of StartupDetail.js
import { getImageUrl } from '../../../../../../../utils/imageUrls';

// Shared Components
import StartupProfileHeader from '../../startups-ui-components/StartupProfileHeader/index';
import StartupTabs from '../../startups-ui-components/StartupTabs/index';
import StartupOverview from '../../startups-ui-components/StartupOverview/index';
import StartupTeam from '../../startups-ui-components/StartupTeam/index';
import StartupGallery from '../../startups-ui-components/StartupGallery/index';
import StartupProducts from '../../startups-ui-components/products/index';
import StartupVirtualCard from '../../startups-ui-components/StartupVirtualCard/index';

// Shared Hooks
import { useStartupData } from '../../shared/hooks/useStartupData';
import { useStartupProducts } from '../../shared/hooks/useStartupProducts';

const StartupDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { startupData, loading, error } = useStartupData(id);
  const { products, loading: productsLoading } = useStartupProducts(id);
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Function to get properly formatted image URL
  const getFormattedImageUrl = (imageKey) => {
    return getImageUrl(imageKey, baseUrl);
  };

  // Format startup data with proper image URLs
  const formatStartupData = (data) => {
    if (!data) return null;
    
    return {
      ...data,
      // Format logo URL
      logo: getFormattedImageUrl(data.logo),
      // Format gallery images
      gallery: data.gallery?.map(item => ({
        ...item,
        url: getFormattedImageUrl(item.url)
      })) || [],
      // Format pitch deck URL if it's a key
      pitchDeck: data.pitchDeck?.startsWith('http') 
        ? data.pitchDeck 
        : getFormattedImageUrl(data.pitchDeck),
      // Format team member avatars
      team: data.team?.map(member => ({
        ...member,
        profilePhoto: getFormattedImageUrl(member.profilePhoto)
      })) || []
    };
  };

  const formattedStartupData = formatStartupData(startupData);
  const startupDataWithProducts = formattedStartupData ? {
    ...formattedStartupData,
    products: products || []
  } : null;

  if (loading) return <LoadingStartupDetail />;
  if (error) return <ErrorState error={error} />;
  if (!startupDataWithProducts) return <EmptyState />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <StartupProfileHeader
        startupData={startupDataWithProducts}
        isPublicView={true}
      />

      {/* Main Content */}
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column - Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="glass-card overflow-hidden">
            <StartupTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              startupData={startupDataWithProducts} // Use data with products
              isPublicView={true}
            />

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'overview' && (
                <StartupOverview startupData={startupDataWithProducts} />
              )}

              {activeTab === 'team' && (
                <StartupTeam team={startupDataWithProducts.team} />
              )}

              {activeTab === 'gallery' && (
                <StartupGallery gallery={startupDataWithProducts.gallery} />
              )}

              {activeTab === 'pitch' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Pitch Deck</h2>
                  {startupDataWithProducts.pitchDeck ? (
                    <div className="glass-inset p-6 flex flex-col items-center">
                      {startupDataWithProducts.pitchDeck.endsWith('.pdf') ? (
                        <div className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-inner">
                          <svg className="h-16 w-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                            <path d="M14 2v6h6" />
                            <path d="M14 12h4" />
                            <path d="M14 16h4" />
                            <path d="M14 20h4" />
                          </svg>
                        </div>
                      ) : (
                        <div className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-inner">
                          <svg className="h-16 w-16 text-zinc-400 dark:text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                            <path d="M14 2v6h6" />
                            <path d="M8 12h8" />
                            <path d="M8 16h8" />
                            <path d="M8 20h5" />
                          </svg>
                        </div>
                      )}

                      <p className="text-zinc-600 dark:text-zinc-300 mb-4 text-center">
                        {startupDataWithProducts.pitchDeck.split('/').pop()}
                      </p>

                      <div className="flex gap-4 flex-wrap justify-center">
                        <a
                          href={startupDataWithProducts.pitchDeck}
                          download
                          className="btn-mono"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>

                        {startupDataWithProducts.pitchDeck.endsWith('.pdf') && (
                          <a
                            href={startupDataWithProducts.pitchDeck}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost"
                          >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Preview
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 glass-inset">
                      <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">No pitch deck available</h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        This startup hasn't uploaded a pitch deck yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <StartupProducts 
                  startupId={startupDataWithProducts._id}
                  isEditable={false}
                  baseUrl={baseUrl}
                />
              )}

              {activeTab === 'vc' && startupDataWithProducts.virtualCard && (
                <StartupVirtualCard 
                  startupData={startupDataWithProducts}
                  baseUrl={baseUrl}
                  isPublicView={true}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Quick Facts */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Facts</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Industry</p>
                <p className="text-zinc-900 dark:text-white font-medium">{startupDataWithProducts.industry || 'Not specified'}</p>
              </div>

              {startupDataWithProducts.foundedYear && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Founded</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{startupDataWithProducts.foundedYear}</p>
                </div>
              )}

              {startupDataWithProducts.teamSize && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Team Size</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{startupDataWithProducts.teamSize}</p>
                </div>
              )}

              {startupDataWithProducts.fundingStage && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Funding Stage</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{startupDataWithProducts.fundingStage}</p>
                </div>
              )}

              {startupDataWithProducts.businessModel && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Business Model</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{startupDataWithProducts.businessModel}</p>
                </div>
              )}

              {startupDataWithProducts.location && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Location</p>
                  <p className="text-zinc-900 dark:text-white font-medium">
                    {(typeof startupDataWithProducts.location === 'object'
                      ? [startupDataWithProducts.location?.city, startupDataWithProducts.location?.state].filter(Boolean).join(', ')
                      : startupDataWithProducts.location) || 'Not specified'}
                  </p>
                </div>
              )}

              {/* Products Count */}
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Products</p>
                <p className="text-zinc-900 dark:text-white font-medium">{products?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <ContactCard
            email={startupDataWithProducts.email}
            phone={startupDataWithProducts.phone}
            website={startupDataWithProducts.website}
            contactName={startupDataWithProducts.contactName || startupDataWithProducts.startupName}
          />

          {/* Social Media */}
          {(startupDataWithProducts.linkedin || startupDataWithProducts.twitter || startupDataWithProducts.facebook) && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                {startupDataWithProducts.linkedin && (
                  <a
                    href={startupDataWithProducts.linkedin.includes('http') ? startupDataWithProducts.linkedin : `https://${startupDataWithProducts.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {startupDataWithProducts.twitter && (
                  <a
                    href={startupDataWithProducts.twitter.includes('http') ? startupDataWithProducts.twitter : `https://twitter.com/${startupDataWithProducts.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
                {startupDataWithProducts.facebook && (
                  <a
                    href={startupDataWithProducts.facebook.includes('http') ? startupDataWithProducts.facebook : `https://facebook.com/${startupDataWithProducts.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Contact Card Component
const ContactCard = ({ email, phone, website, contactName }) => (
  <div className="glass-card p-6">
    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Contact</h3>
    <div className="space-y-3">
      {email && (
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Email</p>
          <a
            href={`mailto:${email}`}
            className="text-zinc-900 dark:text-white hover:underline text-sm"
          >
            {email}
          </a>
        </div>
      )}
      {phone && (
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Phone</p>
          <a
            href={`tel:${phone}`}
            className="text-zinc-900 dark:text-white text-sm"
          >
            {phone}
          </a>
        </div>
      )}
      {website && (
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Website</p>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 dark:text-white hover:underline text-sm flex items-center"
          >
            {website.replace(/^https?:\/\//, '')}
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  </div>
);

// Loading State Component
const LoadingStartupDetail = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-6">
      <div className="h-6 w-24 glass-inset rounded animate-pulse"></div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-96 glass-inset rounded-lg animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-8 w-1/3 glass-inset rounded animate-pulse"></div>
          <div className="h-4 glass-inset rounded animate-pulse"></div>
          <div className="h-4 glass-inset rounded animate-pulse"></div>
          <div className="h-4 w-2/3 glass-inset rounded animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-64 glass-inset rounded-lg animate-pulse"></div>
        <div className="h-48 glass-inset rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-3xl mx-auto">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error loading startup details</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-zinc-900 dark:text-white">Startup not found</h3>
    <p className="mt-1 text-zinc-500 dark:text-zinc-400">The startup you're looking for doesn't exist or may have been removed.</p>
    <div className="mt-6">
      <Link
        to="/startupark/startups"
        className="btn-mono px-4 py-2"
      >
        Browse Startups
      </Link>
    </div>
  </div>
);

export default StartupDetail;