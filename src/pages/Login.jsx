import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, storageService } from '../services/auth';
import AuthBrandPanel from '../components/AuthBrandPanel';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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


  const getErrorMessage = (error) => {
    // Network errors (no response from server)
    if (!error.response) {
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      return 'Network error occurred. Please try again.';
    }

    const { status, data } = error.response;

    // Server-specific error messages
    if (data?.message) {
      // Handle specific backend error messages
      const backendMessage = data.message.toLowerCase();
      
      if (backendMessage.includes('password') || backendMessage.includes('credentials')) {
        return 'Invalid username or password. Please try again.';
      }
      if (backendMessage.includes('user not found') || backendMessage.includes('user not exist')) {
        return 'No account found with this username. Please check your credentials.';
      }
      if (backendMessage.includes('account locked') || backendMessage.includes('suspended')) {
        return 'Your account has been temporarily locked. Please contact support.';
      }
      if (backendMessage.includes('email not verified')) {
        return 'Please verify your email address before logging in.';
      }
      
      return data.message;
    }

    // HTTP status code based messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid username or password. Please try again.';
      case 403:
        return 'Access denied. Your account may be suspended or restricted.';
      case 404:
        return 'Authentication service not available. Please try again later.';
      case 422:
        return 'Invalid input data. Please check your credentials.';
      case 429:
        return 'Too many login attempts. Please wait a few minutes before trying again.';
      case 500:
        return 'Server error. Our team has been notified. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
      case 503:
        return 'Service maintenance in progress. Please try again later.';
      default:
        return `Login failed. Please try again. (Error: ${status})`;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    // Clear any existing token before login attempt
  localStorage.removeItem('token');
  localStorage.removeItem('user');

    if (!username.trim() || !password.trim()) {
      setMessage('Please enter both username and password.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.login({
        username: username.trim(),
        password,
      });

      // Use storageService from auth services
      storageService.setAuthData(result.token, result.user);

      setMessage('Login successful! Redirecting...');
      setIsError(false);
      
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage);
      setIsError(true);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async (response) => {
    if (response.error) {
      const errorMessage = response.error === 'popup_closed_by_user'
        ? 'Google sign-in was cancelled'
        : response.error === 'access_denied'
        ? 'Google sign-in was denied'
        : 'Google sign-in failed. Please try again.';
      
      setMessage(errorMessage);
      setIsError(true);
      console.error('Google auth error:', response.error);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${baseUrl}/api/mappauth/google-login`, {
        token: response.credential,
      });

      // Use same storage method as regular login
      storeAuthData(res.data.token, res.data.user);

      setMessage('Google login successful! Redirecting...');
      setIsError(false);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      setMessage(errorMessage);
      setIsError(true);
      console.error('Google login error:', error);
      
      // Optional: Clear partial auth data if error occurred
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="glass-card shadow-xl w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left brand panel */}
        <AuthBrandPanel
          eyebrow="Welcome back"
          title="Log in to MAPP ARKS"
          subtitle="Your hub for startup discovery, connections, and growth."
        />

        {/* Right form panel */}
        <form onSubmit={handleLogin} className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-zinc-900 dark:text-white">Login</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Enter your credentials to continue.</p>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-center text-sm border ${
              isError
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300'
                : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            }`}>
              {message}
            </div>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-mono mb-4"
            required
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-mono"
            required
            disabled={isLoading}
          />
          <div className="text-right mt-1.5 mb-5">
            <Link to="/forgot-password" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={isLoading} className="btn-mono w-full py-3">
            {isLoading ? 'Logging in…' : 'Login'}
          </button>

          <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-zinc-900 dark:text-white font-bold hover:underline">Sign Up</Link>
          </p>

          <div className="my-4 flex items-center gap-3 text-zinc-400 dark:text-zinc-600 text-xs">
            <div className="flex-1 h-px bg-black/10 dark:bg-white/10" /> OR <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          </div>

          <div className="flex justify-center">
            <div id="google-signin-btn" className={isLoading ? 'opacity-50 pointer-events-none' : ''}></div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="text-zinc-900 dark:text-white font-medium">Processing…</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;