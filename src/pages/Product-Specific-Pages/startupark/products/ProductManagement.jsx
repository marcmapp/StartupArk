import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddProductForm from './AddProductForm';
import ProductImageCarousel from './ProductImageCarousel';
import axios from 'axios';
import { 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiPlus, 
  FiExternalLink, 
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiUsers,
  FiTrendingUp,
  FiPackage,
  FiGlobe,
  FiTag
} from 'react-icons/fi';
import { MdRocketLaunch } from 'react-icons/md';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);
  const [hasStartupProfile, setHasStartupProfile] = useState(false);
  const [startupProfile, setStartupProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // UPDATED: Helper function to get image URL
  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http') || key.startsWith('blob:')) return key;
    
    // Check if it's already a full URL
    if (key.includes(baseUrl)) return key;
    
    // Assume it's an S3 key
    return `${baseUrl}/startupark/api/s3/file/${encodeURIComponent(key)}`;
  };

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    checkStartupProfile();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const checkStartupProfile = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/startupark/api/startupark/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userStartup = response.data.find(item => item.role === 'startup');
      if (userStartup) {
        setHasStartupProfile(true);
        setStartupProfile(userStartup);
        fetchProducts();
      } else {
        setHasStartupProfile(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking startup profile:', err);
      setHasStartupProfile(false);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/startupark/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = getAuthToken();
      await axios.delete(`${baseUrl}/startupark/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProducts(prev => prev.filter(p => p._id !== productId));
      setFilteredProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleProductSuccess = (product) => {
    setShowProductForm(false);
    setEditingProduct(null);
    
    if (product) {
      if (editingProduct) {
        setProducts(prev => prev.map(p => p._id === product._id ? product : p));
        setFilteredProducts(prev => prev.map(p => p._id === product._id ? product : p));
      } else {
        setProducts(prev => [product, ...prev]);
        setFilteredProducts(prev => [product, ...prev]);
      }
    }
  };

  // Helper function to get display images
  const getDisplayImages = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images.map(img => ({
        ...img,
        url: getImageUrl(img.url)
      }));
    }
    
    if (product.featuredImage) {
      return [{ url: getImageUrl(product.featuredImage), type: 'image', isFeatured: true }];
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  if (!hasStartupProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Startup Profile Required</h2>
            <p className="text-gray-600 mb-8 text-lg">
              You need to create a startup profile before you can manage products.
            </p>
            <Link
              to="/startupark/startup-edit-profile"
              className="inline-flex items-center gap-2 bg-yellow-600 text-white px-8 py-4 rounded-xl hover:bg-yellow-700 font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Create Startup Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MdRocketLaunch className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              </div>
              <p className="text-gray-600 text-lg">
                Manage your product portfolio for <span className="font-semibold text-indigo-600">{startupProfile?.name}</span>
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <FiPlus className="w-5 h-5" />
              Add New Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  <p className="text-gray-600 text-sm">Total Products</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FiTrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.stage === 'Launched').length}
                  </p>
                  <p className="text-gray-600 text-sm">Launched</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FiUsers className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.stage === 'Beta').length}
                  </p>
                  <p className="text-gray-600 text-sm">In Beta</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FiGlobe className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.website).length}
                  </p>
                  <p className="text-gray-600 text-sm">With Website</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or tags..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-all">
                  <FiFilter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {showProductForm ? (
          <AddProductForm
            onSuccess={handleProductSuccess}
            isEdit={!!editingProduct}
            initialData={editingProduct}
            startupId={startupProfile?._id}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {searchTerm ? 'No products match your search. Try different keywords.' : 'Start building your product portfolio to showcase your innovation.'}
            </p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ModernProductCard 
                key={product._id} 
                product={product} 
                getDisplayImages={getDisplayImages}
                getImageUrl={getImageUrl}
                onEdit={() => {
                  setEditingProduct(product);
                  setShowProductForm(true);
                }}
                onDelete={() => handleDeleteProduct(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Modern Product Card Component for Management
const ModernProductCard = ({ product, getDisplayImages, getImageUrl, onEdit, onDelete }) => {
  const displayImages = getDisplayImages(product);

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 overflow-hidden">
      {/* Product Image with Carousel */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <ProductImageCarousel 
          images={displayImages}
          productName={product.name}
          className="h-48"
          showThumbnails={false}
          enableZoom={false}
        />
        
        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={onEdit}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit
          </button>
          <Link
            to={`/products/${product._id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            View
          </Link>
        </div>

        {/* Stage Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
            product.stage === 'Launched' ? 'bg-green-500 text-white' :
            product.stage === 'Beta' ? 'bg-blue-500 text-white' :
            product.stage === 'Scaling' ? 'bg-purple-500 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {product.stage}
          </span>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 shadow-lg"
          title="Delete product"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 mb-3">
            {product.name}
          </h3>
          <p className="text-gray-600 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                <FiTag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm mb-4">
          {product.industry && (
            <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
              {product.industry}
            </span>
          )}
          {product.price && (
            <span className="font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              ${product.price}
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Link
              to={`/products/${product._id}`}
              className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              View Details
            </Link>
            
            {product.website && (
              <a
                href={product.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                title="Visit website"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Edit product"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;