import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import axios from 'axios';

export const useStartupData = (startupId = null) => {
  const [startupData, setStartupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => localStorage.getItem('token');

  // Enhanced image processing function
  const processStartupData = (data) => {
    if (!data) return null;

    const getImageUrl = (key) => {
      if (!key) return null;
      if (key.startsWith('http')) return key;
      if (key.startsWith('blob:')) return key;
      return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
    };

    // Process product images to ensure proper format
    const processProductImages = (products = []) => {
      return products.map(product => ({
        ...product,
        // Ensure images array exists and is properly formatted
        images: product.images?.map(img => ({
          ...img,
          url: getImageUrl(img.url)
        })) || [],
        // Maintain backward compatibility with featuredImage and image fields
        featuredImage: getImageUrl(product.featuredImage || product.image),
        image: getImageUrl(product.image || product.featuredImage),
        // Helper method to get display images for carousel
        getDisplayImages: function() {
          if (this.images && this.images.length > 0) {
            return this.images;
          }
          if (this.featuredImage) {
            return [{ url: this.featuredImage, type: 'image', isFeatured: true }];
          }
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
        avatar: getImageUrl(member.avatar)
      })) || [],
      pitchDeck: getImageUrl(data.pitchDeck),
      // Process products with enhanced image handling
      products: processProductImages(data.products || [])
    };
  };

  // Enhanced product fetching with better error handling
  const fetchStartupProducts = async (startupId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${baseUrl}/smart/api/products/startup/${startupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching startup products:', error);
      // Don't throw error for products - return empty array instead
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
        // Fetch specific startup by ID (for detail view)
        response = await axios.get(`${baseUrl}/smart/api/smart/startups-by-id/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        startupWithProducts = response.data;
        
        // Always fetch products separately to ensure we have the latest data
        // and proper image formatting
        try {
          const products = await fetchStartupProducts(id);
          startupWithProducts.products = products;
        } catch (productsError) {
          console.warn('Could not fetch products, using existing data:', productsError);
          // If products fetch fails, ensure products array exists
          startupWithProducts.products = startupWithProducts.products || [];
        }
        
      } else {
        // Fetch current user's startup data (for profile view)
        response = await axios.get(`${baseUrl}/smart/api/smart/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.length > 0) {
          const startupForm = response.data.find(form => form.role === 'startup');
          if (startupForm) {
            startupWithProducts = startupForm.formData;
            
            // Fetch products for current user's startup
            if (startupForm._id) {
              try {
                const products = await fetchStartupProducts(startupForm._id);
                startupWithProducts.products = products;
              } catch (productsError) {
                console.warn('Could not fetch products for current startup:', productsError);
                startupWithProducts.products = startupWithProducts.products || [];
              }
            }
          } else {
            setError('No startup data found');
            setLoading(false);
            return;
          }
        } else {
          setError('No form data submitted yet');
          setLoading(false);
          return;
        }
      }

      // Process the complete startup data with products
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

  // Function to refresh products only
  const refreshProducts = async () => {
    if (!startupData) return;
    
    try {
      const startupId = startupData._id;
      const products = await fetchStartupProducts(startupId);
      
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

  // Function to update a specific product in the local state
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

  // Function to add a new product to the local state
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

  // Function to remove a product from the local state
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
    // New product management functions
    refreshProducts,
    updateProductInState,
    addProductToState,
    removeProductFromState
  };
};