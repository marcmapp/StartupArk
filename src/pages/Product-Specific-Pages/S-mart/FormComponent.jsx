import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CommonFieldsForm from './CommonFieldsForm';
import StartupDetailsForm from './startups/StartupDetailsForm';

const isBlobUrl = (url) => {
  return url && typeof url === 'string' && url.startsWith('blob:');
};

function FormComponent({ role, onSubmit }) {
  // State and refs
  const [formData, setFormData] = useState(initializeFormData(role));
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const pitchDeckInputRef = useRef(null);

  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [filesToUpload, setFilesToUpload] = useState({
    logo: null,
    gallery: [],
    pitchDeck: null,
    teamAvatars: {}
  });

  // Initialize form data based on role
  function initializeFormData(role) {
    const commonFields = {
      name: '',
      email: ''
    };

    if (role === 'startup') {
      return {
        ...commonFields,
        startupName: '',
        tagline: '',
        description: '',
        bio: '',
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
        location: '',
        phone: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        pitchDeck: null
      };
    }
    return commonFields;
  }

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (isBlobUrl(formData.logo)) URL.revokeObjectURL(formData.logo);
      
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
    const items = value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [name]: items }));
  };

  // File upload handler
  const handleFileUpload = async (file, type) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Get signed URL from backend
      const response = await axios.get(`${baseUrl}/api/smart/upload-url`, {
        params: {
          filename: encodeURIComponent(file.name),
          filetype: file.type,
          filecategory: type
        },
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

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
      console.error('Upload failed:', error);
      throw new Error(error.response?.data?.error || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Logo handler
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

  // Gallery handlers
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

  // Pitch deck handler
  const handlePitchDeckUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFilesToUpload(prev => ({ ...prev, pitchDeck: file }));
    setFormData(prev => ({ ...prev, pitchDeck: 'pending' }));
  };

  // Team member handlers
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

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const finalFormData = { ...formData };

      // Upload logo
      if (filesToUpload.logo) {
        finalFormData.logo = await handleFileUpload(filesToUpload.logo, 'logo');
      }

      // Upload gallery images
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

      // Upload pitch deck
      if (filesToUpload.pitchDeck) {
        finalFormData.pitchDeck = await handleFileUpload(filesToUpload.pitchDeck, 'pitchdeck');
      }

      // Upload team avatars
      for (const [index, file] of Object.entries(filesToUpload.teamAvatars)) {
        const s3Key = await handleFileUpload(file, 'team');
        finalFormData.team[index].avatar = s3Key;
      }

      // Submit form
      await axios.post(
        `${baseUrl}/api/smart/form/${role}`, 
        { formData: finalFormData }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onSubmit();
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Failed to submit form: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white max-w-4xl mx-auto p-8 rounded-xl shadow-2xl text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-center">
        {role === 'startup' ? 'Startup Details' : 'Complete Your Profile'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CommonFieldsForm 
          formData={formData} 
          handleChange={handleChange} 
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

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all mt-8 disabled:opacity-50"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading Files...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default FormComponent;