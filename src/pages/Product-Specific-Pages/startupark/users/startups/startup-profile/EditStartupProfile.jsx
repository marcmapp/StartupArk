import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiUpload, FiX, FiPlus, FiMinus, FiExternalLink, FiNavigation } from 'react-icons/fi';

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
    locationCity: '',
    locationState: '',
    _gpsCoords: null,
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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  
  // NEW: State for files to upload
const [filesToUpload, setFilesToUpload] = useState({
  logo: null,
  gallery: {},       // <-- keyed by gallery index: { 0: File, 2: File, ... }
  pitchDeck: null,
  teamAvatars: {}
});

  const logoInputRef = useRef();
  const galleryInputRef = useRef();
  const pitchDeckInputRef = useRef();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Helper function to check if URL is a blob URL
  const isBlobUrl = (url) => {
    return url && typeof url === 'string' && url.startsWith('blob:');
  };

  // Image URL helper → serve public files directly from the R2 CDN (the old
  // /startupark/api/s3/file proxy path no longer resolves, which broke previews).
  const R2_PUBLIC_BASE = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';
  const getImageUrl = (key) => {
    if (!key) return null;
    if (key.startsWith('http') || key.startsWith('blob:')) return key;
    if (key.startsWith('/startupark/api/s3/file/')) {
      return `${R2_PUBLIC_BASE}/${decodeURIComponent(key.replace('/startupark/api/s3/file/', ''))}`;
    }
    return `${R2_PUBLIC_BASE}/${key}`;
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
        profilePhoto: getImageUrl(member.profilePhoto)
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
        const response = await axios.get(`${baseUrl}/startupark/api/profile/startup`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.profile) {
          const profile = response.data.profile;
          const processed = processStartupData({ ...profile, startupName: profile.companyName || profile.startupName });
          setFormData({
            ...processed,
            location: '',
            locationCity: profile.location?.city || '',
            locationState: profile.location?.state || '',
            _gpsCoords: null,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [baseUrl]);
useEffect(() => {
  // Capture current blob URLs at mount time for cleanup on unmount only
  return () => {
    // We use a ref snapshot to avoid premature revocation
    // Blob cleanup is handled explicitly in handleSubmit after success
  };
}, []); // empty deps — runs cleanup only on unmount


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

  const handleGPSCapture = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, _gpsCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // UPDATED: Logo upload handler - simplified for single request
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Client-side validation
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size should be less than 5MB');
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Store file for later upload
      setFilesToUpload(prev => ({ ...prev, logo: file }));
      
      // Update preview
      setFormData(prev => ({ ...prev, logo: previewUrl }));
      
    } catch (error) {
      setUploadError(error.message);
      e.target.value = ''; // Reset file input
    }
  };

  // UPDATED: Pitch deck upload handler - simplified for single request
  const handlePitchDeckUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size should be less than 10MB');
      }

      const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or PowerPoint file');
      }

      // Store file for upload
      setFilesToUpload(prev => ({ ...prev, pitchDeck: file }));
      setFormData(prev => ({ ...prev, pitchDeck: 'pending' }));
      
    } catch (error) {
      setUploadError(error.message);
      e.target.value = '';
    }
  };

  // UPDATED: Gallery upload handler - simplified for single request
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const newGalleryItems = [];
      
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5MB limit`);
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a supported image type`);
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newGalleryItems.push({
          url: previewUrl,
          caption: '',
          file: file // Store file reference
        });
      }

