// src/pages/.../startupark/geo/useGeoSearch.js
// State machine hook: idle → locating → searching → results | error
import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { getCurrentPosition } from '../../../../services/geoLocator';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function useGeoSearch(entity = 'startup') {
  const [state, setState] = useState('idle');
  const [position, setPosition] = useState(null);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [radiusKm, setRadiusKm] = useState(50);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ industry: '', sort: 'distance' });
  const abortRef = useRef(null);

  const _doSearch = useCallback(async (params) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setState('searching');
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') query.set(k, v);
      });
      const { data } = await axios.get(
        `${baseUrl}/startupark/api/geo/search?${query}`,
        { headers: { Authorization: `Bearer ${token}` }, signal: abortRef.current.signal }
      );
      setResults(data.data || []);
      setTotal(data.total || 0);
      setRadiusKm(data.radiusKm || params.radius || 50);
      setPage(params.page || 1);
      setState('results');
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError(err.response?.data?.error || err.message);
      setState('error');
    }
  }, []);

  const locate = useCallback(async (overrideRadius) => {
    setState('locating');
    setError(null);
    try {
      const pos = await getCurrentPosition();
      setPosition(pos);
      await _doSearch({
        lat: pos.lat,
        lng: pos.lng,
        radius: overrideRadius || radiusKm,
        sort: filters.sort,
        industry: filters.industry,
        entity,
        page: 1,
        limit: 20
      });
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }, [_doSearch, radiusKm, filters, entity]);

  const searchByCity = useCallback(async (city) => {
    await _doSearch({
      city,
      sort: filters.sort,
      industry: filters.industry,
      entity,
      page: 1,
      limit: 20
    });
  }, [_doSearch, filters, entity]);

  const updateFilters = useCallback((next) => {
    setFilters((f) => ({ ...f, ...next }));
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState('idle');
    setResults([]);
    setError(null);
    setPosition(null);
    setTotal(0);
  }, []);

  return {
    state, position, results, total, radiusKm, error, page,
    filters, locate, searchByCity, updateFilters, reset, setPage
  };
}
