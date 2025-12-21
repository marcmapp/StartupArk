import React, { useEffect, useState } from 'react';
import { FiArrowRight, FiStar, FiTrendingUp, FiMapPin, FiGlobe, FiAward } from 'react-icons/fi';
import { MdRocketLaunch, MdGroups, MdLightbulb } from 'react-icons/md';
import axios from 'axios';
import StartupCard from './StartupCard';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import LoadingSkeleton from '../../../../../../components/Loader';
import { getImageUrl } from '../../../../../../utils/imageUrls';
import DefaultLogo from '../../../../../../assets/MP-white-bg.png';

const StartupList = ({ showOnlyFavorites = false }) => {
  const [startups, setStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [currentUserStartupId, setCurrentUserStartupId] = useState(null);
  const [currentUserStartup, setCurrentUserStartup] = useState(null);
  const [hoveredStartup, setHoveredStartup] = useState(null);
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

        const [startupsRes, favoritesRes, userStartupRes] = await Promise.all([
          axios.get(`${baseUrl}/startupark/api/startupark/startups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/startupark/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/startupark/api/startupark/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        const startupsWithAvailability = startupsRes.data.map(startup => ({
          ...startup,
          availability: startup.availability || null,
          matchScore: Math.floor(Math.random() * 30) + 70, // Simulated match score for demo
          trending: Math.random() > 0.7
        }));
        
        setStartups(startupsWithAvailability);
        setFavorites(favoritesRes.data.map(fav => fav._id));
        
        const userStartup = userStartupRes.data.find(
          item => item.role === 'startup'
        );
        if (userStartup) {
          setCurrentUserStartupId(userStartup._id);
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
      const url = `${baseUrl}/startupark/api/favorites/${startupId}`;
      
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-red-200 p-8 max-w-md w-full shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-8xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <MdRocketLaunch className="h-4 w-4" />
          Discover Tomorrow's Unicorns Today
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent mb-4">
          {showOnlyFavorites ? 'Your Startup Collection' : 'Innovation Ecosystem'}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {showOnlyFavorites 
            ? 'Your curated list of groundbreaking startups to watch' 
            : 'Connect with visionary founders and cutting-edge technologies'}
        </p>
      </div>

      {/* Current User Startup - Premium Card */}
      {currentUserStartup && !showOnlyFavorites && (
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-10"></div>
          <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative h-28 w-28 rounded-2xl bg-gradient-to-br from-white to-gray-100 p-4 shadow-2xl border border-gray-200/50">
                  <img
                    src={getImageUrl(currentUserStartup.logo, baseUrl)}
                    alt={`${currentUserStartup.startupName} logo`}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.src = DefaultLogo;
                      e.target.className = 'h-full w-full object-contain p-2';
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                  <MdLightbulb className="h-4 w-4" />
                  Your Venture
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentUserStartup.startupName}
                </h2>
                <p className="text-lg text-gray-600 mb-4 max-w-2xl">
                  {currentUserStartup.tagline}
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <span className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium shadow-sm">
                    {currentUserStartup.industry}
                  </span>
                  {currentUserStartup.fundingStage && (
                    <span className="bg-gradient-to-r from-green-50 to-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium shadow-sm">
                      {currentUserStartup.fundingStage}
                    </span>
                  )}
                  {currentUserStartup.location && (
                    <span className="bg-gradient-to-r from-blue-50 to-cyan-100 text-cyan-700 px-4 py-2 rounded-lg font-medium shadow-sm">
                      <FiMapPin className="inline mr-1 h-4 w-4" />
                      {currentUserStartup.location}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Link 
                  to={`/startupark/startups/${currentUserStartup._id}`}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
                >
                  <span className="relative z-10">Explore Public Profile</span>
                  <FiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-4">
              <div className="h-px w-32 bg-gradient-to-r from-transparent to-gray-300"></div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <MdGroups className="h-5 w-5" />
                <span>Discover Your Next Opportunity</span>
              </div>
              <div className="h-px w-32 bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="sticky top-4 z-10 mb-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {showOnlyFavorites ? 'Favorites' : 'Featured Startups'}
              </h2>
              <p className="text-gray-600 mt-2">
                {filteredStartups.length} {filteredStartups.length === 1 ? 'startup' : 'startups'} found
              </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              {!showOnlyFavorites && (
                <>
                  <div className="relative flex-1 sm:flex-initial">
                    <SearchBar
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      placeholder="Search startups, technologies, industries..."
                      className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <FilterDropdown
                    options={industries}
                    selected={selectedIndustry}
                    setSelected={setSelectedIndustry}
                    label="Industry"
                    className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </>
              )}
              <button
                onClick={() => navigate(showOnlyFavorites ? '/startupark/startups' : '/startupark/favorites')}
                className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold transition-colors"
              >
                {showOnlyFavorites ? 'Browse All' : 'View Favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-2xl h-96"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredStartups.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 mb-6">
                <MdLightbulb className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {showOnlyFavorites ? 'No favorites yet' : 'No startups match your criteria'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {showOnlyFavorites
                  ? 'Start exploring innovative startups and save your favorites to track them here'
                  : 'Try adjusting your search terms or filter criteria to find what you\'re looking for'}
              </p>
              {showOnlyFavorites && (
                <Link 
                  to="/startupark/startups" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <MdRocketLaunch className="h-5 w-5" />
                  Explore Startups
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredStartups.map(startup => (
                <div
                  key={startup._id}
                  onMouseEnter={() => setHoveredStartup(startup._id)}
                  onMouseLeave={() => setHoveredStartup(null)}
                  className="transform transition-all duration-500 hover:-translate-y-2"
                >
                  <StartupCard 
                    startup={startup} 
                    isFavorite={favorites.includes(startup._id)}
                    onToggleFavorite={handleToggleFavorite}
                    isCurrentUser={false}
                    isHovered={hoveredStartup === startup._id}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats Footer */}
      {!showOnlyFavorites && filteredStartups.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {startups.length}
              </div>
              <div className="text-gray-600">Active Startups</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {new Set(startups.map(s => s.industry)).size}
              </div>
              <div className="text-gray-600">Industries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {favorites.length}
              </div>
              <div className="text-gray-600">Total Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {startups.filter(s => s.trending).length}
              </div>
              <div className="text-gray-600">Trending Now</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupList;