import React from 'react';
import PropTypes from 'prop-types';
import { Lightbox } from 'react-modal-image';

const Gallery = ({ images }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative aspect-square">
          <img
            src={image.url}
            alt={image.caption || `Gallery image ${index + 1}`}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/default-gallery-image.png';
            }}
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

Gallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      thumbnail: PropTypes.string,
      caption: PropTypes.string,
    })
  ),
};

export default Gallery;