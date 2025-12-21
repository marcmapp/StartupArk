import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductImageCarousel from './ProductImageCarousel';
import { FiExternalLink, FiSearch, FiFilter, FiX, FiArrowRight, FiUser } from 'react-icons/fi';
import { MdRocketLaunch, MdTrendingUp } from 'react-icons/md';
import Loader from '../../../../components/Loader';

const ProductShowcase = () => {
  const [products, setProducts] = useState([]);
  const [currentUserProducts, setCurrentUserProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [publicProducts, setPublicProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    stage: '',
    tags: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);
  const [currentUserStartupId, setCurrentUserStartupId] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  // Helper function to get proper image URL
  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http')) return key;
    if (key.startsWith('blob:')) return key;
    return `${baseUrl}/startupark/api/s3/file/${encodeURIComponent(key)}`;
  };

  // Helper function to get startup logo URL
  const getStartupLogoUrl = (logoKey) => {
    if (!logoKey) return null;
    if (logoKey.startsWith('http')) return logoKey;
    if (logoKey.startsWith('blob:')) return logoKey;
    // Check if it's already a full URL from the backend
    if (logoKey.includes(baseUrl)) return logoKey;
    return `${baseUrl}/startupark/api/s3/file/${encodeURIComponent(logoKey)}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = getAuthToken();
        const [productsRes, dashboardRes] = await Promise.all([
          axios.get(`${baseUrl}/startupark/api/products`),
          token ? axios.get(`${baseUrl}/startupark/api/startupark/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          }) : Promise.resolve({ data: [] })
        ]);
        
        const allProducts = productsRes.data.products || productsRes.data || [];
        setProducts(allProducts);
        
        if (dashboardRes.data) {
          const userStartup = dashboardRes.data.find(item => item.role === 'startup');
          if (userStartup) {
            setCurrentUserStartupId(userStartup._id);
            
            const userProducts = allProducts.filter(product => 
              product.startup && product.startup._id === userStartup._id
            );
            setCurrentUserProducts(userProducts);
          }
        }
        
        const allTags = new Set();
        const allIndustries = new Set();
        
        allProducts.forEach(product => {
          if (product.tags) {
            product.tags.forEach(tag => allTags.add(tag));
          }
          if (product.industry) {
            allIndustries.add(product.industry);
          }
        });
        
        setAvailableTags(Array.from(allTags));
        setAvailableIndustries(Array.from(allIndustries));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.error || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [baseUrl]);

  useEffect(() => {
    let results = products;

    if (currentUserStartupId) {
      results = results.filter(product => 
        !product.startup || product.startup._id !== currentUserStartupId
      );
    }

    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.industry !== '') {
      results = results.filter(product => product.industry === filters.industry);
    }

    if (filters.stage !== '') {
      results = results.filter(product => product.stage === filters.stage);
    }

    if (filters.tags.length > 0) {
      results = results.filter(product =>
        product.tags && filters.tags.some(tag => product.tags.includes(tag))
      );
    }

    setFilteredProducts(results);
    setPublicProducts(results);
  }, [searchTerm, filters, products, currentUserStartupId]);

  // Helper function to get display images
  const getDisplayImages = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    
    if (product.featuredImage) {
      return [{ url: product.featuredImage, type: 'image', isFeatured: true }];
    }
    
    return [];
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      stage: '',
      tags: []
    });
    setSearchTerm('');
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Products</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg mb-6">
            <MdRocketLaunch className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">Product Showcase</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
            Discover Innovation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore groundbreaking products from our vibrant startup ecosystem
          </p>
        </div>

        {/* Current User Products Header */}
        {currentUserProducts.length > 0 && (
          <div className="mb-8">
            <div className="rounded-2xl p-6 shadow-xl border border-cyan/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden flex items-center justify-center">
                    {currentUserProducts[0]?.startup?.logo ? (
                      <img
                        src={getStartupLogoUrl(currentUserProducts[0].startup.logo)}
                        alt={`${currentUserProducts[0].startup.name} logo`}
                        className="h-16 w-16 object-cover"
                        onError={(e) => {
                          console.error('Logo load error:', currentUserProducts[0].startup.logo);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`h-16 w-16 flex items-center justify-center ${currentUserProducts[0]?.startup?.logo ? 'hidden' : 'flex'}`}>
                      <FiUser className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">My Products</h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentUserProducts.length} Product{currentUserProducts.length !== 1 ? 's' : ''} from Your Startup
                  </h3>
                  <p className="mb-3">
                    Manage and track your product portfolio
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentUserProducts.slice(0, 3).map(product => (
                      <span key={product._id} className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {product.name}
                      </span>
                    ))}
                    {currentUserProducts.length > 3 && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm text-white">
                        +{currentUserProducts.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Link 
                    to="/manage-products"
                    className="inline-flex items-center gap-2 bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Manage Products
                    <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Separator */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-4 text-gray-500">
                <div className="h-px w-20 bg-gray-300"></div>
                <span className="text-sm font-medium">Discover Other Products</span>
                <div className="h-px w-20 bg-gray-300"></div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search products by name, description..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
              >
                <FiFilter className="w-4 h-4" />
                Filters
                {(filters.tags.length > 0 || filters.industry || filters.stage) && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {[filters.industry ? 1 : 0, filters.stage ? 1 : 0, filters.tags.length].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
              
              {(filters.tags.length > 0 || filters.industry || filters.stage || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-5 py-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Industry</label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  >
                    <option value="">All Industries</option>
                    {availableIndustries.map((industry, index) => (
                      <option key={index} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Stage Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Stage</label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={filters.stage}
                    onChange={(e) => setFilters({...filters, stage: e.target.value})}
                  >
                    <option value="">All Stages</option>
                    <option value="Concept">Concept</option>
                    <option value="Beta">Beta</option>
                    <option value="Launched">Launched</option>
                    <option value="Scaling">Scaling</option>
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Popular Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 8).map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filters.tags.includes(tag)
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Discover Products
            </h2>
            <p className="text-gray-600 mt-2">
              Showing <span className="font-semibold text-blue-600">{publicProducts.length}</span> products
              {publicProducts.length !== products.length - currentUserProducts.length && (
                <span className="text-gray-500"> (filtered)</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MdTrendingUp className="w-4 h-4" />
            <span>Sorted by popularity</span>
          </div>
        </div>

        {/* Products Grid */}
        {publicProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSearch className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No products found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publicProducts.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                getDisplayImages={getDisplayImages}
                getStartupLogoUrl={getStartupLogoUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, getDisplayImages, getStartupLogoUrl }) => {
  const displayImages = getDisplayImages(product);

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Product Image with Carousel */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <ProductImageCarousel 
          images={displayImages}
          productName={product.name}
          className="h-48"
          showThumbnails={false}
          enableZoom={false}
        />
        
        {/* Stage Badge */}
        {product.stage && (
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
              product.stage === 'Launched' ? 'bg-green-500 text-white' :
              product.stage === 'Beta' ? 'bg-blue-500 text-white' :
              product.stage === 'Scaling' ? 'bg-purple-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {product.stage}
            </span>
          </div>
        )}
        
        {/* Startup Logo */}
        {product.startup && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {product.startup.logo && (
              <img
                src={getStartupLogoUrl(product.startup.logo)}
                alt={`${product.startup.name} logo`}
                className="h-8 w-8 rounded-full border-2 border-white bg-white shadow-md"
                onError={(e) => {
                  console.error('Startup logo load error:', product.startup.logo);
                  e.target.style.display = 'none';
                }}
              />
            )}
            <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-lg backdrop-blur-sm">
              {product.startup.name}
            </span>
          </div>
        )}
        
        {/* Website Link */}
        {product.website && (
          <div className="absolute bottom-3 right-3">
            <a
              href={product.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors"
              title="Visit website"
            >
              <FiExternalLink className="w-4 h-4 text-gray-700" />
            </a>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Content */}
      <div className="p-5">
        {/* Product Header */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          {product.industry && (
            <span className="flex items-center gap-1">
              <FiExternalLink className="w-4 h-4" />
              {product.industry}
            </span>
          )}
          {product.price && (
            <span className="font-semibold text-green-600">
              ${product.price}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            to={`/products/${product._id}`}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
          >
            View Details
            <FiExternalLink className="w-4 h-4" />
          </Link>
          
          {product.startup && (
            <Link
              to={`/startups/${product.startup._id}`}
              className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1"
            >
              <span>By {product.startup.name}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;