// REPLACE WITH:
setFilesToUpload(prev => {
  const updatedGallery = { ...prev.gallery };
  // New files start after existing formData.gallery length
  const startIndex = formData.gallery.length; // current length before setState
  newGalleryItems.forEach((item, i) => {
    updatedGallery[startIndex + i] = item.file;
  });
  return { ...prev, gallery: updatedGallery };
});

      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newGalleryItems]
      }));
      
    } catch (error) {
      setUploadError(error.message);
      e.target.value = '';
    }
  };

  // UPDATED: Team avatar upload handler - simplified for single request
  const handleTeamAvatarUpload = (e, index) => {
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

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error(`File ${file.name} is not a supported image type`);
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Store file for upload
      setFilesToUpload(prev => ({
        ...prev,
        teamAvatars: { ...prev.teamAvatars, [index]: file }
      }));

      // Update team member avatar preview
      updateTeamMember(index, 'profilePhoto', previewUrl);
      
      // Clear success state
      setUploadError(null);
      
    } catch (error) {
      console.error('Team avatar upload failed:', error);
      setUploadError(error.message || 'Failed to upload team avatar');
      
      // Clear the file input so user can try again
      e.target.value = null;
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

  // UPDATED: Remove gallery image function
  const removeGalleryImage = (index) => {
    setFormData(prev => {
      const updatedGallery = [...prev.gallery];
      
      // Revoke blob URL if it exists
      if (updatedGallery[index].url && isBlobUrl(updatedGallery[index].url)) {
        URL.revokeObjectURL(updatedGallery[index].url);
      }
      
      updatedGallery.splice(index, 1);
      return { ...prev, gallery: updatedGallery };
    });
    
    // REPLACE WITH:
setFilesToUpload(prev => {
  const updatedGallery = {};
  // Re-index remaining files after removal
  Object.entries(prev.gallery).forEach(([key, file]) => {
    const keyIndex = parseInt(key);
    if (keyIndex < index) {
      updatedGallery[keyIndex] = file;
    } else if (keyIndex > index) {
      updatedGallery[keyIndex - 1] = file; // shift down
    }
    // skip the removed index
  });
  return { ...prev, gallery: updatedGallery };
});

  };

  // Team management functions
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, { name: '', position: '', bio: '', profilePhoto: null }]
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

  // UPDATED: Remove team member function
  const removeTeamMember = (index) => {
    const memberToRemove = formData.team[index];
    
    // Revoke blob URL if it exists
    if (memberToRemove.profilePhoto && isBlobUrl(memberToRemove.profilePhoto)) {
      URL.revokeObjectURL(memberToRemove.profilePhoto);
    }
    
    // Remove from filesToUpload if exists
    setFilesToUpload(prev => {
      const updatedTeamAvatars = { ...prev.teamAvatars };
      delete updatedTeamAvatars[index];
      return { ...prev, teamAvatars: updatedTeamAvatars };
    });
    
    // Remove from state
    setFormData(prev => {
      const updatedTeam = [...prev.team];
      updatedTeam.splice(index, 1);
      return { ...prev, team: updatedTeam };
    });
  };

 // ── 2. REPLACE the entire handleSubmit function ───────────────────────────────
// This rewrites the upload flow to:
//   Step 1 — Upload each file to R2 via presigned PUT URL
//   Step 2 — Collect the R2 keys returned
//   Step 3 — Submit plain JSON with keys (no files in the request body)

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setUploadProgress(0);
  setUploadError(null);

  try {
    const token = localStorage.getItem('token');

    // ── Helper: upload one file to R2 via presigned URL ──────────────────────
    const uploadFileToR2 = async (file, category) => {
      // Step A: Get presigned PUT URL from backend
      const urlResponse = await axios.get(
        `${baseUrl}/startupark/api/s3/upload-url`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            filename: file.name,
            filetype: file.type,
            filecategory: category
          }
        }
      );

      if (!urlResponse.data.success) {
        throw new Error(`Failed to get upload URL for ${file.name}`);
      }

      const { url, key } = urlResponse.data;

      // Step B: PUT file directly to R2 (no auth header — presigned URL handles auth)
      await axios.put(url, file, {
        headers: { 'Content-Type': file.type },
        // Don't send Authorization header to R2
        transformRequest: [(data) => data],
      });

      return key; // R2 key to store in DB
    };

    // ── Upload all pending files ──────────────────────────────────────────────
    const totalFiles =
      (filesToUpload.logo ? 1 : 0) +
      (filesToUpload.pitchDeck ? 1 : 0) +
      filesToUpload.gallery.length +
      Object.keys(filesToUpload.teamAvatars).length;

    let uploadedCount = 0;
    const updateProgress = () => {
      uploadedCount++;
      if (totalFiles > 0) {
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 80)); // 80% for uploads
      }
    };

    // Upload logo
    let logoKey = formData.logo && !isBlobUrl(formData.logo) ? formData.logo : null;
    if (filesToUpload.logo) {
      logoKey = await uploadFileToR2(filesToUpload.logo, 'logo');
      updateProgress();
    }

    // Upload pitch deck
    let pitchDeckKey = formData.pitchDeck && !isBlobUrl(formData.pitchDeck) && formData.pitchDeck !== 'pending'
      ? formData.pitchDeck
      : null;
    if (filesToUpload.pitchDeck) {
      pitchDeckKey = await uploadFileToR2(filesToUpload.pitchDeck, 'pitchdeck');
      updateProgress();
    }
