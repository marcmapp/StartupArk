import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

// Opportunities are standalone jobs/internships/courses/freelance listings — NOT
// tied to any specific project (see routes/startupark-opportunities.cjs header for
// the intentional split vs. WorkPost). Kept as its own hook, mirroring
// useTalentDirectory.js, instead of folding into useProjectArk.js.
const BASE = import.meta.env.VITE_API_BASE_URL;
const OPPORTUNITIES = `${BASE}/startupark/api/opportunities`;
const APPLICATIONS = `${BASE}/startupark/api/applications`;
const CHAT = `${BASE}/startupark/api/chat`;

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchOpportunities = useCallback(async (params = {}) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') query.set(k, v);
      });
      const { data } = await axios.get(`${OPPORTUNITIES}?${query}`, {
        headers: authHeader(),
        signal: abortRef.current.signal
      });
      setOpportunities(data.opportunities || []);
      setPagination({ total: data.total || 0, page: data.page || 1, pages: data.pages || 1 });
    } catch (err) {
      if (err.name !== 'CanceledError') setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOpportunity = useCallback(async (id) => {
    const { data } = await axios.get(`${OPPORTUNITIES}/${id}`, { headers: authHeader() });
    return data.opportunity;
  }, []);

  const createOpportunity = useCallback(async (payload) => {
    const { data } = await axios.post(OPPORTUNITIES, payload, { headers: authHeader() });
    return data.opportunity;
  }, []);

  const updateOpportunity = useCallback(async (id, payload) => {
    const { data } = await axios.put(`${OPPORTUNITIES}/${id}`, payload, { headers: authHeader() });
    return data.opportunity;
  }, []);

  const closeOpportunity = useCallback(async (id) => {
    const { data } = await axios.delete(`${OPPORTUNITIES}/${id}`, { headers: authHeader() });
    return data;
  }, []);

  const applyToOpportunity = useCallback(async (id, payload) => {
    const { data } = await axios.post(`${OPPORTUNITIES}/${id}/apply`, payload, { headers: authHeader() });
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

  const fetchApplicationResumeUrl = useCallback(async (id) => {
    const { data } = await axios.get(`${APPLICATIONS}/${id}/resume`, { headers: authHeader() });
    return data.url;
  }, []);

  // Reuses the existing chat module — same "initiate then navigate" pattern as
  // WorkPostDetail's handleMessageStartup. Backend resolves the recipient
  // server-side from the startup profile id, so this only needs startupId.
  const initiateStartupConversation = useCallback(async (startupId) => {
    const { data } = await axios.post(
      `${CHAT}/initiate`,
      { contextType: 'startup', contextId: startupId },
      { headers: authHeader() }
    );
    return data.conversation;
  }, []);

  return {
    opportunities, pagination, loading, error,
    fetchOpportunities, fetchOpportunity, createOpportunity, updateOpportunity, closeOpportunity,
    applyToOpportunity, fetchApplications, updateApplicationStatus, fetchApplicationResumeUrl,
    initiateStartupConversation,
  };
}
