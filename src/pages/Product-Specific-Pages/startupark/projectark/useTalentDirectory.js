import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;
const TALENT = `${BASE}/startupark/api/projectark/talent`;
const CHAT = `${BASE}/startupark/api/chat`;

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useTalentDirectory() {
  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchTalent = useCallback(async (params = {}) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') query.set(k, v);
      });
      const { data } = await axios.get(`${TALENT}?${query}`, {
        headers: authHeader(),
        signal: abortRef.current.signal
      });
      setProfiles(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      if (err.name !== 'CanceledError') setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTalentProfile = useCallback(async (profileType, id) => {
    const { data } = await axios.get(`${TALENT}/${profileType}/${id}`, { headers: authHeader() });
    return data.data;
  }, []);

  // Reuses the existing chat module (same "initiate then navigate" pattern as
  // StartupProfileHeader/index.jsx) — no new messaging system.
  const initiateProfileConversation = useCallback(async ({ userId, profileId, profileType }) => {
    const { data } = await axios.post(
      `${CHAT}/initiate`,
      { recipientId: userId, contextType: profileType, contextId: profileId },
      { headers: authHeader() }
    );
    return data.conversation;
  }, []);

  return {
    profiles, pagination, loading, error,
    fetchTalent, fetchTalentProfile, initiateProfileConversation,
  };
}
