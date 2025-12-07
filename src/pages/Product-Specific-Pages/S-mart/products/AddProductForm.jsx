import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiX, FiPlus, FiEdit2, FiUpload, FiImage, FiStar } from 'react-icons/fi';

const AddProductForm = ({ onSuccess, isEdit, initialData, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    pricing: 'Free',
    website: '',
    demoUrl: '',
    images: []
  });

  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Helper function to get image URL
  const getImageUrl = (key) => {
    if (!key) return '/default-product.png';
    if (key.startsWith('http')) return key;
    return `${baseUrl}/smart/api/smart/file/${encodeURIComponent(key)}`;
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

  // Image upload handler
  const handleImageUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    const token = localStorage.getItem('token');
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          validateImageFile(file);
        } catch (validationError) {
          setError(validationError.message);
          continue;
        }

        // Generate upload URL
        const uploadResponse = await axios.get(`${baseUrl}/smart/api/smart/upload-url`, {
          params: {
            filename: file.name,
            filetype: file.type,
            filecategory: 'product'
          },
          headers: { Authorization: `Bearer ${token}` }
        });

        const { url, key } = uploadResponse.data;

        // Upload to S3
        await axios.put(url, file, {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        // Add to form data
        const newImage = {
          url: key,
          type: 'image',
          caption: '',
          isFeatured: formData.images.length === 0 && i === 0, // First image is featured
          order: formData.images.length + i
        };

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError(`Failed to upload images: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleImageUpload(files);
    }
    e.target.value = ''; // Reset input
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setFeaturedImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isFeatured: i === index
      }))
    }));
  };

  const updateImageCaption = (index, caption) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, caption } : img
      )
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

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
    
    if (formData.images.length === 0) {
      setError('At least one product image is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const method = isEdit ? 'put' : 'post';
      const url = isEdit 
        ? `${baseUrl}/smart/api/products/${initialData._id}`
        : `${baseUrl}/smart/api/products`;

      const cleanedData = {
        ...formData,
        website: formData.website || undefined,
        demoUrl: formData.demoUrl || undefined,
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        featuredImage: formData.images.find(img => img.isFeatured)?.url || formData.images[0]?.url
      };

      const response = await axios({
        method,
        url,
        data: cleanedData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      onSuccess(response.data);
    } catch (error) {
      console.error('Product submission error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to save product');
    }
  };

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
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black  mb-1">Product Name*</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="My Awesome Product"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black  mb-1">Category*</label>
            <input
              type="text"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., SaaS, Mobile App"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black  mb-1">Short Description*</label>
          <input
            type="text"
            name="shortDescription"
            required
            maxLength={160}
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description (max 160 characters)"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.shortDescription.length}/160 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black  mb-1">Full Description*</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Detailed description of your product"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium  mb-3">
            Product Images *
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
                <span>Uploading images...</span>
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
          {formData.images.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium ">
                Uploaded Images ({formData.images.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={getImageUrl(image.url)}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.src = '/default-product.png';
                        e.target.onerror = null;
                      }}
                    />
                    
                    {/* Featured Badge */}
                    {image.isFeatured && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                        <FiStar className="w-3 h-3 mr-1" />
                        Featured
                      </div>
                    )}
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setFeaturedImage(index)}
                        disabled={image.isFeatured}
                        className="bg-white  p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={image.isFeatured ? 'Currently featured' : 'Set as featured'}
                      >
                        <FiStar className={`w-4 h-4 ${image.isFeatured ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                        title="Remove image"
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
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black  mb-1">Pricing Model*</label>
          <select
            name="pricing"
            value={formData.pricing}
            onChange={handleChange}
            className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="Free">Free</option>
            <option value="Freemium">Freemium</option>
            <option value="Paid">Paid</option>
            <option value="Contact Us">Contact Us</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black  mb-1">Website</label>
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
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black  mb-1">Demo URL</label>
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
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black  mb-1">Tags</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              className="flex-1 border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add tag and press Enter"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600 focus:outline-none"
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
            className="px-4 py-2 border border-gray-300 text-black rounded-md shadow-sm text-sm font-medium  bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || formData.images.length === 0}
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