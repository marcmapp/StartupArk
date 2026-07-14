import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;
const PA = `${BASE}/startupark/api/projectark`;

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useProjectArk() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchPosts = useCallback(async (params = {}) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') query.set(k, v);
      });
      const { data } = await axios.get(`${PA}/posts?${query}`, {
        headers: authHeader(),
        signal: abortRef.current.signal
      });
      setPosts(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      if (err.name !== 'CanceledError') setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${PA}/posts/mine`, { headers: authHeader() });
      setMyPosts(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPost = useCallback(async (id) => {
    const { data } = await axios.get(`${PA}/posts/${id}`, { headers: authHeader() });
    return data.data;
  }, []);

  const createPost = useCallback(async (payload) => {
    const { data } = await axios.post(`${PA}/posts`, payload, { headers: authHeader() });
    return data.data;
  }, []);

  const updatePost = useCallback(async (id, payload) => {
    const { data } = await axios.put(`${PA}/posts/${id}`, payload, { headers: authHeader() });
    return data.data;
  }, []);

  const cancelPost = useCallback(async (id) => {
    const { data } = await axios.delete(`${PA}/posts/${id}`, { headers: authHeader() });
    return data;
  }, []);

  const submitProposal = useCallback(async (payload) => {
    const { data } = await axios.post(`${PA}/proposals`, payload, { headers: authHeader() });
    return data.data;
  }, []);

  const fetchProposals = useCallback(async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const { data } = await axios.get(`${PA}/proposals?${query}`, { headers: authHeader() });
    return data.data || [];
  }, []);

  const updateProposalStatus = useCallback(async (id, status) => {
    const { data } = await axios.patch(`${PA}/proposals/${id}/status`, { status }, { headers: authHeader() });
    return data.data;
  }, []);

  const withdrawProposal = useCallback(async (id) => {
    const { data } = await axios.patch(`${PA}/proposals/${id}/withdraw`, {}, { headers: authHeader() });
    return data;
  }, []);

  const fetchEngagements = useCallback(async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const { data } = await axios.get(`${PA}/engagements?${query}`, { headers: authHeader() });
    return data.data || [];
  }, []);

  const fetchEngagement = useCallback(async (id) => {
    const { data } = await axios.get(`${PA}/engagements/${id}`, { headers: authHeader() });
    return data.data;
  }, []);

  const updateMilestone = useCallback(async (engagementId, milestoneId, status, rejectionReason) => {
    const payload = { status };
    if (rejectionReason) payload.rejectionReason = rejectionReason;
    const { data } = await axios.patch(
      `${PA}/engagements/${engagementId}/milestone/${milestoneId}`,
      payload,
      { headers: authHeader() }
    );
    return data.data;
  }, []);

  const markEngagementComplete = useCallback(async (id) => {
    const { data } = await axios.patch(`${PA}/engagements/${id}/complete`, {}, { headers: authHeader() });
    return data.data;
  }, []);

  const cancelEngagement = useCallback(async (id, reason) => {
    const { data } = await axios.patch(`${PA}/engagements/${id}/cancel`, { reason }, { headers: authHeader() });
    return data;
  }, []);

  const fetchTrustScore = useCallback(async (userId) => {
    const { data } = await axios.get(`${PA}/ratings/trust/${userId}`, { headers: authHeader() });
    return data.data;
  }, []);

  const submitRating = useCallback(async (payload) => {
    const { data } = await axios.post(`${PA}/ratings`, payload, { headers: authHeader() });
    return data.data;
  }, []);

  const fetchNotifications = useCallback(async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const { data } = await axios.get(`${PA}/notifications?${query}`, { headers: authHeader() });
    return data;
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    const { data } = await axios.patch(`${PA}/notifications/${id}/read`, {}, { headers: authHeader() });
    return data.data;
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const { data } = await axios.patch(`${PA}/notifications/read-all`, {}, { headers: authHeader() });
    return data;
  }, []);

  return {
    posts, pagination, myPosts, loading, error,
    fetchPosts, fetchMyPosts, fetchPost, createPost, updatePost, cancelPost,
    submitProposal, fetchProposals, updateProposalStatus, withdrawProposal,
    fetchEngagements, fetchEngagement, updateMilestone, markEngagementComplete, cancelEngagement,
    fetchTrustScore, submitRating,
    fetchNotifications, markNotificationRead, markAllNotificationsRead
  };
}
