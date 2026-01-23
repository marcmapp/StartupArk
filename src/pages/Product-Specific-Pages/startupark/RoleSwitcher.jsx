// components/RoleSwitcher.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const RoleSwitcher = ({ currentRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
 // components/RoleSwitcher.jsx - Updated logic
// components/RoleSwitcher.jsx - Fix the navigation
// components/RoleSwitcher.jsx - Simplified version
const handleStartupRegistration = async () => {
  console.log('1. Registration started. Current role:', currentRole);
  
  if (currentRole === 'startup') {
    navigate('/startupark/startup-dashboard');
    return;
  }
  
  setLoading(true);
  const token = localStorage.getItem('token');
  
  try {
    console.log('2. Checking if can register...');
    const checkRes = await axios.get(`${baseUrl}/startupark/api/startupark/can-register-startup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('3. Check response:', checkRes.data);
    
    if (!checkRes.data.canRegister && checkRes.data.redirectTo) {
      navigate(checkRes.data.redirectTo);
      return;
    }
    
    if (checkRes.data.hasCompleteForm) {
      // Has complete startup form - switch role and go to dashboard
      console.log('4. Has complete form, switching role...');
      await axios.post(
        `${baseUrl}/startupark/api/startupark/switch-to-startup`,
        { role: 'startup' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/startupark/startup-dashboard');
    } else {
      // No form or incomplete form - go to setup
      console.log('5. No/incomplete form, going to setup...');
      navigate('/startupark', { 
        state: { 
          role: 'startup',
          forceSetup: true 
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    // On error, go to setup
    navigate('/startupark', { 
      state: { 
        role: 'startup',
        forceSetup: true 
      }
    });
  } finally {
    setLoading(false);
  }
};

  if (currentRole === 'startup') {
    return (
      <button
        onClick={() => navigate('/startupark/startup-dashboard')}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-white text-sm font-medium transition"
      >
        <span>Go to Startup Dashboard</span>
        <box-icon name='rocket' color="#ffffff" size="xs"></box-icon>
      </button>
    );
  }

  return (
    <button
      onClick={handleStartupRegistration}
      disabled={loading}
      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-full text-white text-sm font-medium transition disabled:opacity-50"
    >
      {loading ? (
        <span className="text-sm">Checking...</span>
      ) : (
        <>
          <span>Reg as Startup</span>
          <box-icon name='rocket' color="#ffffff" size="xs"></box-icon>
        </>
      )}
    </button>
  );
};

export default RoleSwitcher;