import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const ssoid = import.meta.env.VITE_GOOGLE_SSO_API_KEY;

  useEffect(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: ssoid,
        callback: handleGoogleSignIn,
      });
  
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large' }
      );
    } else {
      console.error("Google Identity Services library not loaded.");
    }
  }, []);

// Auth storage helper (can be moved to authHelpers.js)
const storeAuthData = (token, user) => {
  console.log('Storing user data:', user);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('userId', user.id || user._id); // Handle both cases
};

const handleLogin = async (e) => {
  e.preventDefault();
  setMessage('');
  setIsError(false);

  try {
    const res = await axios.post(`${baseUrl}/api/auth/login`, {
      username,
      password,
    });

    // Use centralized storage method
    storeAuthData(res.data.token, res.data.user);

    setMessage('Login successful! Redirecting...');
    setTimeout(() => navigate('/dashboard'), 500);
  } catch (error) {
    let errorMessage = 'Login failed. Please check your credentials.';
    
    if (error.response) {
      errorMessage = error.response.data?.message || 
                   error.response.statusText || 
                   'Authentication error occurred';
      
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }

    setMessage(errorMessage);
    setIsError(true);
    console.error('Login error:', error);
  }
};

const handleGoogleSignIn = async (response) => {
  if (response.error) {
    const errorMessage = response.error === 'popup_closed_by_user'
      ? 'Google sign-in was cancelled'
      : 'Google sign-in failed. Please try again.';
    
    setMessage(errorMessage);
    setIsError(true);
    console.error('Google auth error:', response.error);
    return;
  }

  try {
    const res = await axios.post(`${baseUrl}/api/auth/google-login`, {
      token: response.credential,
    });

    // Use same storage method as regular login
    storeAuthData(res.data.token, res.data.user);

    setMessage('Google login successful! Redirecting...');
    setTimeout(() => navigate('/dashboard'), 500);
  } catch (error) {
    let errorMessage = 'Google login failed. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    setMessage(errorMessage);
    setIsError(true);
    console.error('Google login error:', error);
    
    // Optional: Clear partial auth data if error occurred
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <form
        onSubmit={handleLogin}
        className="p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl w-full max-w-md border-2 dark:border-white border-black relative"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">LOGIN</h2>

        {message && (
          <div className={`mb-4 p-2 rounded text-center ${isError ? 'bg-red-800 text-red-300' : 'bg-green-800 text-green-300'}`}>
            {message}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-600 text-white rounded focus:ring-4 focus:ring-white transition duration-300"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-600 text-white rounded focus:ring-4 focus:ring-white transition duration-300"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-white border-2 border-black text-black hover:bg-black hover:text-white hover:border-white font-bold rounded-lg focus:ring-4 focus:ring-cyan-500 transition duration-300 shadow-md"
        >
          Login
        </button>

        <p className="mt-4 text-center ">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-cyan-500 font-bold text-lg hover:underline">
            Sign Up
          </Link>
        </p>

       <div className="my-4 text-center text-gray-400">OR</div>
       <hr className="my-4 border-t-2 border-gray-600" />
        <div className="mt-6 border-2 dark:border-white border-black" id="google-signin-btn"></div>

      </form>
    </div>
  );
};

export default LoginPage;
