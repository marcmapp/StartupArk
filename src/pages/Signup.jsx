import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const ssoid = import.meta.env.VITE_GOOGLE_SSO_API_KEY;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  const validatePhoneNumber = (number, code) => {
    let regex;
    switch (code) {
      case '+91':
      case '+1':
      case '+44':
        regex = /^[0-9]{10}$/;
        break;
      case '+81':
        regex = /^[0-9]{10,11}$/;
        break;
      case '+61':
        regex = /^[0-9]{9}$/;
        break;
      default: 
        return false;
    }
    return regex.test(number);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!validatePhoneNumber(whatsappNumber, countryCode)) {
      setMessage('Please enter a valid phone number for the selected country.');
      setIsError(true);
      return;
    }

    try {
      await axios.post(`${baseUrl}/api/auth/send-otp`, { email });
      setMessage('OTP sent! Please check your email.');
      setIsOtpSent(true);
    } catch (error) {
      setMessage('Error sending OTP. Please try again.');
      setIsError(true);
    }
  };

const storeAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('userId', user._id); // Explicitly store userId
};

const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setMessage('');
  setIsError(false);

  try {
    // Verify OTP first
    await axios.post(`${baseUrl}/api/auth/verify-otp`, { email, otp });
    
    // Then register the user
    const registerResponse = await axios.post(`${baseUrl}/api/auth/register`, {
      email,
      username,
      password,
      whatsappNumber: `${countryCode}${whatsappNumber}`,
    });

    // Store auth data and redirect
    storeAuthData(registerResponse.data.token, registerResponse.data.user);
    
    setMessage('Signup successful! Redirecting to dashboard...');
    setTimeout(() => navigate('/dashboard'), 500); // Changed to dashboard
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Registration failed. Please try again.';
    setMessage(errorMessage);
    setIsError(true);
    console.error('Registration error:', error);
  }
};

const handleGoogleLoginSuccess = async (response) => {
  try {
    const { credential } = response;
    const result = await axios.post(`${baseUrl}/api/auth/google-login`, { 
      token: credential 
    });

    // Store auth data
    storeAuthData(result.data.token, result.data.user);
    
    console.log('Google Login Success:', result.data);
    setMessage('Google login successful! Redirecting...');
    setTimeout(() => navigate('/dashboard'), 500);
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        'Google login failed. Please try again.';
    setMessage(errorMessage);
    setIsError(true);
    console.error('Google Login Error:', error);
  }
};
  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In Error:', error);
    setMessage('Google signup failed. Please try again.');
    setIsError(true);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-8 lg:p-12">
      <form
        onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}
        className="bg-black p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl w-full max-w-md border-2 border-white relative"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-green-500 text-center">
          {isOtpSent ? 'Verify OTP' : 'SIGN UP'}
        </h2>

        {message && (
          <div
            className={`mb-4 p-2 rounded text-center ${
              isError ? 'bg-red-800 text-red-300' : 'bg-green-800 text-green-300'
            }`}
          >
            {message}
          </div>
        )}

        {!isOtpSent && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-black border border-gray-600 text-white rounded focus:ring-4 focus:ring-white transition duration-300"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-4 bg-black border border-gray-600 text-white rounded focus:ring-4 focus:ring-white transition duration-300"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-black border border-gray-600 text-white rounded focus:ring-4 focus:ring-white transition duration-300"
              required
            />
            <div className="flex mb-4">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-1/4 p-3 bg-black border border-gray-600 text-white rounded-l focus:ring-4 focus:ring-white transition duration-300"
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
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-3/4 p-3 bg-black border border-gray-600 text-white rounded-r focus:ring-4 focus:ring-white transition duration-300"
                required
              />
            </div>
          </>
        )}

        {isOtpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-4 bg-black border border-gray-600 text-white rounded focus:ring-4 focus:ring-white transition duration-300"
              required
            />
          </>
        )}

        <button
          type="submit"
          className="w-full p-3 mt-4 bg-white hover:bg-black hover:text-white hover:border-white text-black border-2 border-black font-semibold rounded-lg shadow-md focus:ring-4 focus:ring-white transition duration-300"
        >
          {isOtpSent ? 'Verify OTP' : 'Send OTP'}
        </button>

        <p className="mt-4 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-500 font-bold text-lg hover:underline">
            Login
          </Link>
        </p>
        {isOtpSent && (
          <div className="mt-4 text-center">
            <Link to="/signup" className="text-red-500 hover:underline">
              Go back to Signup
            </Link>
          </div>
        )}
        <div className="my-4 text-center text-gray-400">OR</div>
<hr className="my-4 border-t-2 border-gray-600" />

<GoogleOAuthProvider clientId={ssoid}>
      
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleFailure}
        />
     
    </GoogleOAuthProvider>
        
      </form>
    </div>
  );
};

export default Signup;