const galleryItemsRaw = await Promise.all(
  formData.gallery.map(async (item, index) => {
    if (filesToUpload.gallery[index]) {
      // This index has a new file to upload
      const key = await uploadFileToR2(filesToUpload.gallery[index], 'gallery');
      updateProgress();
      return { caption: item.caption, url: key };
    }
    // Existing item — keep R2 key as-is, strip blob URLs
    const url = item.url && !isBlobUrl(item.url) ? item.url : null;
    return { caption: item.caption, url };
  })
);
const galleryItems = galleryItemsRaw.filter(item => item.url !== null);
    // Upload team avatars
    const teamMembers = await Promise.all(
      formData.team.map(async (member, index) => {
        if (filesToUpload.teamAvatars[index]) {
          const key = await uploadFileToR2(filesToUpload.teamAvatars[index], 'team');
          updateProgress();
          return {
            name: member.name,
            position: member.position,
            bio: member.bio,
            profilePhoto: key
          };
        }
        return {
          name: member.name,
          position: member.position,
          bio: member.bio,
          profilePhoto: member.profilePhoto && !isBlobUrl(member.profilePhoto) ? member.profilePhoto : null
        };
      })
    );

    setUploadProgress(85);

    // ── Submit clean JSON with R2 keys ────────────────────────────────────────
    const submissionData = {
      ...formData,
      logo: logoKey,
      pitchDeck: pitchDeckKey,
      gallery: galleryItems,
      team: teamMembers,
    };

    // Remove any remaining blob URLs from other fields
    Object.keys(submissionData).forEach(key => {
      if (typeof submissionData[key] === 'string' && submissionData[key].startsWith('blob:')) {
        submissionData[key] = null;
      }
    });

    // Map startupName → companyName for backend model
    if (submissionData.startupName !== undefined) {
      submissionData.companyName = submissionData.startupName;
      delete submissionData.startupName;
    }

    // Drop any string location value (legacy field)
    if (typeof submissionData.location === 'string') {
      delete submissionData.location;
    }

    // Build structured location from form fields
    const locationCity = submissionData.locationCity?.trim();
    const locationState = submissionData.locationState?.trim();
    const gpsCoords = submissionData._gpsCoords;
    delete submissionData.locationCity;
    delete submissionData.locationState;
    delete submissionData._gpsCoords;

    if (locationCity || locationState || gpsCoords) {
      submissionData.location = {
        ...(locationCity ? { city: locationCity } : {}),
        ...(locationState ? { state: locationState } : {}),
        country: 'India',
        locationType: gpsCoords ? 'precise' : 'manual',
        ...(gpsCoords ? { coordinates: [gpsCoords.lng, gpsCoords.lat] } : {}),
      };
    }

    const response = await axios.put(
      `${baseUrl}/startupark/api/profile/startup`,
      submissionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    setUploadProgress(100);

    if (response.data.profile) {
      // Clean up all blob URLs after successful save
      if (formData.logo && isBlobUrl(formData.logo)) URL.revokeObjectURL(formData.logo);
      if (formData.pitchDeck && isBlobUrl(formData.pitchDeck)) URL.revokeObjectURL(formData.pitchDeck);
      formData.gallery.forEach(item => {
        if (item.url && isBlobUrl(item.url)) URL.revokeObjectURL(item.url);
      });
      formData.team.forEach(member => {
        if (member.profilePhoto && isBlobUrl(member.profilePhoto)) URL.revokeObjectURL(member.profilePhoto);
      });

      setFilesToUpload({ logo: null, gallery: {}, pitchDeck: null, teamAvatars: {} });
      navigate('/startupark/startup-profile');
    } else {
      throw new Error(response.data.error || 'Update failed');
    }

  } catch (error) {
    console.error('Error updating profile:', error);

    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.details && Array.isArray(errorData.details)) {
        setUploadError(`Validation Errors:\n${errorData.details.join('\n')}`);
      } else {
        setUploadError(`Validation Error: ${errorData.error || errorData.message}`);
      }
    } else if (error.message?.includes('upload URL')) {
      setUploadError('Failed to prepare file upload. Please try again.');
    } else {
      setUploadError(`Failed to update profile: ${error.response?.data?.error || error.message}`);
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black/10 dark:border-white/15"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Startup Profile</h1>
      
      {uploadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
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
                  className="h-20 w-20 rounded-lg object-cover border border-black/[0.06] dark:border-white/10"
                  fallbackSrc="/default-startup-logo.png"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isBlobUrl(formData.logo)) {
                      URL.revokeObjectURL(formData.logo);
                    }
                    setFormData(prev => ({ ...prev, logo: null }));
                    setFilesToUpload(prev => ({ ...prev, logo: null }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border-2 border-dashed border-black/10 dark:border-white/15 flex items-center justify-center">
                <FiUpload className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
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
                className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
                disabled={isSubmitting}
              >
                {formData.logo ? 'Change Logo' : 'Upload Logo'}
              </button>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Recommended size: 500x500px (max 5MB)</p>
              {filesToUpload.logo && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  ✓ Ready: {filesToUpload.logo.name}
                </p>
              )}
            </div>
          </div>
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
              className="input-mono"
              disabled={isSubmitting}
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
              className="input-mono"
              disabled={isSubmitting}
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
              className="input-mono h-32"
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Bio*</label>
            <textarea
              name="bio"
              required
              value={formData.bio}
              onChange={handleChange}
              className="input-mono h-32"
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mission</label>
            <textarea
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              className="input-mono h-24"
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Vision</label>
            <textarea
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              className="input-mono h-24"
              disabled={isSubmitting}
            ></textarea>
          </div>
        </div>

        {/* Solution Details */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Solution Details</h3>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Problem Statement</label>
            <textarea
              name="problemStatement"
              value={formData.problemStatement}
              onChange={handleChange}
              className="input-mono h-32"
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Unique Proposition</label>
            <textarea
              name="uniqueProposition"
              value={formData.uniqueProposition}
              onChange={handleChange}
              className="input-mono h-32"
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Technology Stack (comma separated)</label>
            <input
              type="text"
              name="technologyStack"
              value={formData.technologyStack.join(', ')}
              onChange={handleArrayChange}
              className="input-mono"
              disabled={isSubmitting}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologyStack.map((tech, index) => (
                <span key={index} className="bg-black/[0.04] dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-100 text-xs px-3 py-1 rounded-full">
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
              className="input-mono"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Business Model</label>
            <input
              type="text"
              name="businessModel"
              value={formData.businessModel}
              onChange={handleChange}
              className="input-mono"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                value={formData.locationCity}
                onChange={(e) => setFormData(prev => ({ ...prev, locationCity: e.target.value }))}
                className="input-mono"
                disabled={isSubmitting}
              />
              <input
                type="text"
                placeholder="State"
                value={formData.locationState}
                onChange={(e) => setFormData(prev => ({ ...prev, locationState: e.target.value }))}
                className="input-mono"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="button"
              onClick={handleGPSCapture}
              disabled={isSubmitting || gpsLoading}
              className="btn-ghost mt-2 w-full flex items-center justify-center gap-2 text-sm"
            >
              <FiNavigation className={gpsLoading ? 'animate-spin' : ''} />
              {gpsLoading
                ? 'Getting GPS…'
                : formData._gpsCoords
                  ? `GPS: ${formData._gpsCoords.lat.toFixed(4)}, ${formData._gpsCoords.lng.toFixed(4)}`
                  : 'Capture GPS Location'}
            </button>
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
              className="input-mono"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Team Size</label>
            <select
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              className="input-mono"
              disabled={isSubmitting}
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
              className="input-mono"
              disabled={isSubmitting}
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
              className="input-mono"
              placeholder="https://"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-mono"
              disabled={isSubmitting}
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
              className="input-mono"
              placeholder="https://linkedin.com/company/your-startup"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Twitter</label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="input-mono"
              placeholder="https://twitter.com/your-startup"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Facebook</label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="input-mono"
              placeholder="https://facebook.com/your-startup"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Pitch Deck */}
        <div>
          <label className="block text-sm font-semibold mb-2">Pitch Deck</label>
          <div className="flex items-center space-x-4">
            {formData.pitchDeck ? (
              <div className="flex items-center">
                <div className="bg-black/[0.04] dark:bg-white/[0.06] p-3 rounded-lg">
                  <svg className="h-10 w-10 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm">Pitch Deck Uploaded</span>
                <button
                  type="button"
                  onClick={() => {
                    if (isBlobUrl(formData.pitchDeck)) {
                      URL.revokeObjectURL(formData.pitchDeck);
                    }
                    setFormData(prev => ({ ...prev, pitchDeck: null }));
                    setFilesToUpload(prev => ({ ...prev, pitchDeck: null }));
                  }}
                  className="ml-4 text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="bg-black/[0.04] dark:bg-white/[0.06] p-3 rounded-lg">
                  <svg className="h-10 w-10 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">No file selected</span>
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
                className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
                disabled={isSubmitting}
              >
                {formData.pitchDeck ? 'Change File' : 'Upload Pitch Deck'}
              </button>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">PDF or PowerPoint (max 10MB)</p>
              {filesToUpload.pitchDeck && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  ✓ Ready: {filesToUpload.pitchDeck.name}
                </p>
              )}
            </div>
          </div>
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
            className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.1] mb-4"
            disabled={isSubmitting}
          >
            Add Images
          </button>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Upload product screenshots, team photos, etc. (max 5MB each)</p>
          {Object.keys(filesToUpload.gallery).length > 0 && (
  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">
    ✓ {Object.keys(filesToUpload.gallery).length} image(s) ready for upload
  </p>
)}

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
                    className="w-full mt-1 text-xs border border-black/10 dark:border-white/15 rounded px-2 py-1 bg-transparent"
                    disabled={isSubmitting}
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
              className="px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200"
              disabled={isSubmitting}
            >
              <FiPlus className="inline mr-1" /> Add Team Member
            </button>
          </div>

          {formData.team.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No team members added yet</p>
          ) : (
            <div className="space-y-4">
              {formData.team.map((member, index) => (
                <div key={index} className="border border-black/[0.06] dark:border-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3 md:col-span-1">
                      {member.profilePhoto ? (
                        <img
                          src={isBlobUrl(member.profilePhoto) ? member.profilePhoto : getImageUrl(member.profilePhoto)}
                          alt={`${member.name}'s avatar`}
                          className="h-12 w-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center">
                          <span className="text-lg font-medium text-zinc-400 dark:text-zinc-500">
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
                          className="text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-700 dark:text-zinc-300"
                          disabled={isSubmitting}
                        >
                          {member.profilePhoto ? 'Change' : 'Add Photo'}
                        </button>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Max 2MB</span>
                        {filesToUpload.teamAvatars[index] && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            ✓ Ready
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            className="w-full border border-black/10 dark:border-white/15 rounded px-3 py-1 text-sm bg-transparent"
                            placeholder="Full name"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Position</label>
                          <input
                            type="text"
                            value={member.position}
                            onChange={(e) => updateTeamMember(index, 'position', e.target.value)}
                            className="w-full border border-black/10 dark:border-white/15 rounded px-3 py-1 text-sm bg-transparent"
                            placeholder="Role/Title"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Bio</label>
                        <textarea
                          value={member.bio}
                          onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                          className="w-full border border-black/10 dark:border-white/15 rounded px-3 py-1 text-sm h-16"
                          placeholder="Brief background"
                          disabled={isSubmitting}
                        ></textarea>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="text-xs text-red-500 hover:text-red-700"
                          disabled={isSubmitting}
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

        {/* Upload Progress */}
        {isSubmitting && (
          <div className="mt-4 p-4 bg-black/[0.03] dark:bg-white/[0.04] rounded-lg border border-black/[0.06] dark:border-white/10">
            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Uploading profile data...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-black/[0.06] dark:bg-white/10 rounded-full h-2">
              <div
                className="bg-zinc-900 dark:bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStartupProfile;