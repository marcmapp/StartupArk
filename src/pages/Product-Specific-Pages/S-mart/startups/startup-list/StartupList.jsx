import React, { useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import axios from 'axios';
import StartupCard from './StartupCard';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import LoadingSkeleton from '../../../../../components/Loader';
import { getImageUrl } from '../../../../../utils/imageUrls';
import DefaultLogo from '../../../../../assets/MP-white-bg.png';

const StartupList = ({ showOnlyFavorites = false }) => { // Removed startup prop
  const [startups, setStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [currentUserStartupId, setCurrentUserStartupId] = useState(null);
  const [currentUserStartup, setCurrentUserStartup] = useState(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const getAuthToken = () => {
    return localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          navigate("/");
          return;
        }

        // Fetch all data in parallel
        const [startupsRes, favoritesRes, userStartupRes] = await Promise.all([
          axios.get(`${baseUrl}/smart/api/smart/startups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/smart/api/smart/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Get the user's startup ID from their profile
          axios.get(`${baseUrl}/smart/api/smart/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        // Make sure availability data is included in the startups
        const startupsWithAvailability = startupsRes.data.map(startup => ({
          ...startup,
          availability: startup.availability || null
        }));
        
        setStartups(startupsWithAvailability);
        setFavorites(favoritesRes.data.map(fav => fav._id));
        
        const userStartup = userStartupRes.data.find(
          item => item.role === 'startup'
        );
        if (userStartup) {
          setCurrentUserStartupId(userStartup._id);
          // Find the current user's startup data
          const userStartupData = startupsWithAvailability.find(
            startup => startup._id === userStartup._id
          );
          setCurrentUserStartup(userStartupData);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseUrl, navigate]);

  const handleToggleFavorite = async (startupId, isFavorite) => {
    try {
      const token = localStorage.getItem("token");
      const method = isFavorite ? 'post' : 'delete';
      const url = `${baseUrl}/smart/api/smart/favorites/${startupId}`;
      
      await axios[method](url, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFavorites(prev => 
        isFavorite 
          ? [...prev, startupId] 
          : prev.filter(id => id !== startupId)
      );
    } catch (err) {
      console.error('Error updating favorite:', err);
      throw err;
    }
  };

  useEffect(() => {
    let results = startups;

    // Filter out current user's startup from main list
    if (currentUserStartupId) {
      results = results.filter(startup => startup._id !== currentUserStartupId);
    }

    if (showOnlyFavorites) {
      results = results.filter(startup => favorites.includes(startup._id));
    }

    if (searchTerm) {
      results = results.filter(startup =>
        startup.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry !== 'All') {
      results = results.filter(startup =>
        startup.industry === selectedIndustry);
    }

    setFilteredStartups(results);
  }, [searchTerm, selectedIndustry, startups, favorites, showOnlyFavorites, currentUserStartupId]);

  const industries = ['All', ...new Set(startups.map(startup => startup.industry))];

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-3xl mx-auto">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-8 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Current User Startup Header */}
        {currentUserStartup && !showOnlyFavorites && (
          <div className="mb-8">
            <div className=" rounded-2xl p-6 border-2 border-cyan-600 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden flex items-center justify-center">
                    <img
                      src={getImageUrl(currentUserStartup.logo, baseUrl)}
                      alt={`${currentUserStartup.startupName} logo`}
                      className={`h-16 w-16 ${currentUserStartup.logo ? 'object-cover' : 'object-contain p-2'}`}
                      onError={(e) => {
                        e.target.src = DefaultLogo;
                        e.target.className = 'h-16 w-16 object-contain p-2';
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-highlight">My Company</h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentUserStartup.startupName}
                  </h3>
                  <p className="mb-3">
                    {currentUserStartup.tagline}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentUserStartup.industry}
                    </span>
                    {currentUserStartup.fundingStage && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {currentUserStartup.fundingStage}
                      </span>
                    )}
                    {currentUserStartup.location && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {currentUserStartup.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Link 
                    to={`/smart/startups/${currentUserStartup._id}`}
                    className="inline-flex items-center gap-2 border-2 border-cyan-500 text-highlight px-6 py-3 rounded-lg font-semibold  transition-colors shadow-lg hover:shadow-xl"
                  >
                    Public View
                    <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Separator */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-4 text-gray-500">
                <div className="h-px w-20 bg-gray-300"></div>
                <span className="text-sm font-medium">Discover Other Startups</span>
                <div className="h-px w-20 bg-gray-300"></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {showOnlyFavorites ? 'Your Favorite Startups' : 'Discover Startups'}
            </h1>
            <p className="text-gray-500 mt-2">
              {showOnlyFavorites 
                ? 'Your saved startups for quick access' 
                : 'Find innovative companies to connect with'}
            </p>
          </div>

          {!showOnlyFavorites && (
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 text-black">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                placeholder="Search startups..."
              />
              <FilterDropdown
                options={industries}
                selected={selectedIndustry}
                setSelected={setSelectedIndustry}
                label="Filter by Industry"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {filteredStartups.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {showOnlyFavorites 
                    ? 'No favorites yet' 
                    : 'No startups found'}
                </h3>
                <p className="mt-1 text-gray-500">
                  {showOnlyFavorites
                    ? 'Click the heart icon on startups to save them here'
                    : 'Try adjusting your search or filter criteria'}
                </p>
                {showOnlyFavorites && (
                  <Link 
                    to="/smart/startups" 
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Browse Startups
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                {filteredStartups.map(startup => (
                  <StartupCard 
                    key={startup._id} 
                    startup={startup} 
                    isFavorite={favorites.includes(startup._id)}
                    onToggleFavorite={handleToggleFavorite}
                    isCurrentUser={false} // Always false since we filtered out current user's startup
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StartupList;