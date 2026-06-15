// CareerLaunchPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CareerLaunchPage = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [view, setView] = useState('browse');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeKey, setResumeKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Clear messages after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Fetch opportunities
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/startupark/api/opportunities`, {
        params: { type: activeTab === 'jobs' ? 'job' : activeTab },
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(response.data.opportunities || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applied opportunities
  const fetchAppliedOpportunities = async () => {
    try {
      const response = await axios.get(`${baseUrl}/startupark/api/applications?as=student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliedOpportunities(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setAppliedOpportunities([]);
    }
  };

  // Fetch applied opportunities on component mount and when view changes to browse
  useEffect(() => {
    fetchAppliedOpportunities();
  }, []);

  useEffect(() => {
    if (view === 'browse') {
      fetchOpportunities();
      // Also refresh applied opportunities to ensure we have latest data
      fetchAppliedOpportunities();
    } else if (view === 'applied') {
      fetchAppliedOpportunities();
    }
  }, [activeTab, view]);

  // Check if user has already applied to an opportunity
  const checkIfAlreadyApplied = (opportunityId) => {
    return appliedOpportunities.some(app =>
      String(app.opportunityId?._id || app.opportunityId) === String(opportunityId)
    );
  };

  // Handle resume upload to S3
  const handleResumeUpload = async (file) => {
    try {
      setUploadingResume(true);
      
      // Get presigned PUT URL for resume upload
      const urlResponse = await axios.post(
        `${baseUrl}/startupark/api/student/upload`,
        { field: 'resume', filename: file.name, contentType: file.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { uploadUrl: url, key } = urlResponse.data;

      // Upload file to S3
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      setResumeKey(key);
      return key;
    } catch (error) {
      console.error('Resume upload failed:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Invalid file type');
      }
      throw new Error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size should be less than 5MB');
      return;
    }

    setResumeFile(file);
    setErrorMessage(''); // Clear any previous errors
    
    // Save to sessionStorage immediately
    sessionStorage.setItem('resumeFile', JSON.stringify({
      name: file.name,
      size: file.size,
      type: file.type
    }));
  };

  // Handle application submission
  const handleApplicationSubmit = async (applicationData) => {
    try {
      if (!resumeFile) {
        setErrorMessage('Please upload your resume');
        return;
      }

      // Check if already applied before uploading to S3
      if (selectedOpportunity && checkIfAlreadyApplied(selectedOpportunity._id)) {
        setErrorMessage('You have already applied to this opportunity.');
        return;
      }

      // Upload resume first
      const resumeKey = await handleResumeUpload(resumeFile);

      // Submit application
      await axios.post(
        `${baseUrl}/startupark/api/opportunities/${selectedOpportunity._id}/apply`,
        {
          coverLetter: applicationData.coverLetter,
          resume: resumeKey
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Application submitted successfully!');
      // Refresh applied opportunities to get the latest data
      await fetchAppliedOpportunities();
      setView('applied');
      setSelectedOpportunity(null);
      setResumeFile(null);
      setResumeKey('');
      
      // Clear all session storage
      sessionStorage.removeItem('applicationFormData');
      sessionStorage.removeItem('resumeFile');
      
    } catch (error) {
      console.error('Application submission failed:', error);
      
      // Handle duplicate application error
      if (error.response?.status === 400 && 
          error.response?.data?.error?.includes('already applied')) {
        setErrorMessage('You have already applied to this opportunity.');
        // Refresh applied opportunities in case our local state was stale
        fetchAppliedOpportunities();
      } else {
        setErrorMessage('Failed to submit application. Please try again.');
      }
    }
  };

  const OpportunityCard = ({ opportunity }) => {
    const hasApplied = checkIfAlreadyApplied(opportunity._id);
    
    return (
      <div className=" rounded-lg border border-gray-200 dark:border-white/10 p-6 hover:shadow-md transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2 transition-colors">
              {opportunity.title}
            </h3>
            <div className="flex items-center gap-4 text-sm  mb-3">
              <span className="font-medium">{opportunity.startupName}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{opportunity.location}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="capitalize">{opportunity.type}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {opportunity.type}
            </div>
            {hasApplied && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Applied
              </div>
            )}
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed line-clamp-2">
          {opportunity.description}
        </p>

        {opportunity.requirements && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {opportunity.requirements.split(',').slice(0, 3).map((req, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs">
                  {req.trim()}
                </span>
              ))}
              {opportunity.requirements.split(',').length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs">
                  +{opportunity.requirements.split(',').length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {opportunity.applicationCount || 0} applicants
          </div>
          <button
            onClick={() => {
              if (hasApplied) {
                setErrorMessage('You have already applied to this opportunity.');
                return;
              }
              setSelectedOpportunity(opportunity);
              setView('application');
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              hasApplied 
                ? 'bg-gray-300 text-zinc-500 dark:text-zinc-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            disabled={loading || hasApplied}
          >
            {hasApplied ? 'Already Applied' : (loading ? 'Loading...' : 'Apply Now')}
          </button>
        </div>
      </div>
    );
  };

// Update the StatusBadge component in your existing CareerLaunchPad.jsx
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-blue-100 text-blue-800', text: 'Submitted' },
    reviewed: { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
    shortlisted: { color: 'bg-purple-100 text-purple-800', text: 'Shortlisted' },
    interview: { color: 'bg-orange-100 text-orange-800', text: 'Interview Stage' },
    accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-800', text: 'Not Selected' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// Update the AppliedCard component to show new statuses
const AppliedCard = ({ application }) => (
  <div className=" rounded-lg border border-gray-200 dark:border-white/10 p-6 hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">{application.title}</h3>
        <p className="text-sm  mb-2">{application.company} • {application.type}</p>
      </div>
      <StatusBadge status={application.status} />
    </div>
    
    <div className="flex justify-between items-center text-sm ">
      <span>Applied on {new Date(application.appliedDate).toLocaleDateString()}</span>
      <button 
        onClick={() => {
          setSelectedApplication(application);
          setView('application-details');
        }}
        className="font-medium transition-colors"
      >
        View Details
      </button>
    </div>
  </div>
);

  const ApplicationForm = () => {
    // Move formData state inside ApplicationForm to prevent re-initialization
    const [formData, setFormData] = useState(() => {
      // Initialize from sessionStorage or empty values
      const savedFormData = sessionStorage.getItem('applicationFormData');
      return savedFormData ? JSON.parse(savedFormData) : {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        coverLetter: ''
      };
    });

    // Initialize resumeFile from sessionStorage if available
    useEffect(() => {
      const savedResumeFile = sessionStorage.getItem('resumeFile');
      if (savedResumeFile) {
        const fileData = JSON.parse(savedResumeFile);
        // We can't recreate the File object, but we can show the filename
        // The actual file will need to be re-selected by user
        console.log('Previously selected file:', fileData.name);
      }
    }, []);

    // Save form data whenever it changes
    useEffect(() => {
      sessionStorage.setItem('applicationFormData', JSON.stringify(formData));
    }, [formData]);

    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      await handleApplicationSubmit(formData);
    };

    // Clear storage when component unmounts (when going back)
    useEffect(() => {
      return () => {
        if (view !== 'applied') {
          // Don't clear if we're successfully submitting
          const isSubmitting = sessionStorage.getItem('isSubmitting');
          if (!isSubmitting) {
            sessionStorage.removeItem('applicationFormData');
            sessionStorage.removeItem('resumeFile');
          }
        }
      };
    }, [view]);

    // Load user data when form opens
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${baseUrl}/startupark/api/profile/student`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const userData = response.data.profile || response.data.user;
          const savedFormData = sessionStorage.getItem('applicationFormData');
          const currentFormData = savedFormData ? JSON.parse(savedFormData) : {};
          
          // Only pre-fill if fields are empty and not already saved
          const newFormData = { ...currentFormData };
          let shouldUpdate = false;

          if (!currentFormData.firstName && userData.username?.split(' ')[0]) {
            newFormData.firstName = userData.username.split(' ')[0];
            shouldUpdate = true;
          }
          if (!currentFormData.lastName && userData.username?.split(' ').slice(1).join(' ')) {
            newFormData.lastName = userData.username.split(' ').slice(1).join(' ');
            shouldUpdate = true;
          }
          if (!currentFormData.email && userData.email) {
            newFormData.email = userData.email;
            shouldUpdate = true;
          }
          if (!currentFormData.phone && userData.whatsappNumber) {
            newFormData.phone = userData.whatsappNumber;
            shouldUpdate = true;
          }

          if (shouldUpdate) {
            setFormData(newFormData);
            sessionStorage.setItem('applicationFormData', JSON.stringify(newFormData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      if (view === 'application') {
        fetchUserData();
      }
    }, [view, token, baseUrl]);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className=" rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
          <div className="p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => {
                  sessionStorage.removeItem('applicationFormData');
                  sessionStorage.removeItem('resumeFile');
                  setView('browse');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className=" hover:text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Apply for {selectedOpportunity?.title}</h2>
                <p className="">{selectedOpportunity?.startupName}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">First Name</label>
                <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Last Name</label>
                <input 
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Phone Number</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cover Letter</label>
              <textarea 
                rows="6"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                placeholder="Tell us why you're interested in this opportunity and why you'd be a great fit..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Upload Resume</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-upload"
                  key={resumeFile ? resumeFile.name : 'file-input'} // Add key to prevent re-initialization
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className=" mb-1">
                    {resumeFile ? resumeFile.name : 'Drop your resume here or click to browse'}
                  </p>
                  <p className="text-gray-400 text-sm">PDF, DOC, DOCX (Max 5MB)</p>
                </label>
              </div>
              {uploadingResume && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
                  </div>
                  <p className="text-sm  mt-1">Uploading resume...</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <button 
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('applicationFormData');
                  sessionStorage.removeItem('resumeFile');
                  setView('browse');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-gray-50 dark:bg-zinc-900 transition-colors"
                disabled={uploadingResume}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={!resumeFile || uploadingResume}
              >
                {uploadingResume ? 'Uploading...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ApplicationDetails component remains the same...
  const ApplicationDetails = () => {
    if (!selectedApplication) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className=" rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
          <div className="p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setView('applied')}
                className=" hover:text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">{selectedApplication.title}</h2>
                <p className="">{selectedApplication.company}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Application Status</label>
                <StatusBadge status={selectedApplication.status} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Applied Date</label>
                <p className="">
                  {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedApplication.coverLetter && (
              <div>
                <label className="block text-sm font-medium mb-2">Cover Letter</label>
                <div className="rounded-lg p-4">
                  <p className=" whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>
            )}

            {selectedApplication.resume && (
              <div>
                <label className="block text-sm font-medium mb-2">Resume</label>
                <div className="flex items-center gap-4">
                  <span className="">Resume uploaded</span>
                  <a
                    href={`${baseUrl}/startupark/api/s3/private-file/${encodeURIComponent(selectedApplication.resume)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500 hover:text-cyan-800 font-medium"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TabButton = ({ type, label, isActive, onClick }) => (
    <button
      className={`px-4 py-2 text-sm font-medium transition-all duration-300 border-b-2 ${
        isActive 
          ? 'border-black text-green-600' 
          : 'border-transparent  hover:text-sky-500 hover:border-orange-500'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  const ViewToggle = () => (
    <div className="flex  rounded-lg p-1 shadow-sm border border-gray-200 dark:border-white/10">
      <button
        onClick={() => setView('browse')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
          view === 'browse' 
            ? 'bg-gray-100 dark:bg-zinc-800 text-black' 
            : ' hover:text-zinc-800 dark:text-zinc-200'
        }`}
      >
        Browse
      </button>
      <button
        onClick={() => setView('applied')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
          view === 'applied' 
            ? 'bg-gray-100 dark:bg-zinc-800 text-black' 
            : ' hover:text-zinc-800 dark:text-zinc-200'
        }`}
      >
        My Applications
      </button>
    </div>
  );

  return (
    <div className="min-h-screen min-w-full overflow-auto -m-6 p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white mb-2">
              Career Launch Pad
            </h1>
            <p className="">
              Discover your next career move
            </p>
          </div>
          <ViewToggle />
        </div>

        {view === 'browse' && (
          <>
            {/* Global Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setErrorMessage('')}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Opportunity Type Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-200 dark:border-white/10">
              <TabButton
                type="jobs"
                label="Jobs"
                isActive={activeTab === 'jobs'}
                onClick={() => setActiveTab('jobs')}
              />
              <TabButton
                type="internships"
                label="Internships"
                isActive={activeTab === 'internships'}
                onClick={() => setActiveTab('internships')}
              />
              <TabButton
                type="courses"
                label="Courses"
                isActive={activeTab === 'courses'}
                onClick={() => setActiveTab('courses')}
              />
              <TabButton
                type="freelance"
                label="Freelance"
                isActive={activeTab === 'freelance'}
                onClick={() => setActiveTab('freelance')}
              />
            </div>

            {/* Opportunities Grid */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                <p className="mt-4 ">Loading opportunities...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {opportunities.map((opportunity) => (
                  <OpportunityCard 
                    key={opportunity._id} 
                    opportunity={opportunity} 
                  />
                ))}
              </div>
            )}

            {opportunities.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="text-gray-300 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium  mb-2">No opportunities found</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Check back later for new {activeTab} opportunities.</p>
              </div>
            )}
          </>
        )}

        {view === 'applied' && (
          <div className="max-w-4xl mx-auto">
            <div className=" rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-6">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">My Applications</h2>
              
              {appliedOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {appliedOpportunities.map((application) => (
                    <AppliedCard key={application._id} application={application} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-300 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium  mb-2">No applications yet</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mb-6">Start applying to opportunities to see them here.</p>
                  <button
                    onClick={() => setView('browse')}
                    className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Browse Opportunities
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'application' && <ApplicationForm />}
        {view === 'application-details' && <ApplicationDetails />}
      </div>
    </div>
  );
};

export default CareerLaunchPage;