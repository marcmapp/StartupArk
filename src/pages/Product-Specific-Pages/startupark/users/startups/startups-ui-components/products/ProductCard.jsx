import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiExternalLink, FiEdit2 } from 'react-icons/fi';
import ProductImageCarousel from '../../../../products/ProductImageCarousel';

const ProductCard = ({ 
  product, 
  getImageUrl, 
  getDisplayImages,
  showDetails = false, 
  isEditable = false 
}) => {
  
  // Get display images for the carousel
  const displayImages = getDisplayImages ? getDisplayImages(product) : 
    (product.images && product.images.length > 0) ? product.images :
    product.featuredImage ? [{ url: product.featuredImage, type: 'image', isFeatured: true }] :
    product.image ? [{ url: product.image, type: 'image', isFeatured: true }] :
    [];

  return (
    <div className="group glass-card hover:shadow-xl transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 overflow-hidden">
      {/* Product Image with Carousel */}
      <div className="relative h-48 bg-zinc-100 dark:bg-white/[0.03] overflow-hidden">
        <ProductImageCarousel 
          images={displayImages}
          productName={product.name}
          className="h-48"
          showThumbnails={false}
          enableZoom={false}
        />
        
        {/* Stage Badge */}
        {product.stage && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm bg-zinc-900/90 text-white dark:bg-white/90 dark:text-zinc-900">
              {product.stage}
            </span>
          </div>
        )}
        
        {/* Edit Button for Editable Cards */}
        {isEditable && (
          <div className="absolute top-3 left-3 z-10">
            <Link
              to="/manage-products"
              className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-700 dark:text-zinc-200 p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-1"
              title="Edit Product"
            >
              <FiEdit2 className="w-3 h-3" />
            </Link>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <Link
            to={`/products/${product._id}`}
            className="bg-white text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 flex items-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            View Details
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5">
        <div className="mb-4">
          <Link to={`/products/${product._id}`}>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-2 mb-2 group-hover:underline decoration-1 underline-offset-2 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description?.substring(0, 120) + '...'}
          </p>
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="glass-inset text-zinc-700 dark:text-zinc-200 text-xs px-2.5 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="glass-inset text-zinc-500 dark:text-zinc-400 text-xs px-2.5 py-1 rounded-full">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {product.industry && (
              <span className="text-zinc-500 dark:text-zinc-400 font-medium glass-inset px-2 py-1 rounded-lg">
                {product.industry}
              </span>
            )}
            {product.pricing && product.pricing !== 'Free' && (
              <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                • {product.pricing}
              </span>
            )}
          </div>
          {(product.price || product.pricing === 'Free') && (
            <span className="font-semibold text-zinc-900 dark:text-white glass-inset px-2 py-1 rounded-lg">
              {product.price ? `$${product.price}` : 'Free'}
            </span>
          )}
        </div>

        {/* Image Count Badge */}
        {displayImages.length > 1 && (
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{displayImages.length} image{displayImages.length !== 1 ? 's' : ''}</span>
            {displayImages.some(img => img.caption) && (
              <span className="text-zinc-600 dark:text-zinc-300">Has captions</span>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {showDetails && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Link
                to={`/products/${product._id}`}
                className="text-zinc-900 dark:text-white hover:underline font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                View Details
                <FiExternalLink className="w-4 h-4" />
              </Link>
              {isEditable && (
                <Link
                  to="/manage-products"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm flex items-center gap-1 transition-colors"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Edit
                </Link>
              )}
            </div>
            {product.website && (
              <a
                href={product.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 p-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                title="Visit website"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;