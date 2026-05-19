import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Agreement from './Agreement';
import FormComponent from './FormComponent';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function StartuparkSetup({ onComplete }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [agreementDone, setAgreementDone] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log('StartuparkSetup state:', {
    role,
    currentStep,
    agreementDone,
    formDone,
    locationState: location.state,
    selectedRole,
    loading
  });

  // Steps configuration
  const steps = [
    { id: 1, title: 'Select Role', description: 'Choose your profile type' },
    { id: 2, title: 'Review Agreement', description: 'Read and accept terms' },
    { id: 3, title: 'Complete Profile', description: 'Fill in your details' },
    { id: 4, title: 'All Set!', description: 'Ready to get started' }
  ];

  // Handle forced setup from RoleSwitcher
  useEffect(() => {
    console.log('Location state:', location.state);
    
    if (location.state?.role === 'startup' && location.state?.forceSetup) {
      console.log('🚀 Force setup detected for startup role');
      
      // Immediately set role and selected role
      setRole('startup');
      setSelectedRole('startup');
      
      // Check agreement and first-time status
      const checkSetup = async () => {
        try {
          const token = localStorage.getItem('token');
          
          // Check agreement for startup
          const agreementRes = await axios.get(`${baseUrl}/startupark/api/startupark/agreement/startup`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setAgreementDone(agreementRes.data.agreed);
          
          // Check first-time status
          const setupRes = await axios.get(`${baseUrl}/startupark/api/startupark/first-time`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsFirstTimeSetup(setupRes.data.isFirstTime);
          
          // Check if form already exists
          const formRes = await axios.get(`${baseUrl}/startupark/api/startupark/form/startup`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (formRes.data.hasFormData) {
            setFormDone(true);
            setCurrentStep(4);
          } else if (agreementRes.data.agreed) {
            setCurrentStep(3); // Go to form
          } else {
            setCurrentStep(2); // Go to agreement
          }
          
        } catch (err) {
          console.error('Force setup check error:', err);
          setError('Failed to setup startup registration');
        } finally {
          setLoading(false);
        }
      };
      
      checkSetup();
      return; // Don't run normal fetch logic
    }
  }, [location.state]);

  // Normal fetch logic (only runs if not forced setup)
  useEffect(() => {
    // Skip if we already handled forced setup
    if (location.state?.forceSetup && location.state?.role === 'startup') {
      return;
    }
    
    async function fetchRole() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/startupark/api/startupark/role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setRole(res.data.role);
        
        const setupRes = await axios.get(`${baseUrl}/startupark/api/startupark/first-time`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFirstTimeSetup(setupRes.data.isFirstTime);
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setError('Failed to fetch role');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRole();
  }, [location.state]);

  // Fetch agreement status whenever role changes (for normal flow)
  useEffect(() => {
    if (!role || (location.state?.forceSetup && location.state?.role === 'startup')) return;
    
    async function fetchAgreement() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/startupark/api/startupark/agreement/${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgreementDone(res.data.agreed);
        
        if (res.data.agreed) {
          setCurrentStep(3);
        } else {
          setCurrentStep(2);
        }
      } catch (err) {
        console.error('Failed to fetch agreement:', err);
        setError('Failed to fetch agreement');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAgreement();
  }, [role, location.state]);

  // Fetch form status once agreement is done
  useEffect(() => {
    if (!role || !agreementDone) return;
    
    async function fetchFormStatus() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/startupark/api/startupark/form/${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormDone(res.data.hasFormData);
        if (res.data.hasFormData) {
          setCurrentStep(4);
        }
      } catch (err) {
        console.error('Failed to fetch form status:', err);
        setError('Failed to fetch form status');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFormStatus();
  }, [role, agreementDone]);

  // Auto-redirect when form is done
  useEffect(() => {
    if (formDone) {
      console.log('✅ Form done, preparing redirect...');
      
      if (isFirstTimeSetup) {
        setShowSuccess(true);
      }
      
      const timer = setTimeout(async () => {
        const token = localStorage.getItem('token');
        
        try {
          // Get the latest user data
          const userRes = await axios.get(`${baseUrl}/api/mappuser/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const currentRole = userRes.data.startuparkRole;
          console.log('Current user role:', currentRole, 'Form role:', role);
          
          // If we just completed startup setup, switch role
          if (role === 'startup' && currentRole !== 'startup') {
            console.log('🔄 Switching role to startup...');
            await axios.post(
              `${baseUrl}/startupark/api/startupark/switch-to-startup`,
              { role: 'startup' },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/startupark/startup-dashboard');
          } 
          // If already startup, go to startup dashboard
          else if (currentRole === 'startup') {
            navigate('/startupark/startup-dashboard');
          }
          // For other roles
          else {
            const dashboardRoutes = {
              user: '/startupark/user-dashboard',
              startup: '/startupark/startup-dashboard',
              student: '/startupark/student-dashboard'
            };
            navigate(dashboardRoutes[currentRole] || '/startupark/user-dashboard');
          }
        } catch (error) {
          console.error('Redirect error:', error);
          // Fallback based on role
          if (role === 'startup') {
            navigate('/startupark/startup-dashboard');
          } else {
            navigate('/startupark/user-dashboard');
          }
        }
      }, isFirstTimeSetup ? 2000 : 0);
      
      return () => clearTimeout(timer);
    }
  }, [formDone, navigate, role, isFirstTimeSetup, baseUrl]);

  // Select user role
  async function handleRoleSelect(selectedRoleType) {
    console.log('Selecting role:', selectedRoleType);
    setSelectedRole(selectedRoleType);
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // If it's a forced startup setup, we already have the role
      if (location.state?.forceSetup && selectedRoleType === 'startup') {
        setRole('startup');
        setCurrentStep(2);
      } else {
        // Normal role selection
        await axios.post(
          `${baseUrl}/startupark/api/startupark/role`,
          { role: selectedRoleType },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const userRes = await axios.get(`${baseUrl}/api/mappuser/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(userRes.data.startuparkRole);
        setCurrentStep(2);
      }
    } catch (err) {
      console.error('Failed to save role:', err);
      setError(err.response?.data?.error || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  }

  // Callback for Agreement component
  function handleAgree() {
    console.log('Agreement accepted');
    setAgreementDone(true);
    setCurrentStep(3);
    
    // If forced startup setup, ensure role is set
    if (location.state?.forceSetup && !role) {
      setRole('startup');
    }
  }

  // Callback for FormComponent
  function handleFormSubmit() {
    console.log('Form submitted, role:', role);
    setFormDone(true);
    setCurrentStep(4);
    
    // If this was a startup setup, switch role immediately
    if (role === 'startup') {
      const switchRole = async () => {
        try {
          const token = localStorage.getItem('token');
          console.log('Attempting to switch role to startup...');
          await axios.post(
            `${baseUrl}/startupark/api/startupark/switch-to-startup`,
            { role: 'startup' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Role switch successful');
        } catch (error) {
          console.error('Failed to switch role after form:', error);
        }
      };
      switchRole();
    }
  }

  // Go back to previous step
  function handleBack() {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  }

  // Step renderer with forced setup handling
  function renderStep() {
    console.log('Rendering step:', currentStep, 'Role:', role, 'Force setup:', location.state?.forceSetup);
    
    // If forced startup setup and we're still on step 1, show loading
    if (location.state?.forceSetup && location.state?.role === 'startup' && currentStep === 1 && loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Setting up startup registration...</p>
        </div>
      );
    }
    
    // Auto-select startup if forced setup and showing role selection
    if (location.state?.forceSetup && location.state?.role === 'startup' && currentStep === 1 && !loading && role !== 'startup') {
      console.log('Auto-selecting startup role');
      // Auto-select and proceed
      setTimeout(() => {
        handleRoleSelect('startup');
      }, 100);
      
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Setting up startup registration...</p>
        </div>
      );
    }
    
    switch (currentStep) {
      case 1:
        return renderRoleSelection();
      case 2:
        return renderAgreement();
      case 3:
        return renderForm();
      case 4:
        return renderCompletion();
      default:
        return null;
    }
  }

  // Step 1: Role Selection
  function renderRoleSelection() {
    const roles = [
      {
        id: 'user',
        title: 'User',
        description: 'Browse startups, invest, or become a mentor',
        icon: '👤',
        color: 'from-blue-500 to-blue-600',
        features: ['Browse Startups', 'Invest in Projects', 'Join as Mentor']
      },
      {
        id: 'startup',
        title: 'Startup',
        description: 'Showcase your startup, raise funds, find talent',
        icon: '🚀',
        color: 'from-green-500 to-emerald-600',
        features: ['Showcase Startup', 'Raise Funds', 'Find Talent']
      },
      {
        id: 'student',
        title: 'Student',
        description: 'Find internships, join projects, build skills',
        icon: '🎓',
        color: 'from-purple-500 to-purple-600',
        features: ['Find Internships', 'Join Projects', 'Build Portfolio']
      }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Startupark</h1>
          <p className="text-gray-600">Choose how you'd like to participate in our ecosystem</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((roleItem) => (
            <div
              key={roleItem.id}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                selectedRole === roleItem.id
                  ? 'border-indigo-500 bg-gradient-to-br from-white to-indigo-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:shadow-md'
              }`}
              onClick={() => setSelectedRole(roleItem.id)}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${roleItem.color} flex items-center justify-center text-2xl mb-4`}>
                {roleItem.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{roleItem.title}</h3>
              <p className="text-gray-600 mb-4">{roleItem.description}</p>
              <ul className="space-y-2">
                {roleItem.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {selectedRole === roleItem.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => handleRoleSelect(selectedRole)}
            disabled={!selectedRole || loading}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
              selectedRole && !loading
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Continue to Agreement'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Agreement
  function renderAgreement() {
    // Determine which role agreement to show
    const agreementRole = location.state?.forceSetup ? 'startup' : role;
    
    return (
      <div>
        <Agreement role={agreementRole} onAgree={handleAgree} />
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Form
  function renderForm() {
    // Determine which role form to show
    const formRole = location.state?.forceSetup ? 'startup' : role;
    
    return (
      <div>
        <FormComponent role={formRole} onSubmit={handleFormSubmit} />
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Completion
  function renderCompletion() {
    // Determine which role completed
    const completedRole = location.state?.forceSetup ? 'startup' : role;
    
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Setup Complete! 🎉</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your {completedRole} profile is ready. Redirecting you to your personalized dashboard...
        </p>
        <div className="max-w-md mx-auto bg-gray-100 rounded-full h-2 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-500">
          Taking you to your {completedRole === 'startup' ? 'Startup Dashboard' : completedRole === 'student' ? 'Student Dashboard' : 'User Dashboard'}
        </p>
      </div>
    );
  }

  // Loading state
  if (loading && !currentStep) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your setup progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Startupark!</h3>
              <p className="text-gray-600 mb-6">
                Your {role} profile setup is complete. We're preparing your personalized experience.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Complete Your Profile</h1>
          <p className="text-gray-600 text-lg">
            A few quick steps to personalize your Startupark experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-white shadow-lg'
                        : isCurrent
                        ? 'bg-white border-indigo-500 shadow-lg'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`font-bold ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`font-semibold ${isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto mb-8">
          {renderStep()}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
          <p>Need help? Contact our support team at support@startupark.com</p>
          <p className="mt-1">By completing this setup, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </>
  );
}