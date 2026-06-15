import React, { useEffect, useState } from 'react';
import { FiArrowRight, FiStar, FiTrendingUp, FiMapPin, FiGlobe, FiAward, FiNavigation } from 'react-icons/fi';
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

        const [startupsRes, favoritesRes, ownProfileRes] = await Promise.allSettled([
          axios.get(`${baseUrl}/startupark/api/profile/startups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/startupark/api/favorites?entityType=startup`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/startupark/api/profile/startup`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const rawStartups = startupsRes.status === 'fulfilled'
          ? (startupsRes.value.data?.startups || [])
          : [];

        const startupsWithAvailability = rawStartups.map(startup => ({
          ...startup,
          availability: startup.availability || null,
          matchScore: Math.floor(Math.random() * 30) + 70,
          trending: Math.random() > 0.7
        }));

        setStartups(startupsWithAvailability);

        const favList = favoritesRes.status === 'fulfilled'
          ? (favoritesRes.value.data?.favorites || [])
          : [];
        setFavorites(favList.map(fav => String(fav.entityId)));

        if (ownProfileRes.status === 'fulfilled' && ownProfileRes.value.data?.profile) {
          const ownProfile = ownProfileRes.value.data.profile;
          setCurrentUserStartupId(ownProfile._id);
          const match = startupsWithAvailability.find(s => s._id === ownProfile._id);
          setCurrentUserStartup(match || ownProfile);
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
      if (isFavorite) {
        await axios.post(
          `${baseUrl}/startupark/api/favorites/add`,
          { entityType: 'startup', entityId: startupId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(
          `${baseUrl}/startupark/api/favorites/remove`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { entityType: 'startup', entityId: startupId }
          }
        );
      }
      setFavorites(prev =>
        isFavorite
          ? [...prev, String(startupId)]
          : prev.filter(id => id !== String(startupId))
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
        (startup.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (startup.tagline || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (startup.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="glass-card p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Connection Error</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-mono">Try Again</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-8xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 glass-inset text-zinc-600 dark:text-zinc-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
          <MdRocketLaunch className="h-4 w-4" />
          Discover Tomorrow's Startups
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
          {showOnlyFavorites ? 'Your Startup Collection' : 'Innovation Ecosystem'}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
          {showOnlyFavorites
            ? 'Your curated list of groundbreaking startups to watch'
            : 'Connect with visionary founders and cutting-edge technologies'}
        </p>
      </div>

      {/* Current User Startup — mono glass */}
      {currentUserStartup && !showOnlyFavorites && (
        <div className="mb-10">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="h-24 w-24 rounded-2xl bg-white dark:bg-zinc-800 p-3 shadow-sm border border-black/5 dark:border-white/10">
                  <img
                    src={getImageUrl(currentUserStartup.logo, baseUrl)}
                    alt={`${currentUserStartup.companyName} logo`}
                    className="h-full w-full object-contain"
                    onError={(e) => { e.target.src = DefaultLogo; e.target.className = 'h-full w-full object-contain p-1'; }}
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 glass-inset text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-full text-xs font-semibold mb-2 uppercase tracking-wider">
                  <MdLightbulb className="h-3.5 w-3.5" />
                  Your Venture
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                  {currentUserStartup.companyName}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-3 max-w-2xl">
                  {currentUserStartup.tagline}
                </p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {[currentUserStartup.industry, currentUserStartup.fundingStage, currentUserStartup.location].filter(Boolean).map((tag, i) => (
                    <span key={i} className="glass-inset text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link to={`/startupark/startups/${currentUserStartup._id}`} className="btn-mono px-6 py-3">
                  Explore Public Profile
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="sticky top-4 z-10 mb-8">
        <div className="glass-card p-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {showOnlyFavorites ? 'Favorites' : 'Featured Startups'}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                {filteredStartups.length} {filteredStartups.length === 1 ? 'startup' : 'startups'} found
              </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              {!showOnlyFavorites && (
                <>
                  <div className="relative flex-1 sm:flex-initial">
                    <SearchBar
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      placeholder="Search startups, technologies, industries..."
                    />
                  </div>
                  <FilterDropdown
                    options={industries}
                    selected={selectedIndustry}
                    setSelected={setSelectedIndustry}
                    label="Industry"
                  />
                </>
              )}
              <button
                onClick={() => navigate('/startupark/nearby')}
                className="btn-ghost flex items-center gap-2"
              >
                <FiNavigation className="h-4 w-4" />
                Nearby
              </button>
              <button
                onClick={() => navigate(showOnlyFavorites ? '/startupark/startups' : '/startupark/favorites')}
                className="btn-ghost"
              >
                {showOnlyFavorites ? 'Browse All' : 'View Favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="glass-card h-96"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredStartups.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full glass-inset mb-6">
                <MdLightbulb className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                {showOnlyFavorites ? 'No favorites yet' : 'No startups match your criteria'}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-7">
                {showOnlyFavorites
                  ? 'Start exploring innovative startups and save your favorites to track them here'
                  : 'Try adjusting your search terms or filter criteria to find what you\'re looking for'}
              </p>
              {showOnlyFavorites && (
                <Link to="/startupark/startups" className="btn-mono">
                  <MdRocketLaunch className="h-5 w-5" />
                  Explore Startups
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStartups.map(startup => (
                <div
                  key={startup._id}
                  onMouseEnter={() => setHoveredStartup(startup._id)}
                  onMouseLeave={() => setHoveredStartup(null)}
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

      {/* Stats Footer — mono */}
      {!showOnlyFavorites && filteredStartups.length > 0 && (
        <div className="mt-14 pt-8 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: startups.length, label: 'Active Startups' },
              { value: new Set(startups.map(s => s.industry)).size, label: 'Industries' },
              { value: favorites.length, label: 'Total Favorites' },
              { value: startups.filter(s => s.trending).length, label: 'Trending Now' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</div>
                <div className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupList;