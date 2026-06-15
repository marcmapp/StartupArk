import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiNavigation } from 'react-icons/fi';
import CommonFieldsForm from '../users/user/CommonFieldsForm';
import StartupDetailsForm from '../users/startups/StartupDetailsForm';
import UserDetailsForm from '../users/user/UserDetailsForm';
import StudentDetailsForm from '../users/students/StudentForm';

const isBlobUrl = (url) => {
  return url && typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('http'));
};

function FormComponent({ role, onSubmit, editMode = false, onCancel }) {
  // State and refs
  const [formData, setFormData] = useState(() => initializeFormData(role));
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const pitchDeckInputRef = useRef(null);

  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [gpsLoading, setGpsLoading] = useState(false);

  const [filesToUpload, setFilesToUpload] = useState({
    logo: null,
    gallery: [],
    pitchDeck: null,
    teamAvatars: {},
    profilePicture: null,
    resume: null
  });

  // Fetch user data from signup and autofill — and, in edit mode, preload the
  // existing role profile so the user can update it.
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await axios.get(`${baseUrl}/api/mappuser/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = res.data;

        let existing = null;
        if (editMode) {
          try {
            const pRes = await axios.get(`${baseUrl}/startupark/api/profile/${role}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            existing = pRes.data?.profile || null;
          } catch (e) {
            console.warn('No existing profile to edit:', e?.response?.status);
          }
        }

        setFormData(prev => ({
          ...prev,
          ...(existing || {}),
          name: existing?.name || userData.username || userData.name || '',
          email: existing?.email || userData.email || '',
          phone: existing?.phone || userData.whatsappNumber || '',
          // Profile picture lives on the main user model; preload it in edit mode
          // so the existing image shows (startup uses `logo` from its own profile).
          ...(editMode && role !== 'startup'
            ? { profilePicture: existing?.profilePicture || userData.profilePicture || prev.profilePicture }
            : {}),
          // Preload location city/state for startup edit mode
          ...(editMode && role === 'startup' && existing?.location
            ? { locationCity: existing.location.city || '', locationState: existing.location.state || '' }
            : {}),
        }));
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [token, baseUrl, role, editMode]);

  // Initialize form data based on role
  function initializeFormData(role) {
    const baseFields = {
      name: '',
      email: '',
      phone: '',
      bio: '',
      location: ''
    };

    switch (role) {
      case 'startup':
        return {
          ...baseFields,
          startupName: '',
          tagline: '',
          description: '',
          industry: '',
          website: '',
          foundedYear: '',
          teamSize: '',
          businessModel: '',
          fundingStage: '',
          logo: null,
          gallery: [],
          team: [],
          mission: '',
          vision: '',
          problemStatement: '',
          uniqueProposition: '',
          technologyStack: [],
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: '',
          pitchDeck: null,
          locationCity: '',
          locationState: '',
          _gpsCoords: null
        };
        
      case 'student':
        return {
          ...baseFields,
          institution: '',
          course: '',
          yearOfStudy: '',
          graduationYear: '',
          skills: [],
          interests: [],
          portfolioUrl: '',
          github: '',
          linkedin: '',
          resume: null,
          gpa: '',
          achievements: ''
        };
        
      case 'user':
        return {
          ...baseFields,
          profession: '',
          skills: [],
          expertise: [],
          experience: '',
          education: '',
          linkedin: '',
          twitter: '',
          profilePicture: null
        };
        
      default:
        return baseFields;
    }
  }

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (isBlobUrl(formData.logo)) URL.revokeObjectURL(formData.logo);
      if (isBlobUrl(formData.profilePicture)) URL.revokeObjectURL(formData.profilePicture);
      
      formData.gallery?.forEach(item => {
        if (isBlobUrl(item.url)) URL.revokeObjectURL(item.url);
      });

      formData.team?.forEach(member => {
        if (isBlobUrl(member.profilePhoto)) URL.revokeObjectURL(member.profilePhoto);
      });
    };
  }, [formData]);

  // Common handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [name]: items }));
  };

  // Profile picture handler (for user/student)
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setFilesToUpload(prev => ({ ...prev, profilePicture: file }));
    setFormData(prev => ({ ...prev, profilePicture: URL.createObjectURL(file) }));
  };

  // Logo handler (for startup)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    setFilesToUpload(prev => ({ ...prev, logo: file }));
    setFormData(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
  };

  // Gallery handlers (for startup)
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Client-side validation for each file
    const validFiles = [];
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit`);
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} is not a valid image type`);
        return;
      }
      
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Store files for upload
    setFilesToUpload(prev => ({ 
      ...prev, 
      gallery: [...prev.gallery, ...validFiles] 
    }));
    
    // Create preview URLs
    const newGalleryItems = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      caption: '',
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...newGalleryItems]
    }));
  };

  const updateGalleryCaption = (index, caption) => {
    setFormData(prev => {
      const updatedGallery = [...prev.gallery];
      updatedGallery[index] = { ...updatedGallery[index], caption };
      return { ...prev, gallery: updatedGallery };
    });
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => {
      const updatedGallery = [...prev.gallery];
      
      // Revoke blob URL if it exists
      if (updatedGallery[index].url && updatedGallery[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(updatedGallery[index].url);
      }
      
      updatedGallery.splice(index, 1);
      return { ...prev, gallery: updatedGallery };
    });
    
    // Also remove from filesToUpload
    setFilesToUpload(prev => {
      const updatedGallery = [...prev.gallery];
      updatedGallery.splice(index, 1);
      return { ...prev, gallery: updatedGallery };
    });
  };

  // Pitch deck handler (for startup)
  const handlePitchDeckUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or PowerPoint file');
      return;
    }

    setFilesToUpload(prev => ({ ...prev, pitchDeck: file }));
    setFormData(prev => ({ ...prev, pitchDeck: 'pending' }));
  };

  // Resume handler (for student)
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    setFilesToUpload(prev => ({ ...prev, resume: file }));
    setFormData(prev => ({ ...prev, resume: 'pending' }));
  };

  const handleGPSCapture = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          _gpsCoords: [pos.coords.longitude, pos.coords.latitude]
        }));
        setGpsLoading(false);
      },
      () => {
        alert('Location access denied or unavailable');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Team member handlers (for startup)
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, { name: '', position: '', bio: '', profilePhoto: null }]
    }));
  };

  const handleTeamAvatarUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    setFilesToUpload(prev => ({
      ...prev,
      teamAvatars: { ...prev.teamAvatars, [index]: file }
    }));

    updateTeamMember(index, 'profilePhoto', URL.createObjectURL(file));
  };

  const updateTeamMember = (index, field, value) => {
    setFormData(prev => {
      const updatedTeam = [...prev.team];
      updatedTeam[index] = { ...updatedTeam[index], [field]: value };
      return { ...prev, team: updatedTeam };
    });
  };

  const removeTeamMember = (index) => {
    setFormData(prev => {
      const updatedTeam = [...prev.team];
      updatedTeam.splice(index, 1);
      return { ...prev, team: updatedTeam };
    });
  };

  // Skills/Interests handlers (for student/user)
  const addSkill = (skill) => {
    if (skill.trim()) {
      const currentSkills = formData.skills || [];
      if (!currentSkills.includes(skill.trim())) {
        setFormData(prev => ({
          ...prev,
          skills: [...(prev.skills || []), skill.trim()]
        }));
      }
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index)
    }));
  };

  const addInterest = (interest) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  // Client-side validation function
  const validateFormClientSide = () => {
    const errors = [];
    
    // Common validations
    if (!formData.name?.trim()) errors.push('Name is required');
    if (!formData.email?.trim()) errors.push('Email is required');
    if (!formData.bio?.trim()) errors.push('Bio is required');
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // File validations
    if (role === 'startup') {
      if (!formData.startupName?.trim()) errors.push('Startup name is required');
      if (!formData.tagline?.trim()) errors.push('Tagline is required');
      if (!formData.description?.trim()) errors.push('Description is required');
      if (!formData.industry?.trim()) errors.push('Industry is required');
      
      // Logo validation - check both formData and filesToUpload
      if (!filesToUpload.logo && !formData.logo) {
        errors.push('Startup logo is required');
      }
    }
    
    if (role === 'student') {
      if (!formData.institution?.trim()) errors.push('Institution is required');
      if (!formData.course?.trim()) errors.push('Course is required');
    }
    
    if (role === 'user') {
      if (!formData.profession?.trim()) errors.push('Profession is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const clientValidation = validateFormClientSide();
  if (!clientValidation.isValid) {
    alert(`Please fix the following errors:\n${clientValidation.errors.join('\n')}`);
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);

  try {
    const submissionData = { ...formData };

    // Map startupName → companyName (backend model field)
    if (role === 'startup') {
      if (submissionData.startupName !== undefined) {
        submissionData.companyName = submissionData.startupName;
        delete submissionData.startupName;
      }
      if (submissionData.fundingStage) {
        submissionData.fundingStage = submissionData.fundingStage.toLowerCase().replace(/\s+/g, '-');
      }
      // Build location object from city/state fields
      if (submissionData.locationCity || submissionData.locationState) {
        const locObj = {
          city: submissionData.locationCity || undefined,
          state: submissionData.locationState || undefined,
          country: 'India',
          locationType: submissionData._gpsCoords ? 'precise' : 'manual'
        };
        if (submissionData._gpsCoords) {
          locObj.type = 'Point';
          locObj.coordinates = submissionData._gpsCoords;
          locObj.locationUpdatedAt = new Date();
        }
        submissionData.location = locObj;
      }
      delete submissionData.locationCity;
      delete submissionData.locationState;
      delete submissionData._gpsCoords;
      // Drop any legacy string value for location — schema now expects an embedded document
      if (typeof submissionData.location === 'string') {
        delete submissionData.location;
      }
    }

    // Upload logo (startup)
    if (role === 'startup' && filesToUpload.logo) {
      const uploadRes = await axios.post(
        `${baseUrl}/startupark/api/profile/startup/upload`,
        { field: 'logo', filename: filesToUpload.logo.name, contentType: filesToUpload.logo.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { uploadUrl, key } = uploadRes.data;
      await axios.put(uploadUrl, filesToUpload.logo, {
        headers: { 'Content-Type': filesToUpload.logo.type }
      });
      submissionData.logo = key;
    }

    setUploadProgress(30);

    // Upload resume (student)
    if (role === 'student' && filesToUpload.resume) {
      const uploadRes = await axios.post(
        `${baseUrl}/startupark/api/student/upload`,
        { field: 'resume', filename: filesToUpload.resume.name, contentType: filesToUpload.resume.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { uploadUrl, key } = uploadRes.data;
      await axios.put(uploadUrl, filesToUpload.resume, {
        headers: { 'Content-Type': filesToUpload.resume.type }
      });
      submissionData.resume = key;
    }

    setUploadProgress(45);

    // Upload profile picture (user / student) → stored SCOPED on the StartupArk
    // role profile (NOT the main user model), so it never changes the Hub avatar.
    if (filesToUpload.profilePicture) {
      try {
        const ppRes = await axios.post(
          `${baseUrl}/startupark/api/profile/${role}/upload`,
          { field: 'profilePicture', filename: filesToUpload.profilePicture.name, contentType: filesToUpload.profilePicture.type },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { uploadUrl, key } = ppRes.data;
        await axios.put(uploadUrl, filesToUpload.profilePicture, {
          headers: { 'Content-Type': filesToUpload.profilePicture.type }
        });
        submissionData.profilePicture = key;
      } catch (ppErr) {
        console.error('Profile picture upload failed:', ppErr);
      }
    }

    setUploadProgress(55);

    // Remove empty strings, blob URLs, and pending placeholders from submission
    Object.keys(submissionData).forEach(k => {
      const v = submissionData[k];
      if (typeof v === 'string' && (v === '' || v.startsWith('blob:') || v === 'pending')) {
        delete submissionData[k];
      }
    });

    setUploadProgress(70);

    // POST profile; on 409 (already exists) use PUT
    let response;
    try {
      response = await axios.post(
        `${baseUrl}/startupark/api/profile/${role}`,
        submissionData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      if (err.response?.status === 409) {
        response = await axios.put(
          `${baseUrl}/startupark/api/profile/${role}`,
          submissionData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
      } else {
        throw err;
      }
    }

    setUploadProgress(100);

    if (response.data.profile) {
      onSubmit();
    } else {
      throw new Error(response.data.error || 'Submission failed');
    }

  } catch (error) {
    console.error('Submission error:', error);

    let errorMessage = 'Failed to submit form.';
    if (error.response) {
      const { status, data } = error.response;
      errorMessage = data.error || `Server error (${status})`;
      if (data.details) {
        errorMessage += ': ' + (Array.isArray(data.details) ? data.details.join(', ') : data.details);
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Check your internet connection.';
    } else {
      errorMessage = error.message;
    }

    alert(errorMessage);

  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  const formTitles = {
    startup: 'Startup Profile Details',
    student: 'Student Profile Details',
    user: 'Complete Your Profile'
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {editMode ? 'Edit Your Profile' : formTitles[role]}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          {editMode ? 'Update your details and save your changes.' : 'Fill in your details to complete your profile'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <CommonFieldsForm 
          formData={formData} 
          setFormData={setFormData}
          setFilesToUpload={setFilesToUpload}
          handleChange={handleChange} 
          handleProfilePictureUpload={handleProfilePictureUpload}
          fileInputRef={fileInputRef}
          filesToUpload={filesToUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          role={role}
        />

        {role === 'startup' && (
          <>
          <StartupDetailsForm
            formData={formData}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
            handleLogoUpload={handleLogoUpload}
            handleGalleryUpload={handleGalleryUpload}
            handlePitchDeckUpload={handlePitchDeckUpload}
            handleTeamAvatarUpload={handleTeamAvatarUpload}
            updateGalleryCaption={updateGalleryCaption}
            removeGalleryImage={removeGalleryImage}
            addTeamMember={addTeamMember}
            updateTeamMember={updateTeamMember}
            removeTeamMember={removeTeamMember}
            fileInputRef={fileInputRef}
            galleryInputRef={galleryInputRef}
            pitchDeckInputRef={pitchDeckInputRef}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            filesToUpload={filesToUpload}
            baseUrl={baseUrl}
          />

          {/* Location section */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Location</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Help investors and partners discover you on the map.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="locationCity"
                  value={formData.locationCity || ''}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className="input-mono w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="locationState"
                  value={formData.locationState || ''}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className="input-mono w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGPSCapture}
                disabled={gpsLoading}
                className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiNavigation className={gpsLoading ? 'animate-pulse' : ''} />
                {gpsLoading ? 'Getting GPS…' : 'Pin precise location (GPS)'}
              </button>
              {formData._gpsCoords && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  ✓ GPS captured
                </span>
              )}
            </div>
          </div>
          </>
        )}

        {role === 'student' && (
          <StudentDetailsForm
            formData={formData}
            handleChange={handleChange}
            addSkill={addSkill}
            removeSkill={removeSkill}
            addInterest={addInterest}
            removeInterest={removeInterest}
            handleResumeUpload={handleResumeUpload}
            fileInputRef={fileInputRef}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            filesToUpload={filesToUpload}
          />
        )}

        {role === 'user' && (
          <UserDetailsForm
            formData={formData}
            handleChange={handleChange}
            addSkill={addSkill}
            removeSkill={removeSkill}
            handleArrayChange={handleArrayChange}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}

        <div className="pt-6 border-t border-black/[0.06] dark:border-white/10 flex gap-3">
          {editMode && onCancel && (
            <button type="button" onClick={onCancel} className="btn-ghost px-6 py-3" disabled={isUploading}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-mono flex-1 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving…
              </span>
            ) : (
              editMode ? 'Save Changes' : 'Complete Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormComponent;