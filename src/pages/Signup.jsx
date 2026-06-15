import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authService, storageService } from '../services/auth';
import AuthBrandPanel from '../components/AuthBrandPanel';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    whatsappNumber: '',
    countryCode: '+91'
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  
  const ssoid = import.meta.env.VITE_GOOGLE_SSO_API_KEY;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password || !formData.whatsappNumber) {
      showMessage('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showMessage('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      showMessage('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const validatePhoneNumber = (number, code) => {
    let regex;
    switch (code) {
      case '+91': // India
        regex = /^[6-9]\d{9}$/;
        break;
      case '+1': // US/Canada
        regex = /^\d{10}$/;
        break;
      case '+44': // UK
        regex = /^\d{10,11}$/;
        break;
      case '+81': // Japan
        regex = /^\d{9,10}$/;
        break;
      case '+61': // Australia
        regex = /^\d{9}$/;
        break;
      default: 
        return /^\d{8,15}$/.test(number);
    }
    return regex.test(number);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!validateForm()) return;

    if (!validatePhoneNumber(formData.whatsappNumber, formData.countryCode)) {
      showMessage('Please enter a valid phone number for the selected country');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendOTP(formData.email);
      setIsOtpSent(true);
      showMessage('OTP sent to your email! Please check your inbox.', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify OTP first
      await authService.verifyOTP(formData.email, otp);
      
      // Register user
      const fullWhatsappNumber = `${formData.countryCode}${formData.whatsappNumber}`;
      const result = await authService.register({
        ...formData,
        whatsappNumber: fullWhatsappNumber,
        otp
      });

      // Store auth data
      storageService.setAuthData(result.token, result.user);
      
      showMessage('Registration successful! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    setIsLoading(true);
    try {
      const result = await authService.googleLogin(response.credential);
      storageService.setAuthData(result.token, result.user);
      showMessage('Google login successful! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In Error:', error);
    showMessage('Google signup failed. Please try again.');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="glass-card shadow-xl w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left brand panel */}
        <AuthBrandPanel
          eyebrow={isOtpSent ? 'Verify Access' : 'Create Account'}
          title="Join MAPP ARKS"
          subtitle="Create your account to discover startups, connect with founders, and grow."
        />

        {/* Right form panel */}
        <form
          onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}
          className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1">
            {isOtpSent ? 'Verify OTP' : 'Sign Up'}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            {isOtpSent ? 'Enter the code we sent to your email.' : 'A few details to get you started.'}
          </p>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-center text-sm border ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40'
              }`}
            >
              {message.text}
            </div>
          )}

          {!isOtpSent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="input-mono sm:col-span-2"
                required
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => updateFormData('username', e.target.value)}
                className="input-mono"
                required
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className="input-mono"
                required
                disabled={isLoading}
              />
              <div className="flex sm:col-span-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => updateFormData('countryCode', e.target.value)}
                  className="input-mono w-1/4 rounded-r-none"
                  disabled={isLoading}
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+81">+81</option>
                  <option value="+61">+61</option>
                </select>
                <input
                  type="tel"
                  placeholder="WhatsApp Number"
                  value={formData.whatsappNumber}
                  onChange={(e) => updateFormData('whatsappNumber', e.target.value)}
                  className="input-mono w-3/4 rounded-l-none border-l-0"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-mono mb-4"
              required
              disabled={isLoading}
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-mono w-full p-3 mt-5 disabled:opacity-50"
          >
            {isLoading ? 'Processing…' : (isOtpSent ? 'Verify OTP' : 'Send OTP')}
          </button>

          <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-zinc-900 dark:text-white font-bold hover:underline">
              Login
            </Link>
          </p>

          {isOtpSent && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:underline"
                disabled={isLoading}
              >
                ← Go back to Signup
              </button>
            </div>
          )}

        <div className="my-4 text-center text-zinc-500">OR</div>
        <hr className="my-4 border-t border-white/10" />

        <GoogleOAuthProvider clientId={ssoid}>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleFailure}
              disabled={isLoading}
            />
          </div>
        </GoogleOAuthProvider>
        </form>
      </div>
    </div>
  );
};

export default Signup;