import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiZoomIn } from 'react-icons/fi';

const ProductImageCarousel = ({ 
  images, 
  productName, 
  className = '', 
  showThumbnails = true,
  enableZoom = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // UPDATED: Helper function to get image URL
  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http') || key.startsWith('blob:')) return key;
    
    // Check if it's already a full URL
    if (key.includes(baseUrl)) return key;
    
    // Assume it's an S3 key
    return `${baseUrl}/startupark/api/s3/file/${encodeURIComponent(key)}`;
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <img
          src="/default-product.png"
          alt={productName || 'Product image'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex];

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Image */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={getImageUrl(currentImage.url)}
            alt={currentImage.caption || `${productName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => enableZoom && setIsModalOpen(true)}
            onError={(e) => {
              e.target.src = '/default-product.png';
              e.target.onerror = null;
            }}
          />
          
          {/* Zoom Indicator */}
          {enableZoom && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <FiZoomIn className="w-4 h-4" />
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Image Caption */}
          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg max-w-xs">
              <p className="text-sm">{currentImage.caption}</p>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {showThumbnails && images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.url || index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex 
                    ? 'border-indigo-500 ring-2 ring-indigo-200 scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={getImageUrl(image.url)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-product.png';
                    e.target.onerror = null;
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Full-size View */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={getImageUrl(currentImage.url)}
                alt={currentImage.caption || productName}
                className="w-full max-h-96 object-contain"
              />
            </div>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-colors"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-colors"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            {currentImage.caption && (
              <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-70 px-4 py-3 rounded-lg max-w-md">
                <p className="text-lg font-medium">{currentImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageCarousel;