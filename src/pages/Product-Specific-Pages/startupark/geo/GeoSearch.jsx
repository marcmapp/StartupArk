// GeoSearch.jsx — Full-page location discovery.
// Radar is the hero (centered). Results scroll below.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGeoSearch } from './useGeoSearch';
import RadarCanvas from './RadarCanvas';
import NearbyStartupCard from './NearbyStartupCard';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education',
  'E-commerce', 'Manufacturing', 'Agriculture', 'Media', 'Other',
];
const RADIUS_OPTIONS = [10, 25, 50, 100, 200, 500];

function getUserRole() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u.startuparkRole || u.role || (u.isStartup ? 'startup' : 'user');
  } catch {
    return 'user';
  }
}

export default function GeoSearch() {
  const userRole = getUserRole();
  const searchEntity = userRole === 'startup' ? 'user' : 'startup';
  const entityLabel = searchEntity === 'startup' ? 'startup' : 'user';

  const pageTitle = userRole === 'startup' ? 'Potential Clients Near You' : 'Startups Near You';
  const pageSubtitle = userRole === 'startup'
    ? 'Discover potential clients and collaborators in your area'
    : 'Discover startups in your city — use GPS or search by name';

  const {
    state, position, results, total, radiusKm,
    error, filters, locate, searchByCity, updateFilters, reset,
  } = useGeoSearch(searchEntity);

  const [cityInput, setCityInput] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(50);
  const [selectedBlipId, setSelectedBlipId] = useState(null);

  const isScanning = state === 'locating' || state === 'searching';
  const hasResults = state === 'results' && results.length > 0;

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) searchByCity(cityInput.trim());
  };

  const statusText = {
    idle:      'Grant location or search by city',
    locating:  'Getting your location…',
    searching: `Scanning for ${entityLabel}s…`,
    results:   `${total} ${entityLabel}${total !== 1 ? 's' : ''} found · ${radiusKm}km radius`,
    error,
  }[state] || '';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 glass-inset text-zinc-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Discovery
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">{pageTitle}</h1>
          <p className="text-zinc-500 text-base max-w-xl mx-auto">{pageSubtitle}</p>
        </div>

        {/* ── Search / filter bar ── */}
        <div className="glass-card p-4">
          <form onSubmit={handleCitySearch} className="flex flex-wrap gap-3 items-center">
            {/* City input */}
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                placeholder="City or state…"
                className="input-mono w-full pl-9 text-sm"
              />
            </div>

            {/* GPS button */}
            <button
              type="button"
              onClick={() => locate(selectedRadius)}
              disabled={isScanning}
              className="btn-mono flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
            >
              <svg className={`w-4 h-4 ${state === 'locating' ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {state === 'locating' ? 'Locating…' : 'Use GPS'}
            </button>

            {/* Radius */}
            <select
              value={selectedRadius}
              onChange={e => setSelectedRadius(Number(e.target.value))}
              className="input-mono text-sm w-28"
            >
              {RADIUS_OPTIONS.map(r => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>

            {/* Industry */}
            <select
              value={filters.industry}
              onChange={e => updateFilters({ industry: e.target.value })}
              className="input-mono text-sm w-36"
            >
              <option value="">All industries</option>
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={e => updateFilters({ sort: e.target.value })}
              className="input-mono text-sm w-36"
            >
              <option value="distance">Nearest first</option>
              <option value="relevance">Most relevant</option>
              <option value="newest">Newest first</option>
            </select>

            {/* Submit (city search) */}
            <button
              type="submit"
              disabled={isScanning || !cityInput.trim()}
              className="btn-ghost text-sm px-3 py-2 disabled:opacity-40"
            >
              Search
            </button>

            {state !== 'idle' && (
              <button type="button" onClick={reset} className="btn-ghost text-sm px-3 py-2 text-zinc-500">
                Clear
              </button>
            )}
          </form>
        </div>

        {/* ── Radar hero ── */}
        <div className="flex flex-col items-center gap-4">
          {/* Radar label */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Radar
            {isScanning && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            )}
          </div>

          <RadarCanvas
            results={results}
            maxRadiusKm={radiusKm || selectedRadius}
            userLat={position?.lat}
            userLng={position?.lng}
            isScanning={isScanning}
            onBlipClick={id => {
              setSelectedBlipId(id);
              // Scroll to the matching card
              const el = document.getElementById(`result-card-${id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          />

          {/* Status line */}
          <p className={`text-sm font-medium text-center ${state === 'error' ? 'text-red-500' : 'text-zinc-500'}`}>
            {statusText}
          </p>
        </div>

        {/* ── Results section ── */}
        <div>
          {state === 'idle' && (
            <div className="glass-card py-12 flex flex-col items-center text-center space-y-3">
              <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-zinc-400 font-medium">Start Discovering</p>
              <p className="text-xs text-zinc-600 max-w-xs">
                Grant location access or type a city name above to find {entityLabel}s near you
              </p>
            </div>
          )}

          {isScanning && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse glass-card h-28 rounded-xl" />
              ))}
            </div>
          )}

          {state === 'error' && !isScanning && (
            <div className="glass-card py-10 flex flex-col items-center text-center gap-4">
              <p className="text-red-500 text-sm">{error}</p>
              <button onClick={reset} className="btn-mono text-sm">Try again</button>
            </div>
          )}

          {state === 'results' && !isScanning && (
            <>
              {results.length === 0 ? (
                <div className="glass-card py-12 flex flex-col items-center text-center space-y-3">
                  <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-zinc-400 text-sm">No {entityLabel}s found in this area</p>
                  <button onClick={() => setSelectedRadius(r => Math.min(r * 2, 500))} className="btn-ghost text-xs px-4 py-2">
                    Expand radius
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-zinc-600 mb-4">
                    {total} {entityLabel}{total !== 1 ? 's' : ''} found
                    {radiusKm ? ` · within ${radiusKm}km` : ''}
                    {' · '}Click a blip on the radar to highlight
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map(item => (
                      <div
                        key={item._id}
                        id={`result-card-${item._id}`}
                        className={`transition-all duration-200 ${selectedBlipId === item._id ? 'ring-1 ring-zinc-400 dark:ring-zinc-300 rounded-xl scale-[1.02]' : ''}`}
                      >
                        <NearbyStartupCard startup={item} entity={searchEntity} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Back link */}
        <div className="text-center pb-4">
          <Link
            to={userRole === 'startup' ? '/startupark/startup-dashboard' : '/startupark/startupsList'}
            className="btn-ghost text-xs px-4 py-2"
          >
            ← {userRole === 'startup' ? 'Back to Dashboard' : 'Browse All Startups'}
          </Link>
        </div>

      </div>
    </div>
  );
}
