import React from 'react';

const CommonFieldsForm = ({ 
  formData, 
  setFormData,
  setFilesToUpload,
  handleChange, 
  handleProfilePictureUpload,
  fileInputRef,
  filesToUpload,
  isUploading,
  uploadProgress,
  role 
}) => {
  const isBlobUrl = (url) => {
    return url && typeof url === 'string' && url.startsWith('blob:');
  };

  // Enhanced profile picture handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size should be less than 5MB');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Store file for upload
    const fileKey = role === 'startup' ? 'logo' : 'profilePicture';
    setFilesToUpload(prev => ({ ...prev, [fileKey]: file }));
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    if (role === 'startup') {
      setFormData(prev => ({ ...prev, logo: previewUrl }));
    } else {
      setFormData(prev => ({ ...prev, profilePicture: previewUrl }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture/Logo Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
        <label className="block text-sm font-semibold mb-4 text-gray-700">
          {role === 'startup' ? 'Startup Logo' : 'Profile Picture'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Image Preview */}
          <div className="relative">
            {(formData.logo || formData.profilePicture) ? (
              <div className="relative group">
                <img 
                  src={isBlobUrl(formData.logo || formData.profilePicture) 
                    ? (formData.logo || formData.profilePicture) 
                    : `${import.meta.env.VITE_API_BASE_URL}/startupark/api/s3/file/${formData.logo || formData.profilePicture}`}
                  alt={role === 'startup' ? "Startup logo" : "Profile"} 
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (role === 'startup') {
                      setFormData(prev => ({ ...prev, logo: null }));
                      setFilesToUpload(prev => ({ ...prev, logo: null }));
                    } else {
                      setFormData(prev => ({ ...prev, profilePicture: null }));
                      setFilesToUpload(prev => ({ ...prev, profilePicture: null }));
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-lg"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-dashed border-gray-300 flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 hover:border-indigo-700 transition-all duration-300 shadow-sm"
                  disabled={isUploading}
                >
                  <svg className="h-5 w-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {formData.logo || formData.profilePicture ? 'Change Image' : 'Upload Image'}
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>• Recommended size: 500x500px</p>
                <p>• Max file size: 5MB</p>
                <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                {filesToUpload.logo || filesToUpload.profilePicture ? (
                  <p className="text-green-600 font-medium">
                    ✓ File ready for upload: {(filesToUpload.logo || filesToUpload.profilePicture)?.name}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading form data...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {role === 'startup' ? 'Your Name' : 'Full Name'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400 text-black"
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Email Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400 text-black"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400 text-black"
            placeholder="+1 (123) 456-7890"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400 text-black"
            placeholder="City, Country"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {role === 'startup' ? 'Startup Bio' : 'Bio'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          name="bio"
          required
          value={formData.bio}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400 resize-none text-black"
          placeholder={`Tell us about ${role === 'startup' ? 'your startup' : 'yourself'}...`}
        ></textarea>
      </div>
    </div>
  );
};

export default CommonFieldsForm;