import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiPlus, FiEdit2, FiUpload, FiImage, FiStar } from 'react-icons/fi';
import axios from 'axios'; // ADDED: Import axios

const AddProductForm = ({ onSuccess, isEdit, initialData, onCancel }) => {
  // Initialize formData with safe defaults
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      name: '',
      description: '',
      shortDescription: '',
      category: '',
      tags: [],
      pricing: 'Free',
      website: '',
      demoUrl: '',
      images: []
    };
    
    if (initialData) {
      // Process existing images
      const processedImages = (initialData.images || []).map(img => ({
        ...img,
        // If URL exists and is not a blob, keep it as is (S3 key)
        url: img.url && !img.url.startsWith('blob:') ? img.url : '',
        file: undefined, // No file for existing images
        isNew: false // Mark as existing
      }));
      
      return {
        ...defaultData,
        ...initialData,
        images: processedImages
      };
    }
    
    return defaultData;
  });

  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Helper function to get safe images array
  const getSafeImages = () => {
    return formData.images || [];
  };

  // UPDATED: Helper function to get image URL
  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http') || key.startsWith('blob:')) return key;
    
    // Check if it's already a full URL
    if (key.includes(baseUrl)) return key;
    
    // Assume it's an S3 key
    return `${baseUrl}/startupark/api/s3/file/${encodeURIComponent(key)}`;
  };

  // File validation
  const validateImageFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File ${file.name} is not a supported image type.`);
    }
    
    return true;
  };

  // Image upload handler - UPDATED
  const handleImageUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      console.log('Processing', files.length, 'files for upload');
      const uploadedImages = [];
      const currentImages = getSafeImages();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Client-side validation
          validateImageFile(file);
          
          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          
          // Add to form data as temporary object
          const newImage = {
            tempId: `temp-${Date.now()}-${i}`,
            url: previewUrl, // Temporary blob URL
            type: 'image',
            caption: '',
            isFeatured: currentImages.length === 0 && uploadedImages.length === 0,
            order: currentImages.length + uploadedImages.length,
            file: file, // Store the actual file
            isNew: true // Mark as new upload
          };

          uploadedImages.push(newImage);
          
        } catch (validationError) {
          setError(validationError.message);
          continue; // Skip to next file
        }
      }

      // Update form data with preview URLs
      if (uploadedImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedImages]
        }));
      }

    } catch (error) {
      console.error('Image processing error:', error);
      setError(`Failed to process images: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        await handleImageUpload(files);
      } catch (error) {
        console.error('File upload error:', error);
        setError(error.message || 'Failed to upload files');
      }
    }
    e.target.value = ''; // Reset input
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const setFeaturedImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map((img, i) => ({
        ...img,
        isFeatured: i === index
      }))
    }));
  };

  const updateImageCaption = (index, caption) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map((img, i) => 
        i === index ? { ...img, caption } : img
      )
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...(prev.tags || []), newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: (prev.tags || []).filter(t => t !== tag) 
    }));
  };

  // UPDATED handleSubmit for proper backend integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    
    if (!formData.shortDescription.trim()) {
      setError('Short description is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }
    
    const images = getSafeImages();
    
    // Validate we have at least one valid image
    const hasValidImage = images.some(img => {
      // Valid if it has a file (new upload) OR has a non-blob URL (existing S3 key)
      return img.file || (img.url && !img.url.startsWith('blob:'));
    });
    
    if (!hasValidImage) {
      setError('At least one product image is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const method = isEdit ? 'put' : 'post';
      const url = isEdit 
        ? `${baseUrl}/startupark/api/products/${initialData._id}`
        : `${baseUrl}/startupark/api/products`;

      // Create FormData for single request
      const formDataToSubmit = new FormData();
      
      // Prepare images for JSON
      const imagesForJson = images.map((img, index) => {
        if (img.file) {
          // New image - will be uploaded as file
          return {
            caption: img.caption || '',
            isFeatured: img.isFeatured || false,
            order: index
          };
        } else if (img.url && !img.url.startsWith('blob:')) {
          // Existing image with S3 key
          return {
            url: img.url,
            caption: img.caption || '',
            isFeatured: img.isFeatured || false,
            order: index
          };
        } else if (img.url && img.url.startsWith('blob:')) {
          // This shouldn't happen - blob URL without file
          console.warn('Image has blob URL but no file, skipping:', img);
          return null;
        }
        return null;
      }).filter(img => img !== null);
      
      // Prepare JSON data
      const jsonData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        tags: (formData.tags || []).filter(tag => tag.trim() !== ''),
        pricing: formData.pricing,
        website: formData.website?.trim() || undefined,
        demoUrl: formData.demoUrl?.trim() || undefined,
        images: imagesForJson
      };

      // Add JSON data
      formDataToSubmit.append('productData', JSON.stringify(jsonData));
      
      // Add image files (only new files that need upload)
      images.forEach((image) => {
        if (image.file) {
          formDataToSubmit.append('images', image.file); // Use 'images' as field name
        }
      });

      setIsUploading(true);
      setUploadProgress(0);

      const response = await axios({
        method,
        url,
        data: formDataToSubmit,
        headers: {
          Authorization: `Bearer ${token}`,
          // Let browser set Content-Type to multipart/form-data
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      });

      console.log('Product submission successful:', response.data);
      onSuccess(response.data);
      
    } catch (error) {
      console.error('Product submission error:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.details && Array.isArray(errorData.details)) {
          setError(`Validation Errors:\n${errorData.details.join('\n')}`);
        } else {
          setError(`Validation Error: ${errorData.error || errorData.message}`);
        }
      } else if (error.response?.status === 413) {
        setError('Files are too large. Maximum size per file is 10MB.');
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to save product');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Get safe images array
  const safeImages = getSafeImages();

  return (
    <div className="border-2 border-cyan-600 bg-gray-50 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Product Name<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="My Awesome Product"
              disabled={isUploading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Category<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., SaaS, Mobile App"
              disabled={isUploading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Short Description<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="shortDescription"
            required
            maxLength={160}
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description (max 160 characters)"
            disabled={isUploading}
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.shortDescription.length}/160 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Full Description<span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Detailed description of your product"
            disabled={isUploading}
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Product Images<span className="text-red-500 ml-1">*</span>
          </label>
          
          {/* Image Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 transition-colors hover:border-indigo-400">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isUploading}
            />
            <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiUpload className="inline w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Images'}
              </button>
              <p className="text-sm text-gray-500">
                Drag and drop images here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supports JPG, PNG, GIF, WEBP (Max 10MB each)
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading product data...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Image Gallery Preview */}
          {safeImages.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">
                Uploaded Images ({safeImages.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {safeImages.map((image, index) => (
                  <div key={image.tempId || image.url || index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={getImageUrl(image.url)}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.src = '/default-product.png';
                        e.target.onerror = null;
                      }}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {image.isFeatured && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                          <FiStar className="w-3 h-3 mr-1" />
                          Featured
                        </div>
                      )}
                      {image.file && (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          New
                        </div>
                      )}
                    </div>
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setFeaturedImage(index)}
                        disabled={image.isFeatured || isUploading}
                        className="bg-white p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={image.isFeatured ? 'Currently featured' : 'Set as featured'}
                      >
                        <FiStar className={`w-4 h-4 ${image.isFeatured ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                        title="Remove image"
                        disabled={isUploading}
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Caption Input */}
                    <div className="p-2 border-t border-gray-200">
                      <input
                        type="text"
                        value={image.caption || ''}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        placeholder="Add caption..."
                        className="w-full text-xs p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Pricing Model<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="pricing"
            value={formData.pricing}
            onChange={handleChange}
            className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            disabled={isUploading}
          >
            <option value="Free">Free</option>
            <option value="Freemium">Freemium</option>
            <option value="Paid">Paid</option>
            <option value="Contact Us">Contact Us</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Website</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                https://
              </span>
              <input
                type="text"
                name="website"
                value={formData.website?.replace('https://', '') || ''}
                onChange={(e) => handleChange({
                  target: {
                    name: 'website',
                    value: e.target.value ? `https://${e.target.value}` : ''
                  }
                })}
                className="flex-1 min-w-0 block w-full px-3 py-2 text-black rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="yourproduct.com"
                disabled={isUploading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Demo URL</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                https://
              </span>
              <input
                type="text"
                name="demoUrl"
                value={formData.demoUrl?.replace('https://', '') || ''}
                onChange={(e) => handleChange({
                  target: {
                    name: 'demoUrl',
                    value: e.target.value ? `https://${e.target.value}` : ''
                  }
                })}
                className="flex-1 min-w-0 block w-full px-3 py-2 text-black rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="demo.yourproduct.com"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Tags</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              className="flex-1 border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add tag and press Enter"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isUploading}
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.tags || []).map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600 focus:outline-none"
                  disabled={isUploading}
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-black rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || safeImages.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : (isEdit ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;