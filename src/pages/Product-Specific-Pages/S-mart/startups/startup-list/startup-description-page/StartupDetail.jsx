import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from './components/LoadingSkeleton';
import StartupDetailHeader from './StartupDetailHeader';
import ContactCard from './components/ContactCard';
import TeamMembers from './components/TeamMembers';
import Gallery from './components/Gallery';
import QRCode from 'react-qr-code';
const StartupDetail = () => {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
const [currentUserStartupId, setCurrentUserStartupId] = useState(null);

console.log("Current user startup ID:", currentUserStartupId);
console.log("Viewed startup ID:", startup?._id);
console.log("Is current user:", currentUserStartupId === startup?._id);
  // Update the fetch function to properly include products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch both startup details and user profile in parallel
        const [startupRes, userProfileRes] = await Promise.all([
          axios.get(`${baseUrl}/smart/api/smart/startups-by-id/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/smart/api/smart/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setStartup(startupRes.data);
        
        // Get the user's startup ID from their profile
        const userStartup = userProfileRes.data.find(
          item => item.role === 'startup'
        );
        if (userStartup) {
          setCurrentUserStartupId(userStartup._id);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, baseUrl, navigate]);

  if (loading) return <LoadingStartupDetail />;
  if (error) return <ErrorState error={error} />;
  if (!startup) return <EmptyState />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/smart/user-dashboard"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Startups
        </Link>
      </div>

      {/* Header Section */}
 <StartupDetailHeader 
      startup={startup} 
      isCurrentUser={currentUserStartupId === startup?._id}
    />

      {/* Main Content */}
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column - Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`${activeTab === 'about' ? 'border-indigo-500 text-indigo-600' : 'border-transparent hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('solution')}
                className={`${activeTab === 'solution' ? 'border-indigo-500 text-indigo-600' : 'border-transparent hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Our Solution
              </button>
              {startup.team && startup.team.length > 0 && (
                <button
                  onClick={() => setActiveTab('team')}
                  className={`${activeTab === 'team' ? 'border-indigo-500 text-indigo-600' : 'border-transparent hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Team ({startup.team.length})
                </button>
              )}
              {startup.gallery && startup.gallery.length > 0 && (
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`${activeTab === 'gallery' ? 'border-indigo-500 text-indigo-600' : 'border-transparent hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Gallery ({startup.gallery.length})
                </button>
              )}
              {/* In the tab navigation section */}
              {/* Products tab - always show but check length */}
              <button
                onClick={() => setActiveTab('products')}
                className={`${activeTab === 'products' ? 'border-indigo-500 text-indigo-600' : 'border-transparent hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Products {startup.products?.length > 0 && `(${startup.products.length})`}
              </button>

              {/* Virtual Card tab - only show if exists */}
              {startup.virtualCard && (
                <button
                  onClick={() => setActiveTab('vc')}
                  className={`${activeTab === 'vc' ? 'border-indigo-500 text-indigo-600' : 'border-transparent hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Virtual Card
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'about' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Our Story</h3>
                <p className="whitespace-pre-line">{startup.bio}</p>

                {startup.mission && (
                  <>
                    <h3 className="text-xl font-semibold mt-8 mb-4">Our Mission</h3>
                    <p className="whitespace-pre-line">{startup.mission}</p>
                  </>
                )}

                {startup.vision && (
                  <>
                    <h3 className="text-xl font-semibold mt-8 mb-4">Our Vision</h3>
                    <p className="whitespace-pre-line">{startup.vision}</p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">What We Do</h3>
                <p className="whitespace-pre-line">{startup.description}</p>

                {startup.problemStatement && (
                  <>
                    <h3 className="text-xl font-semibold mt-8 mb-4">The Problem We Solve</h3>
                    <p className="whitespace-pre-line">{startup.problemStatement}</p>
                  </>
                )}

                {startup.uniqueProposition && (
                  <>
                    <h3 className="text-xl font-semibold mt-8 mb-4">Our Unique Proposition</h3>
                    <p className="whitespace-pre-line">{startup.uniqueProposition}</p>
                  </>
                )}

                {startup.technologyStack && startup.technologyStack.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold mt-8 mb-4">Technology Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {startup.technologyStack.map((tech, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'team' && <TeamMembers team={startup.formData?.team || startup.team || []} />}
            {activeTab === 'gallery' && <Gallery images={startup.gallery} />}
            {/* In the tab content section */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Products</h3>

                {startup.products && startup.products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {startup.products.map((product, index) => (
                      <div key={product._id || index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {product.featuredImage && (
                          <div className="h-48 bg-gray-100 overflow-hidden">
                            <img
                              src={product.featuredImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <p className="text-gray-600 mt-1 text-sm">{product.shortDescription || product.description}</p>

                          {product.tags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {product.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {product.website && (
                            <div className="mt-3">
                              <a
                                href={product.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                              >
                                Visit website
                                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products listed</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This startup hasn't added any products yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vc' && startup.virtualCard && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Virtual Business Card</h3>

                <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <h3 className="text-xl font-bold text-gray-900 truncate">{startup.startupName}</h3>
                        <p className="text-gray-600 text-base truncate">{startup.tagline}</p>
                      </div>
                      {startup.logo && (
                        <img
                          src={startup.logo}
                          alt="Logo"
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      )}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="font-medium">{startup.industry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{startup.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Founded</p>
                        <p className="font-medium">{startup.foundedYear || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stage</p>
                        <p className="font-medium">{startup.fundingStage || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{startup.email || 'N/A'}</p>
                      {startup.website && (
                        <a
                          href={startup.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-sm truncate block"
                        >
                          {startup.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>

                    <div className="mt-6 flex justify-center">
                      <QRCode
                        value={`${window.location.origin}/vc/${startup.virtualCard.shareId}`}
                        size={96}
                        level="H"
                      />
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-500">
                      Scan to view digital profile
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/vc/${startup.virtualCard.shareId}`);
                      // Show a temporary "Copied!" message
                    }}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Quick Facts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="text-gray-900 font-medium">{startup.industry}</p>
              </div>

              {startup.foundedYear && (
                <div>
                  <p className="text-sm text-gray-500">Founded</p>
                  <p className="text-gray-900 font-medium">{startup.foundedYear}</p>
                </div>
              )}

              {startup.teamSize && (
                <div>
                  <p className="text-sm text-gray-500">Team Size</p>
                  <p className="text-gray-900 font-medium">{startup.teamSize}</p>
                </div>
              )}

              {startup.fundingStage && (
                <div>
                  <p className="text-sm text-gray-500">Funding Stage</p>
                  <p className="text-gray-900 font-medium">{startup.fundingStage}</p>
                </div>
              )}

              {startup.businessModel && (
                <div>
                  <p className="text-sm text-gray-500">Business Model</p>
                  <p className="text-gray-900 font-medium">{startup.businessModel}</p>
                </div>
              )}

              {startup.location && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900 font-medium">{startup.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <ContactCard
            email={startup.email}
            phone={startup.phone}
            website={startup.website}
            contactName={startup.name}
          />

          {/* Social Media */}
          {(startup.linkedin || startup.twitter || startup.facebook) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                {startup.linkedin && (
                  <a
                    href={startup.linkedin.includes('http') ? startup.linkedin : `https://${startup.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {startup.twitter && (
                  <a
                    href={startup.twitter.includes('http') ? startup.twitter : `https://twitter.com/${startup.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
                {startup.facebook && (
                  <a
                    href={startup.facebook.includes('http') ? startup.facebook : `https://facebook.com/${startup.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600"
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

// Loading State Component
const LoadingStartupDetail = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-6">
      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
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
    <h3 className="mt-2 text-lg font-medium text-gray-900">Startup not found</h3>
    <p className="mt-1 text-gray-500">The startup you're looking for doesn't exist or may have been removed.</p>
    <div className="mt-6">
      <Link
        to="/smart/startups"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Browse Startups
      </Link>
    </div>
  </div>
);

export default StartupDetail;