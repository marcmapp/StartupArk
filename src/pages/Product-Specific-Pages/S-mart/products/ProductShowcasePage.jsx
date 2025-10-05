import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiExternalLink, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import Loader from '../../../../components/Loader';

const ProductShowcase = () => {
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/smart/api/smart/products`);
        setProducts(response.data || []);
        
        // Extract unique tags and industries for filters
        const allTags = new Set();
        const allIndustries = new Set();
        
        response.data.forEach(product => {
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

  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http')) return key;
    return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
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

  const filteredProducts = products.filter(product => {
    // Search term filter
    const matchesSearch = 
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.longDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Industry filter
    const matchesIndustry = 
      filters.industry === '' || 
      product.industry === filters.industry;
    
    // Stage filter
    const matchesStage = 
      filters.stage === '' || 
      product.stage === filters.stage;
    
    // Tags filter (match any of the selected tags)
    const matchesTags = 
      filters.tags.length === 0 || 
      (product.tags && filters.tags.some(tag => product.tags.includes(tag)));
    
    return matchesSearch && matchesIndustry && matchesStage && matchesTags;
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Showcase</h1>
        <p className="text-gray-600">Discover innovative products from our startup community</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiFilter className="mr-2" />
              Filters
              {filters.tags.length > 0 || filters.industry || filters.stage ? (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                  {[filters.industry ? 1 : 0, filters.stage ? 1 : 0, filters.tags.length].reduce((a, b) => a + b, 0)}
                </span>
              ) : null}
            </button>
            
            {(filters.tags.length > 0 || filters.industry || filters.stage || searchTerm) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        filters.tags.includes(tag)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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

      {/* Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredProducts.length}</span> products
          {filteredProducts.length !== products.length ? ` (of ${products.length})` : ''}
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          <div className="mt-6">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 relative">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-product.png';
                    e.target.onerror = null;
                  }}
                />
                {product.startup && (
                  <div className="absolute bottom-2 left-2 flex items-center">
                    {product.startup.logo && (
                      <img
                        src={getImageUrl(product.startup.logo)}
                        alt={`${product.startup.name} logo`}
                        className="h-8 w-8 rounded-full border-2 border-white bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.onerror = null;
                        }}
                      />
                    )}
                    <span className="ml-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                      {product.startup.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Content */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  {product.website && (
                    <a
                      href={product.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Visit website"
                    >
                      <FiExternalLink />
                    </a>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
                
                {product.tags?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        +{product.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                 <Link
  to={`/products/${product._id}`}
  onClick={() => console.log("Navigating to product:", product._id)}
  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
>
  View details
</Link>
                  
                  {product.startup && (
                    <Link
                      to={`/startups/${product.startup._id}`}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      By {product.startup.name}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductShowcase;