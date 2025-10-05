import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Agreement from './S-mart/Agreement';
import FormComponent from './S-mart/FormComponent';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function SmartSetup({onComplete}) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [agreementDone, setAgreementDone] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false); // New state
  const navigate = useNavigate();

  // Fetch user's selected role on mount
  useEffect(() => {
    async function fetchRole() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/smart/api/smart/role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(res.data.role);
        
        // Check if this is first-time setup
        const setupRes = await axios.get(`${baseUrl}/smart/api/smart/first-time`, {
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
  }, []);
  // Fetch agreement status whenever role changes
  useEffect(() => {
    if (!role) return;
    async function fetchAgreement() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/smart/api/smart/agreement/${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgreementDone(res.data.agreed);
      } catch (err) {
        console.error('Failed to fetch agreement:', err);
        setError('Failed to fetch agreement');
      } finally {
        setLoading(false);
      }
    }
    fetchAgreement();
  }, [role]);

  // Fetch form status once agreement is done
  useEffect(() => {
    if (!role || !agreementDone) return;
    async function fetchFormStatus() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/smart/api/smart/form/${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormDone(res.data.hasFormData);
      } catch (err) {
        console.error('Failed to fetch form status:', err);
        setError('Failed to fetch form status');
      } finally {
        setLoading(false);
      }
    }
    fetchFormStatus();
  }, [role, agreementDone]);

  // Auto-redirect to appropriate dashboard when form is done
useEffect(() => {
    if (formDone) {
      if (isFirstTimeSetup) {
        setShowSuccess(true);
      }
      
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate(role === 'startup' 
            ? '/smart/startup-dashboard' 
            : '/smart/user-dashboard');
        }
      }, isFirstTimeSetup ? 2000 : 0); // No delay if not first time
      
      return () => clearTimeout(timer);
    }
  }, [formDone, navigate, role, onComplete, isFirstTimeSetup]);

  // Select user role
async function handleRoleSelect(selectedRole) {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `${baseUrl}/smart/api/smart/role`,
      { role: selectedRole },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Refresh user data to confirm role change
    const userRes = await axios.get(`${baseUrl}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRole(userRes.data.smartRole);
  } catch (err) {
    console.error('Failed to save role:', err);
    setError(err.response?.data?.error || 'Failed to save role');
  } finally {
    setLoading(false);
  }
}

  // Callback for Agreement component
  function handleAgree() {
    setAgreementDone(true);
  }

  // Callback for FormComponent
  function handleFormSubmit() {
    setFormDone(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Your Role</h2>
        <div className="flex gap-6">
          <button
            onClick={() => handleRoleSelect('user')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            User
          </button>
          <button
            onClick={() => handleRoleSelect('startup')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Startup
          </button>
        </div>
      </div>
    );
  }

  if (!agreementDone) {
    return <Agreement role={role} onAgree={handleAgree} />;
  }

  if (!formDone) {
    return <FormComponent role={role} onSubmit={handleFormSubmit} />;
  }

  return (
    <>
      {/* Success Notification Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Setup Complete!
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                Taking you to your {role === 'startup' ? 'Startup' : 'User'} Dashboard...
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}