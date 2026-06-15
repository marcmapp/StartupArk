import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useStartupProducts = (startupId = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        setProducts([]);
        return;
      }

      let response;
      if (startupId) {
        // Fetch products for a specific startup
        response = await axios.get(
          `${baseUrl}/startupark/api/products?startupId=${startupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Fetch current user's products
        response = await axios.get(
          `${baseUrl}/startupark/api/products?mine=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setError(error.response?.data?.error || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [startupId]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};