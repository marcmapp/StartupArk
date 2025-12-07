import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiExternalLink, FiEdit2 } from 'react-icons/fi';
import ProductImageCarousel from '../../../products/ProductImageCarousel';

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
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 overflow-hidden">
      {/* Product Image with Carousel */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
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
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
              product.stage === 'Launched' ? 'bg-green-500 text-white' :
              product.stage === 'Beta' ? 'bg-blue-500 text-white' :
              product.stage === 'Scaling' ? 'bg-purple-500 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {product.stage}
            </span>
          </div>
        )}
        
        {/* Edit Button for Editable Cards */}
        {isEditable && (
          <div className="absolute top-3 left-3 z-10">
            <Link
              to="/manage-products"
              className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-lg hover:bg-white transition-colors shadow-lg flex items-center gap-1"
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
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            View Details
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5">
        <div className="mb-4">
          <Link 
            to={`/products/${product._id}`}
            className="group-hover:text-indigo-600 transition-colors"
          >
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description?.substring(0, 120) + '...'}
          </p>
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {product.industry && (
              <span className="text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                {product.industry}
              </span>
            )}
            {product.pricing && product.pricing !== 'Free' && (
              <span className="text-gray-500 text-xs">
                • {product.pricing}
              </span>
            )}
          </div>
          {product.price ? (
            <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              ${product.price}
            </span>
          ) : product.pricing === 'Free' && (
            <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              Free
            </span>
          )}
        </div>

        {/* Image Count Badge */}
        {displayImages.length > 1 && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              {displayImages.length} image{displayImages.length !== 1 ? 's' : ''}
            </span>
            {displayImages.some(img => img.caption) && (
              <span className="text-indigo-600">
                Has captions
              </span>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {showDetails && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Link
                to={`/products/${product._id}`}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                View Details
                <FiExternalLink className="w-4 h-4" />
              </Link>
              
              {isEditable && (
                <Link
                  to="/manage-products"
                  className="text-gray-500 hover:text-indigo-600 text-sm flex items-center gap-1 transition-colors"
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
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
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