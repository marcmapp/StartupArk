import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CommonFieldsForm from '../users/user/CommonFieldsForm';
import StartupDetailsForm from '../users/startups/StartupDetailsForm';
import UserDetailsForm from '../users/user/UserDetailsForm';
import StudentDetailsForm from '../users/students/StudentForm';

const isBlobUrl = (url) => {
  return url && typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('http'));
};

function FormComponent({ role, onSubmit }) {
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

  const [filesToUpload, setFilesToUpload] = useState({
    logo: null,
    gallery: [],
    pitchDeck: null,
    teamAvatars: {},
    profilePicture: null,
    resume: null
  });

  // Fetch user data from signup and autofill
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await axios.get(`${baseUrl}/api/mappuser/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = res.data;
        setFormData(prev => ({
          ...prev,
          name: userData.username || userData.name || '',
          email: userData.email || '',
          phone: userData.whatsappNumber || ''
        }));
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [token, baseUrl, role]);

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
          pitchDeck: null
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
        if (isBlobUrl(member.avatar)) URL.revokeObjectURL(member.avatar);
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

  // Team member handlers (for startup)
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, { name: '', position: '', bio: '', avatar: null }]
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

    updateTeamMember(index, 'avatar', URL.createObjectURL(file));
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
  
  // Client-side validation
  const clientValidation = validateFormClientSide();
  if (!clientValidation.isValid) {
    alert(`Please fix the following errors:\n${clientValidation.errors.join('\n')}`);
    return;
  }
  
  setIsUploading(true);
  setUploadProgress(0);

  try {
    // 1. Upload profile picture if exists
    let profilePictureKey = null;
    if (filesToUpload.profilePicture) {
      console.log('Uploading profile picture...');
      
      const uploadUrlResponse = await axios.get(
        `${baseUrl}/startupark/api/s3/upload-url`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            filename: filesToUpload.profilePicture.name,
            filetype: filesToUpload.profilePicture.type,
            filecategory: 'profile'
          }
        }
      );
      
      if (uploadUrlResponse.data.success) {
        const { url, key } = uploadUrlResponse.data;
        
        await axios.put(url, filesToUpload.profilePicture, {
          headers: { 'Content-Type': filesToUpload.profilePicture.type }
        });
        
        profilePictureKey = key;
        console.log('Profile picture uploaded:', key);
      }
    }
    
    setUploadProgress(30);
    
    // 2. Prepare form data
    const submissionData = { ...formData };
    
    // Update with uploaded file key
    if (profilePictureKey) {
      submissionData.profilePicture = profilePictureKey;
    } else if (submissionData.profilePicture && submissionData.profilePicture.startsWith('blob:')) {
      delete submissionData.profilePicture;
    }
    
    // Remove other blob URLs
    Object.keys(submissionData).forEach(key => {
      if (typeof submissionData[key] === 'string' && submissionData[key].startsWith('blob:')) {
        delete submissionData[key];
      }
    });
    
    setUploadProgress(60);
    
    // 3. Submit form data
    console.log('Submitting form data...');
    
    const response = await axios.post(
      `${baseUrl}/startupark/api/startupark/form/${role}`,
      submissionData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    setUploadProgress(100);
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      alert('Profile saved successfully!');
      onSubmit();
    } else {
      throw new Error(response.data.error || 'Submission failed');
    }
    
  } catch (error) {
    console.error('Submission error:', error);
    
    let errorMessage = 'Failed to submit form. ';
    
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formTitles = {
    startup: 'Startup Profile Details',
    student: 'Student Profile Details',
    user: 'Complete Your Profile'
  };

  return (
    <div className="bg-white max-w-4xl mx-auto p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {formTitles[role]}
        </h2>
        <p className="text-gray-500 mt-2">Fill in your details to complete your profile</p>
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

        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Complete Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormComponent;