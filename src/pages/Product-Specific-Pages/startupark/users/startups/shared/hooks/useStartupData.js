import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import axios from 'axios';

// R2 public CDN base URL — files served directly, no backend proxy
const R2_PUBLIC_BASE = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

const getImageUrl = (key) => {
  if (!key) return null;
  if (key.startsWith('blob:')) return key;
  if (key.startsWith('http')) return key;
  // Old proxy path format — convert to direct R2 URL
  if (key.startsWith('/startupark/api/s3/file/')) {
    const r2Key = decodeURIComponent(key.replace('/startupark/api/s3/file/', ''));
    return `${R2_PUBLIC_BASE}/${r2Key}`;
  }
  return `${R2_PUBLIC_BASE}/${key}`;
};

export const useStartupData = (startupId = null) => {
  const [startupData, setStartupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => localStorage.getItem('token');

  const processStartupData = (data) => {
    if (!data) return null;

    const processProductImages = (products = []) => {
      return products.map(product => ({
        ...product,
        images: product.images?.map(img => ({
          ...img,
          url: getImageUrl(img.url)
        })) || [],
        featuredImage: getImageUrl(product.featuredImage || product.image),
        image: getImageUrl(product.image || product.featuredImage),
        getDisplayImages: function() {
          if (this.images && this.images.length > 0) return this.images;
          if (this.featuredImage) return [{ url: this.featuredImage, type: 'image', isFeatured: true }];
          return [];
        }
      }));
    };

    return {
      ...data,
      logo: getImageUrl(data.logo),
      gallery: data.gallery?.map(item => ({
        ...item,
        url: getImageUrl(item.url)
      })) || [],
      team: data.team?.map(member => ({
        ...member,
        profilePhoto: getImageUrl(member.profilePhoto)
      })) || [],
      pitchDeck: getImageUrl(data.pitchDeck),
      products: processProductImages(data.products || [])
    };
  };

  const fetchStartupProducts = async (startupId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${baseUrl}/startupark/api/products?startupId=${startupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data?.products || [];
    } catch (error) {
      console.error('Error fetching startup products:', error);
      return [];
    }
  };

  const fetchStartupData = async (id = startupId) => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      let response;
      let startupWithProducts;

      if (id) {
        response = await axios.get(`${baseUrl}/startupark/api/profile/startups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        startupWithProducts = response.data?.startup || response.data;

        try {
          const products = await fetchStartupProducts(id);
          startupWithProducts.products = products;
        } catch (productsError) {
          console.warn('Could not fetch products:', productsError);
          startupWithProducts.products = startupWithProducts.products || [];
        }

      } else {
        response = await axios.get(`${baseUrl}/startupark/api/profile/startup`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.profile) {
          startupWithProducts = response.data.profile;

          try {
            const products = await fetchStartupProducts(startupWithProducts._id);
            startupWithProducts.products = products;
          } catch (productsError) {
            console.warn('Could not fetch products for current startup:', productsError);
            startupWithProducts.products = startupWithProducts.products || [];
          }
        } else {
          setError('No startup profile found');
          setLoading(false);
          return;
        }
      }

      const processedData = processStartupData(startupWithProducts);
      setStartupData(processedData);

    } catch (err) {
      console.error('Error fetching startup data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load startup data';
      setError(errorMessage);

      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Startup not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    if (!startupData) return;
    try {
      const id = startupData._id;
      const products = await fetchStartupProducts(id);
      setStartupData(prev => ({
        ...prev,
        products: processStartupData({ products }).products
      }));
      return products;
    } catch (error) {
      console.error('Error refreshing products:', error);
      throw error;
    }
  };

  const updateProductInState = (productId, updatedProduct) => {
    setStartupData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        products: prev.products.map(product =>
          product._id === productId
            ? processStartupData({ products: [updatedProduct] }).products[0]
            : product
        )
      };
    });
  };

  const addProductToState = (newProduct) => {
    setStartupData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        products: [
          processStartupData({ products: [newProduct] }).products[0],
          ...prev.products
        ]
      };
    });
  };

  const removeProductFromState = (productId) => {
    setStartupData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        products: prev.products.filter(product => product._id !== productId)
      };
    });
  };

  useEffect(() => {
    fetchStartupData();
  }, [startupId]);

  return {
    startupData,
    loading,
    error,
    refetch: fetchStartupData,
    setStartupData,
    refreshProducts,
    updateProductInState,
    addProductToState,
    removeProductFromState
  };
};