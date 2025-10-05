import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiExternalLink, FiLinkedin, FiTwitter, FiFacebook } from 'react-icons/fi';
import Loader from '../../../../components/Loader';

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
        const response = await axios.get(`${baseUrl}/smart/api/smart/products/${id}`);
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

  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http')) return key;
    return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Product</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Products
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Product Images */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-96 object-contain"
                onError={(e) => {
                  e.target.src = '/default-product.png';
                  e.target.onerror = null;
                }}
              />
            </div>
            {product.gallery?.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.gallery.map((img, index) => (
                  <div key={index} className="border rounded overflow-hidden">
                    <img
                      src={getImageUrl(img.url)}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.website && (
                <a
                  href={product.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  Visit Website <FiExternalLink className="ml-1" />
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags?.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            <div className="prose max-w-none mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.longDescription || product.shortDescription}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Industry</h3>
                <p className="text-gray-900">{product.industry || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Stage</h3>
                <p className="text-gray-900">{product.stage || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Launch Date</h3>
                <p className="text-gray-900">
                  {product.launchDate ? new Date(product.launchDate).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Price</h3>
                <p className="text-gray-900">
                  {product.price ? `$${product.price}` : 'Not specified'}
                </p>
              </div>
            </div>

            {/* Startup Info */}
            {product.startup && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">From the Startup</h3>
                <div className="flex items-center space-x-4">
                  {product.startup.logo ? (
                    <img
                      src={getImageUrl(product.startup.logo)}
                      alt={`${product.startup.name} logo`}
                      className="h-16 w-16 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl font-medium text-gray-500">
                        {product.startup.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{product.startup.name}</h4>
                    <p className="text-gray-600 text-sm">{product.startup.tagline}</p>
                    <div className="flex space-x-3 mt-2">
                      {product.startup.linkedin && (
                        <a
                          href={product.startup.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-indigo-600"
                        >
                          <FiLinkedin className="h-5 w-5" />
                        </a>
                      )}
                      {product.startup.twitter && (
                        <a
                          href={product.startup.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-indigo-600"
                        >
                          <FiTwitter className="h-5 w-5" />
                        </a>
                      )}
                      {product.startup.facebook && (
                        <a
                          href={product.startup.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-indigo-600"
                        >
                          <FiFacebook className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/startups/${product.startup._id}`}
                  className="inline-block mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View full startup profile →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;