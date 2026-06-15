import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiEdit2, FiPlus } from 'react-icons/fi';
import { useStartupProducts } from '../../shared/hooks/useStartupProducts';
import ProductCard from './ProductCard';
import ProductImageCarousel from '../../../../products/ProductImageCarousel';

const StartupProducts = ({ startupId, isEditable = false, baseUrl }) => {
  const { products, loading, error } = useStartupProducts(startupId);

  // Helper function to get display images for a product
  const getDisplayImages = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    
    if (product.featuredImage) {
      return [{ url: product.featuredImage, type: 'image', isFeatured: true }];
    }
    
    if (product.image) {
      return [{ url: product.image, type: 'image', isFeatured: true }];
    }
    
    return [];
  };

  // Helper function to get image URL
  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http')) return key;
    if (key.startsWith('blob:')) return key;
    return `https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev/${key}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 glass-inset rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-inset h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Products Portfolio</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              {products.length} product{products.length !== 1 ? 's' : ''} in catalog
            </p>
          </div>

          {isEditable && (
            <Link to="/manage-products" className="btn-mono">
              <FiEdit2 className="w-4 h-4" />
              Manage Products
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 glass-inset">
            <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No products yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              {isEditable
                ? "Start building your product portfolio to showcase your innovation"
                : "This startup hasn't added any products yet"
              }
            </p>
            {isEditable && (
              <Link to="/manage-products" className="btn-mono">
                <FiPlus className="w-4 h-4" />
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                getImageUrl={getImageUrl}
                getDisplayImages={getDisplayImages}
                showDetails={true}
                isEditable={isEditable}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupProducts;