import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

// Self-marketing Talent Posts (C#8) — distinct from useTalentDirectory.js, which
// is the auto-listed, read-only directory built from existing Student/User
// profiles. These are opt-in listings the owner writes themselves, and are the
// target of startup-initiated invites (see POST /:id/invite).
const BASE = import.meta.env.VITE_API_BASE_URL;
const TALENT_POSTS = `${BASE}/startupark/api/projectark/talent-posts`;
const APPLICATIONS = `${BASE}/startupark/api/applications`;

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useTalentPosts() {
  const [talentPosts, setTalentPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchTalentPosts = useCallback(async (params = {}) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') query.set(k, v);
      });
      const { data } = await axios.get(`${TALENT_POSTS}?${query}`, {
        headers: authHeader(),
        signal: abortRef.current.signal
      });
      setTalentPosts(data.talentPosts || []);
      setPagination({ total: data.total || 0, page: data.page || 1, pages: data.pages || 1 });
    } catch (err) {
      if (err.name !== 'CanceledError') setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTalentPost = useCallback(async (id) => {
    const { data } = await axios.get(`${TALENT_POSTS}/${id}`, { headers: authHeader() });
    return data.talentPost;
  }, []);

  const fetchMyTalentPosts = useCallback(async () => {
    const { data } = await axios.get(`${TALENT_POSTS}/mine/all`, { headers: authHeader() });
    return data.talentPosts || [];
  }, []);

  const createTalentPost = useCallback(async (payload) => {
    const { data } = await axios.post(TALENT_POSTS, payload, { headers: authHeader() });
    return data.talentPost;
  }, []);

  const updateTalentPost = useCallback(async (id, payload) => {
    const { data } = await axios.patch(`${TALENT_POSTS}/${id}`, payload, { headers: authHeader() });
    return data.talentPost;
  }, []);

  const deleteTalentPost = useCallback(async (id) => {
    const { data } = await axios.delete(`${TALENT_POSTS}/${id}`, { headers: authHeader() });
    return data;
  }, []);

  const inviteTalentPost = useCallback(async (id) => {
    const { data } = await axios.post(`${TALENT_POSTS}/${id}/invite`, {}, { headers: authHeader() });
    return data.application;
  }, []);

  const fetchApplications = useCallback(async (as = 'student', status) => {
    const query = new URLSearchParams({ as, ...(status ? { status } : {}) }).toString();
    const { data } = await axios.get(`${APPLICATIONS}?${query}`, { headers: authHeader() });
    return data.applications || [];
  }, []);

  const updateApplicationStatus = useCallback(async (id, payload) => {
    const { data } = await axios.put(`${APPLICATIONS}/${id}`, payload, { headers: authHeader() });
    return data.application;
  }, []);

  return {
    talentPosts, pagination, loading, error,
    fetchTalentPosts, fetchTalentPost, fetchMyTalentPosts, createTalentPost, updateTalentPost, deleteTalentPost,
    inviteTalentPost, fetchApplications, updateApplicationStatus,
  };
}
