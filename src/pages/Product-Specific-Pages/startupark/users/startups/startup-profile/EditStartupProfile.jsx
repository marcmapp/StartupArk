import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiUpload, FiX, FiPlus, FiMinus, FiExternalLink } from 'react-icons/fi';

const EditStartupProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startupName: '',
    tagline: '',
    description: '',
    bio: '',
    mission: '',
    vision: '',
    problemStatement: '',
    uniqueProposition: '',
    technologyStack: [],
    industry: '',
    website: '',
    foundedYear: '',
    teamSize: '',
    businessModel: '',
    fundingStage: '',
    location: '',
    phone: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    logo: null,
    pitchDeck: null,
    gallery: [],
    team: []
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const logoInputRef = useRef();
  const galleryInputRef = useRef();
  const pitchDeckInputRef = useRef();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Image URL helper with error handling
  const getImageUrl = (key) => {
    if (!key) return null;
    if (key.startsWith('http')) return key;
    if (key.startsWith('blob:')) return key;
    return `${baseUrl}/startupark/api/s3/file/${encodeURIComponent(key)}`;
  };

  // Data processor with error handling
  const processStartupData = (data) => {
    if (!data) return null;
    
    return {
      ...data,
      logo: getImageUrl(data.logo),
      gallery: data.gallery?.map(item => ({
        ...item,
        url: getImageUrl(item.url)
      })) || [],
      team: data.team?.map(member => ({
        ...member,
        avatar: getImageUrl(member.avatar)
      })) || [],
      pitchDeck: getImageUrl(data.pitchDeck)
    };
  };

  // File validation
  const validateFile = (file, options = {}) => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;
    
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize/1024/1024}MB limit`);
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    return true;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/startupark/api/startupark/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.length > 0) {
          const startupForm = response.data.find(form => form.role === 'startup');
          if (startupForm) {
            setFormData(processStartupData(startupForm.formData));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [baseUrl]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up logo blob URL
      if (formData.logo && isBlobUrl(formData.logo)) {
        URL.revokeObjectURL(formData.logo);
      }
      
      // Clean up gallery blob URLs
      formData.gallery.forEach(item => {
        if (item.url && isBlobUrl(item.url)) {
          URL.revokeObjectURL(item.url);
        }
      });
      
      // Clean up team avatar blob URLs
      formData.team.forEach(member => {
        if (member.avatar && isBlobUrl(member.avatar)) {
          URL.revokeObjectURL(member.avatar);
        }
      });
    };
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  // Get signed URL from backend
  const getSignedUrl = async (file, category) => {
    const token = localStorage.getItem('token');
    const filename = file.name;
    const filetype = file.type;

    try {
      const response = await axios.get(`${baseUrl}/startupark/api/s3/upload-url`, {
        params: { filename, filetype, filecategory: category },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  };

  // Upload file to S3
  const uploadFileToS3 = async (file, signedUrl) => {
    try {
      const options = {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      await axios.put(signedUrl, file, options);
      return signedUrl.split('?')[0]; // Return the S3 key without query params
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  };

// Enhanced deleteFileFromS3 function
const deleteFileFromS3 = async (key) => {
  if (!key || key.startsWith('http') || key.startsWith('blob:')) return false;

  try {
    const token = localStorage.getItem('token');
    console.log('Attempting to delete file:', key);
    const response = await axios.post(
      `${baseUrl}/startupark/api/s3/delete-file`,
      { key },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Delete response:', response.data);
    if (response.data.success) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', {
      key,
      error: error.response?.data || error.message
    });
    return false;
  }
};

  const isBlobUrl = (url) => {
    return url && typeof url === 'string' && url.startsWith('blob:');
  };

  // Logo upload handler
const handleLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    validateFile(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadError(null);

    // Store the old logo key before uploading new one
    const oldLogoKey = formData.logo && !isBlobUrl(formData.logo) ? formData.logo : null;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Get signed URL and upload
    const { url, key } = await getSignedUrl(file, 'logo');
    await uploadFileToS3(file, url);

    // Update form data with new key
    setFormData(prev => ({ ...prev, logo: key }));

    // Delete old file after successful upload
    if (oldLogoKey) {
      try {
        await deleteFileFromS3(oldLogoKey);
        console.log('Old logo deleted successfully:', oldLogoKey);
      } catch (deleteError) {
        console.error('Error deleting old logo:', deleteError);
      }
    }
  } catch (error) {
    console.error('Logo upload failed:', error);
    setUploadError(error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  // Pitch deck upload handler
  const handlePitchDeckUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
      });

      setIsSubmitting(true);
      setUploadProgress(0);
      setUploadError(null);

      // Get signed URL and upload
      const { url, key } = await getSignedUrl(file, 'pitchdeck');
      await uploadFileToS3(file, url);

      // Clean up old file if it exists
      const oldPitchDeck = formData.pitchDeck;
      if (oldPitchDeck && !isBlobUrl(oldPitchDeck)) {
        await deleteFileFromS3(oldPitchDeck);
      }

      setFormData(prev => ({ ...prev, pitchDeck: key }));
    } catch (error) {
      console.error('Pitch deck upload failed:', error);
      setUploadError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gallery upload handler
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setIsSubmitting(true);
      setUploadError(null);
      const newGalleryItems = [];

      for (const file of files) {
        try {
          validateFile(file, {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
          });

          setUploadProgress(0);
          const { url, key } = await getSignedUrl(file, 'gallery');
          await uploadFileToS3(file, url);

          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          newGalleryItems.push({
            url: key,
            caption: '',
            previewUrl
          });
        } catch (error) {
          console.error(`Failed to upload gallery image ${file.name}:`, error);
          continue; // Skip to next file if one fails
        }
      }

      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newGalleryItems]
      }));
    } catch (error) {
      console.error('Gallery upload failed:', error);
      setUploadError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Team avatar upload handler
 // Team avatar upload handler - Update the try-catch block
const handleTeamAvatarUpload = async (e, index) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // Clear previous errors
    setUploadError(null);
    
    // Validate file size before anything else
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 2MB limit. Please choose a smaller image.`);
    }

    validateFile(file, {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    setIsSubmitting(true);
    setUploadProgress(0);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Get signed URL and upload
    const { url, key } = await getSignedUrl(file, 'team');
    await uploadFileToS3(file, url);

    // Clean up old file if it exists
    const oldAvatar = formData.team[index]?.avatar;
    if (oldAvatar && !isBlobUrl(oldAvatar)) {
      try {
        await deleteFileFromS3(oldAvatar);
      } catch (deleteError) {
        console.warn('Failed to delete old avatar:', deleteError);
      }
    }

    // Update team member avatar
    setFormData(prev => {
      const updatedTeam = [...prev.team];
      updatedTeam[index] = {
        ...updatedTeam[index],
        avatar: key,
        previewUrl
      };
      return { ...prev, team: updatedTeam };
    });
    
    // Clear success state
    setUploadError(null);
    
  } catch (error) {
    console.error('Team avatar upload failed:', error);
    setUploadError(error.message || 'Failed to upload team avatar');
    
    // Clear the file input so user can try again
    e.target.value = null;
  } finally {
    setIsSubmitting(false);
  }
};
// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
  // Gallery management functions
  const updateGalleryCaption = (index, caption) => {
    setFormData(prev => {
      const updatedGallery = [...prev.gallery];
      updatedGallery[index] = {
        ...updatedGallery[index],
        caption
      };
      return { ...prev, gallery: updatedGallery };
    });
  };

  const removeGalleryImage = async (index) => {
    const imageToRemove = formData.gallery[index];
    
    try {
      setIsSubmitting(true);
      
      // Delete from S3 if not a blob URL
      if (imageToRemove.url && !isBlobUrl(imageToRemove.url)) {
        await deleteFileFromS3(imageToRemove.url);
      }
      
      // Remove from state
      setFormData(prev => {
        const updatedGallery = [...prev.gallery];
        updatedGallery.splice(index, 1);
        return { ...prev, gallery: updatedGallery };
      });
    } catch (error) {
      console.error('Error removing gallery image:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Team management functions
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, { name: '', position: '', bio: '', avatar: null }]
    }));
  };

  const updateTeamMember = (index, field, value) => {
    setFormData(prev => {
      const updatedTeam = [...prev.team];
      updatedTeam[index] = {
        ...updatedTeam[index],
        [field]: value
      };
      return { ...prev, team: updatedTeam };
    });
  };

  const removeTeamMember = async (index) => {
    const memberToRemove = formData.team[index];
    
    try {
      setIsSubmitting(true);
      
      // Delete avatar from S3 if it exists
      if (memberToRemove.avatar && !isBlobUrl(memberToRemove.avatar)) {
        await deleteFileFromS3(memberToRemove.avatar);
      }
      
      // Remove from state
      setFormData(prev => {
        const updatedTeam = [...prev.team];
        updatedTeam.splice(index, 1);
        return { ...prev, team: updatedTeam };
      });
    } catch (error) {
      console.error('Error removing team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const token = localStorage.getItem('token');
    
    // Get current files from form data
    const currentFiles = {
      logo: formData.logo,
      pitchDeck: formData.pitchDeck,
      gallery: formData.gallery.map(item => item.url),
      team: formData.team.map(member => member.avatar)
    };

    // Prepare the form data for submission
    const submissionData = {
      ...formData,
      gallery: formData.gallery.map(item => ({
        url: isBlobUrl(item.url) ? null : item.url,
        caption: item.caption
      })),
      team: formData.team.map(member => ({
        ...member,
        avatar: isBlobUrl(member.avatar) ? null : member.avatar
      }))
    };

    // Submit the form data
    const response = await axios.post(
      `${baseUrl}/startupark/api/startupark/form/startup`,
      { formData: submissionData },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // If successful, clean up any blob URLs (temporary files)
    if (response.data.success) {
      // Clean up logo if it was a blob URL
      if (formData.logo && isBlobUrl(formData.logo)) {
        URL.revokeObjectURL(formData.logo);
      }

      // Clean up gallery images
      formData.gallery.forEach(item => {
        if (item.url && isBlobUrl(item.url)) {
          URL.revokeObjectURL(item.url);
        }
      });

      // Clean up team avatars
      formData.team.forEach(member => {
        if (member.avatar && isBlobUrl(member.avatar)) {
          URL.revokeObjectURL(member.avatar);
        }
      });
    }

    navigate('/dashboard');
  } catch (error) {
    console.error('Error saving profile:', error);
    setUploadError('Failed to save profile. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Image component with fallback
  const ImageWithFallback = ({ src, alt, className, fallbackSrc }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
      setImgSrc(src);
    }, [src]);

    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Startup Profile</h1>
      
      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">Startup Logo*</label>
          <div className="flex items-center space-x-4">
            {formData.logo ? (
              <div className="relative">
                <ImageWithFallback
                  src={isBlobUrl(formData.logo) ? formData.logo : getImageUrl(formData.logo)}
                  alt="Startup logo"
                  className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                  fallbackSrc="/default-startup-logo.png"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      await deleteFileFromS3(formData.logo);
                      setFormData(prev => ({ ...prev, logo: null }));
                    } catch (error) {
                      console.error('Error removing logo:', error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <FiUpload className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                disabled={isSubmitting}
              >
                {formData.logo ? 'Change Logo' : 'Upload Logo'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Recommended size: 500x500px (max 5MB)</p>
            </div>
          </div>
          {isSubmitting && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Startup Name*</label>
            <input
              type="text"
              name="startupName"
              required
              value={formData.startupName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Tagline*</label>
            <input
              type="text"
              name="tagline"
              required
              value={formData.tagline}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* About Sections */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Description*</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Bio*</label>
            <textarea
              name="bio"
              required
              value={formData.bio}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mission</label>
            <textarea
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Vision</label>
            <textarea
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
        </div>

        {/* Solution Details */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Solution Details</h3>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Problem Statement</label>
            <textarea
              name="problemStatement"
              value={formData.problemStatement}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Unique Proposition</label>
            <textarea
              name="uniqueProposition"
              value={formData.uniqueProposition}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Technology Stack (comma separated)</label>
            <input
              type="text"
              name="technologyStack"
              value={formData.technologyStack.join(', ')}
              onChange={handleArrayChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologyStack.map((tech, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Industry*</label>
            <input
              type="text"
              name="industry"
              required
              value={formData.industry}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Business Model</label>
            <input
              type="text"
              name="businessModel"
              value={formData.businessModel}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Founded Year</label>
            <input
              type="number"
              name="foundedYear"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.foundedYear}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Team Size</label>
            <select
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="200+">200+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Funding Stage</label>
            <select
              name="fundingStage"
              value={formData.fundingStage}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select</option>
              <option value="Bootstrapped">Bootstrapped</option>
              <option value="Pre-seed">Pre-seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B+">Series B+</option>
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://linkedin.com/company/your-startup"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Twitter</label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://twitter.com/your-startup"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Facebook</label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://facebook.com/your-startup"
            />
          </div>
        </div>

        {/* Pitch Deck */}
        <div>
          <label className="block text-sm font-semibold mb-2">Pitch Deck</label>
          <div className="flex items-center space-x-4">
            {formData.pitchDeck ? (
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm">Pitch Deck Uploaded</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      await deleteFileFromS3(formData.pitchDeck);
                      setFormData(prev => ({ ...prev, pitchDeck: null }));
                    } catch (error) {
                      console.error('Error removing pitch deck:', error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="ml-4 text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-gray-500">No file selected</span>
              </div>
            )}
            <div>
              <input
                type="file"
                ref={pitchDeckInputRef}
                onChange={handlePitchDeckUpload}
                accept=".pdf,.ppt,.pptx"
                className="hidden"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => pitchDeckInputRef.current.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                disabled={isSubmitting}
              >
                {formData.pitchDeck ? 'Change File' : 'Upload Pitch Deck'}
              </button>
              <p className="text-xs text-gray-500 mt-1">PDF or PowerPoint (max 10MB)</p>
            </div>
          </div>
          {isSubmitting && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Gallery */}
        <div>
          <label className="block text-sm font-semibold mb-2">Gallery Images</label>
          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleGalleryUpload}
            accept="image/*"
            multiple
            className="hidden"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => galleryInputRef.current.click()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mb-4"
            disabled={isSubmitting}
          >
            Add Images
          </button>
          <p className="text-xs text-gray-500 mb-4">Upload product screenshots, team photos, etc. (max 5MB each)</p>

          {formData.gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.gallery.map((image, index) => (
                <div key={index} className="relative group">
                  <ImageWithFallback
                    src={isBlobUrl(image.url) ? image.url : getImageUrl(image.url)}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    fallbackSrc="/default-gallery-image.png"
                  />
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateGalleryCaption(index, e.target.value)}
                    placeholder="Add caption"
                    className="w-full mt-1 text-xs border border-gray-300 rounded px-2 py-1 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isSubmitting}
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold">Team Members</label>
            <button
              type="button"
              onClick={addTeamMember}
              className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              <FiPlus className="inline mr-1" /> Add Team Member
            </button>
          </div>

          {formData.team.length === 0 ? (
            <p className="text-sm text-gray-500">No team members added yet</p>
          ) : (
            <div className="space-y-4">
              {formData.team.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Team Members Section - Update the file upload part */}
<div className="flex items-center space-x-3 md:col-span-1">
  {member.avatar ? (
    <img 
      src={isBlobUrl(member.avatar) ? member.avatar : getImageUrl(member.avatar)}
      alt={`${member.name}'s avatar`}
      className="h-12 w-12 rounded-full object-cover"
      onError={(e) => {
        e.target.src = '/default-avatar.png';
        e.target.onerror = null;
      }}
    />
  ) : (
    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
      <span className="text-lg font-medium text-gray-400">
        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
      </span>
    </div>
  )}
  <div className="flex flex-col">
    <input
      type="file"
      id={`team-avatar-${index}`}
      onChange={(e) => handleTeamAvatarUpload(e, index)}
      accept="image/jpeg,image/png,image/webp"
      className="hidden bg-transparent"
    />
  <button
  type="button"
  onClick={() => {
    // Show a confirmation dialog for large files
    const acceptLarge = window.confirm(
      'Team avatar image requirements:\n' +
      '• Max file size: 2MB\n' +
      '• Allowed formats: JPEG, PNG, WebP\n' +
      '• Recommended size: 200x200px\n\n' +
      'Click OK to select a file.'
    );
    if (acceptLarge) {
      document.getElementById(`team-avatar-${index}`).click();
    }
  }}
  className="text-xs text-indigo-600 hover:text-indigo-800"
  disabled={isSubmitting}
>
  {member.avatar ? 'Change' : 'Add Photo'}
</button>
    <span className="text-xs text-gray-500 mt-1">Max 2MB</span>
  </div>
</div>
                    <div className="md:col-span-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm bg-transparent"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Position</label>
                          <input
                            type="text"
                            value={member.position}
                            onChange={(e) => updateTeamMember(index, 'position', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm bg-transparent"
                            placeholder="Role/Title"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Bio</label>
                        <textarea
                          value={member.bio}
                          onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-1 text-sm h-16"
                          placeholder="Brief background"
                        ></textarea>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          <FiMinus className="inline mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStartupProfile;