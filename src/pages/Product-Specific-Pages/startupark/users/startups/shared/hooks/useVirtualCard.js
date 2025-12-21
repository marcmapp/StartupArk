import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useVirtualCard = (startupId) => {
  const [vcData, setVcData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => localStorage.getItem('token');

  const fetchVcData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/startupark/api/virtual-card`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setVcData(response.data);
      }
    } catch (err) {
      console.error('Error fetching VC data:', err);
      setError(err.response?.data?.error || 'Failed to load VC data');
    } finally {
      setLoading(false);
    }
  };

  const createVirtualCard = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.post(
        `${baseUrl}/startupark/api/virtual-card`,
        { startupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVcData(response.data);
      return response.data;
    } catch (err) {
      console.error('Error creating VC:', err);
      setError(err.response?.data?.error || 'Failed to create virtual card');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startupId) {
      fetchVcData();
    }
  }, [startupId]);

  return {
    vcData,
    loading,
    error,
    createVirtualCard,
    refetch: fetchVcData
  };
};