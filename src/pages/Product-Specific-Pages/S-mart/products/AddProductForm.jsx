import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiPlus, FiEdit2 } from 'react-icons/fi';

const AddProductForm = ({ onSuccess, isEdit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    pricing: 'Free',
    website: '',
    demoUrl: '',
    featuredImage: ''
  });

  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [baseUrl] = useState(import.meta.env.VITE_API_BASE_URL);

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
    
    try {
      const token = localStorage.getItem('token');
      const method = isEdit ? 'put' : 'post';
      const url = isEdit 
        ? `${baseUrl}/api/smart/products/${initialData._id}`
        : `${baseUrl}/api/smart/products`;

      // Clean data before sending (remove empty strings)
      const cleanedData = {
        ...formData,
        website: formData.website || undefined,
        demoUrl: formData.demoUrl || undefined,
        tags: formData.tags.filter(tag => tag.trim() !== '')
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

      // Handle both response formats (single product or wrapped response)
      const product = response.data.product || response.data;
      if (!product) {
        throw new Error('Invalid response format');
      }

      onSuccess(product);
    } catch (error) {
      console.error('Product submission error:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      setError(error.response?.data?.error || error.message || 'Failed to save product');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="My Awesome Product"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description*</label>
          <input
            type="text"
            name="shortDescription"
            required
            maxLength={160}
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description (max 160 characters)"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.shortDescription.length}/160 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description*</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Detailed description of your product"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model*</label>
          <select
            name="pricing"
            value={formData.pricing}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
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
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="yourproduct.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
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
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="demo.yourproduct.com"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            onClick={() => onSuccess(null)} // Cancel
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;