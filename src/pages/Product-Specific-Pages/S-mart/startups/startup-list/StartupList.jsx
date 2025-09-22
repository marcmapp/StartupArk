import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StartupCard from './StartupCard';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import LoadingSkeleton from '../../../../../components/Loader';

const StartupList = ({ showOnlyFavorites = false }) => {
  const [startups, setStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [currentUserStartupId, setCurrentUserStartupId] = useState(null);
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
          axios.get(`${baseUrl}/api/smart/startups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/smart/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Get the user's startup ID from their profile
          axios.get(`${baseUrl}/api/smart/dashboard`, {
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
        setFilteredStartups(startupsWithAvailability);
        
        const userStartup = userStartupRes.data.find(
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
  }, [baseUrl, navigate]);

  const handleToggleFavorite = async (startupId, isFavorite) => {
    try {
      const token = localStorage.getItem("token");
      const method = isFavorite ? 'post' : 'delete';
      const url = `${baseUrl}/api/smart/favorites/${startupId}`;
      
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
  }, [searchTerm, selectedIndustry, startups, favorites, showOnlyFavorites]);

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
    <div className="px-4 py-8 w-full overflow-hidden"> {/* Added overflow-hidden */}
      <div className="max-w-7xl mx-auto w-full"> {/* Ensure full width with constraint */}
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
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full"> {/* Added w-full */}
                {filteredStartups.map(startup => (
                  <StartupCard 
                    key={startup._id} 
                    startup={startup} 
                    isFavorite={favorites.includes(startup._id)}
                    onToggleFavorite={handleToggleFavorite}
                    isCurrentUser={currentUserStartupId === startup._id}
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