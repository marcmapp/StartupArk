import React from 'react';

const StartupGallery = ({ gallery = [] }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Gallery</h2>
      {gallery && gallery.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {gallery.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={image.url}
                alt={image.caption || `Gallery ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/default-gallery-image.png';
                  e.target.onerror = null;
                }}
              />
              {image.caption && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                  <p className="text-white text-xs sm:text-sm truncate w-full">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <p className="text-gray-600">No gallery images added yet.</p>
        </div>
      )}
    </div>
  );
};

export default StartupGallery;