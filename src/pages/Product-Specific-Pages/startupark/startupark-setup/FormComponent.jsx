import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CommonFieldsForm from '../users/user/CommonFieldsForm';
import StartupDetailsForm from '../users/startups/StartupDetailsForm';
import UserDetailsForm from '../users/user/UserDetailsForm';
import StudentDetailsForm from '../users/students/StudentForm';

const isBlobUrl = (url) => {
  return url && typeof url === 'string' && url.startsWith('blob:');
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
    profilePicture: null
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

  // File upload handler
  const handleFileUpload = async (file, type) => {
  setIsUploading(true);
  setUploadProgress(0);
  
  try {
    // Debug: Log the URL being called
    const uploadUrl = `${baseUrl}/startupark/api/s3/upload-url`;
    console.log('Requesting upload URL from:', uploadUrl);
    console.log('File info:', {
      filename: file.name,
      filetype: file.type,
      filecategory: type,
      size: file.size
    });

    const response = await axios.get(uploadUrl, {
      params: {
        filename: file.name,
        filetype: file.type,
        filecategory: type
      },
      headers: { 
        Authorization: `Bearer ${token}`
      },
      paramsSerializer: (params) => {
        // Custom params serializer to handle special characters
        return Object.keys(params)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&');
      }
    });

    console.log('Upload URL response:', response.data);

      const { url, key } = response.data;

      // Upload file to S3
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      return key;
   } catch (error) {
    // Enhanced error logging
    console.error('Upload failed with details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params
      }
    });
    throw new Error(error.response?.data?.error || 'File upload failed');
  } finally {
    setIsUploading(false);
  }
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

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setFilesToUpload(prev => ({ ...prev, logo: file }));
    setFormData(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
  };

  // Gallery handlers (for startup)
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFilesToUpload(prev => ({ ...prev, gallery: [...prev.gallery, ...files] }));
    
    const newGalleryItems = files.map(file => ({
      url: URL.createObjectURL(file),
      caption: ''
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
      updatedGallery.splice(index, 1);
      return { ...prev, gallery: updatedGallery };
    });
  };

  // Pitch deck handler (for startup)
  const handlePitchDeckUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    const currentSkills = formData.skills || [];  // Add fallback for undefined
    if (!currentSkills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill.trim()]  // Add fallback here too
      }));
    }
  }
};

const removeSkill = (index) => {
  setFormData(prev => ({
    ...prev,
    skills: (prev.skills || []).filter((_, i) => i !== index)  // Add fallback
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

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const finalFormData = { ...formData };

      // Upload files based on role
      if (role === 'startup') {
        if (filesToUpload.logo) {
          finalFormData.logo = await handleFileUpload(filesToUpload.logo, 'logo');
        }
        
        if (filesToUpload.gallery.length > 0) {
          const uploadPromises = filesToUpload.gallery.map(file => 
            handleFileUpload(file, 'gallery')
          );
          const s3Keys = await Promise.all(uploadPromises);
          finalFormData.gallery = finalFormData.gallery.map((item, index) => 
            isBlobUrl(item.url) ? 
              { url: s3Keys[index], caption: item.caption } : 
              item
          );
        }

        if (filesToUpload.pitchDeck) {
          finalFormData.pitchDeck = await handleFileUpload(filesToUpload.pitchDeck, 'pitchdeck');
        }

        for (const [index, file] of Object.entries(filesToUpload.teamAvatars)) {
          const s3Key = await handleFileUpload(file, 'team');
          finalFormData.team[index].avatar = s3Key;
        }
      }

      if ((role === 'user' || role === 'student') && filesToUpload.profilePicture) {
        finalFormData.profilePicture = await handleFileUpload(filesToUpload.profilePicture, 'profile');
      }

      if (role === 'student' && filesToUpload.resume) {
        finalFormData.resume = await handleFileUpload(filesToUpload.resume, 'resume');
      }

     // Submit form with updated endpoint
    const response = await axios.post(
      `${baseUrl}/startupark/api/startupark/form/${role}`, 
      { formData: finalFormData }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      onSubmit();
    } else {
      alert(`Failed to submit form: ${response.data.error}`);
    }
  } catch (error) {
    console.error('Submission failed:', error);
    
    // Handle specific error codes
    if (error.response?.data?.code === 'DUPLICATE_FORM') {
      alert('You already have a profile for this role. Please update your existing profile.');
    } else if (error.response?.data?.code === 'DUPLICATE_SHARE_ID') {
      alert('There was an issue with your virtual card. Please try again.');
    } else {
      alert(`Failed to submit form: ${error.response?.data?.error || error.message}`);
    }
  } finally {
    setIsUploading(false);
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
                Uploading Files...
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