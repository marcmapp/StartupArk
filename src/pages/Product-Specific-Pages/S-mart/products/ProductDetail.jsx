import React, { useState, useEffect } from 'react';
import { LOGO_LIGHT, LOGO_DARK } from "../../../../Main-Configuration-Files/constants";
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiExternalLink, FiLinkedin, FiTwitter, FiFacebook, FiGlobe, FiCalendar, FiTag } from 'react-icons/fi';
import { MdRocketLaunch, MdVerified } from 'react-icons/md';
import Loader from '../../../../components/Loader';
import ProductImageCarousel from './ProductImageCarousel';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/smart/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.error || 'Failed to load product');
        if (err.response?.status === 404) {
          navigate('/not-found', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, baseUrl, navigate]);

  // Helper function to get image URL
  const getImageUrl = (key) => {
    if (!key) return LOGO_LIGHT;
    if (key.startsWith('http')) return key;
    return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
  };

  // Get display images for carousel
  const getDisplayImages = () => {
    if (!product) return [];
    
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    
    if (product.featuredImage) {
      return [{ url: product.featuredImage, type: 'image', isFeatured: true }];
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiExternalLink className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Product</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdRocketLaunch className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h3>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayImages = getDisplayImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-8 group transition-colors"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images with Carousel */}
            <div className="space-y-4">
              <ProductImageCarousel 
                images={displayImages}
                productName={product.name}
                className="h-96"
                enableZoom={true}
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                    {product.stage === 'Launched' && (
                      <MdVerified className="w-6 h-6 text-green-500" title="Launched Product" />
                    )}
                  </div>
                  
                  {product.website && (
                    <a
                      href={product.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                    >
                      Visit Live Website
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <FiTag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MdRocketLaunch className="w-5 h-5 text-blue-500" />
                  About This Product
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <FiGlobe className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-700">Category</h3>
                  </div>
                  <p className="text-gray-900 font-semibold">{product.category || 'Not specified'}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <MdRocketLaunch className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-700">Stage</h3>
                  </div>
                  <p className="text-gray-900 font-semibold">{product.stage || 'Not specified'}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <FiCalendar className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-700">Pricing</h3>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {product.pricing || 'Free'}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <FiTag className="w-5 h-5 text-orange-500" />
                    <h3 className="text-sm font-medium text-gray-700">Industry</h3>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {product.industry || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Startup Info */}
              {product.startup && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MdVerified className="w-5 h-5 text-blue-500" />
                    From the Startup
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-4">
                      {product.startup.logo ? (
                        <img
                          src={getImageUrl(product.startup.logo)}
                          alt={`${product.startup.name} logo`}
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-lg"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-white">
                            {product.startup.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{product.startup.name}</h4>
                        <p className="text-gray-600 mb-3">{product.startup.tagline}</p>
                        <div className="flex space-x-4">
                          {product.startup.linkedin && (
                            <a
                              href={product.startup.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-blue-600 transition-colors p-2 bg-white rounded-lg shadow-sm"
                            >
                              <FiLinkedin className="h-5 w-5" />
                            </a>
                          )}
                          {product.startup.twitter && (
                            <a
                              href={product.startup.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-blue-400 transition-colors p-2 bg-white rounded-lg shadow-sm"
                            >
                              <FiTwitter className="h-5 w-5" />
                            </a>
                          )}
                          {product.startup.facebook && (
                            <a
                              href={product.startup.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-blue-500 transition-colors p-2 bg-white rounded-lg shadow-sm"
                            >
                              <FiFacebook className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/startups/${product.startup._id}`}
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                    >
                      View full startup profile
                      <FiExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;