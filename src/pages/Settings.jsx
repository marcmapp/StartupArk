import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const StatusBanner = ({ status }) => {
  if (!status.text) return null;
  return (
    <div className={`mb-4 p-3 rounded-lg text-sm border ${
      status.type === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40'
    }`}>
      {status.text}
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { darkMode, toggleTheme } = useTheme();

  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [profileStatus, setProfileStatus] = useState({ text: '', type: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ text: '', type: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('notifPrefs')) || { email: true, push: true };
    } catch {
      return { email: true, push: true };
    }
  });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/mappuser/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileForm({ username: res.data.username || '', email: res.data.email || '' });
      } catch (error) {
        console.error(error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus({ text: '', type: '' });
    try {
      const res = await axios.put(
        `${baseUrl}/api/mappuser/profile`,
        { username: profileForm.username.trim(), email: profileForm.email.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
      setProfileStatus({ text: 'Profile updated.', type: 'success' });
    } catch (error) {
      setProfileStatus({ text: error.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ text: '', type: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }

    setPasswordSaving(true);
    try {
      await axios.put(
        `${baseUrl}/api/mappuser/password`,
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ text: 'Password updated.', type: 'success' });
    } catch (error) {
      setPasswordStatus({ text: error.response?.data?.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const toggleNotifPref = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notifPrefs', JSON.stringify(next));
      return next;
    });
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Settings</h1>

      <div className="glass-card overflow-hidden">
        <div className="flex gap-1 p-2 border-b border-black/10 dark:border-white/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">General Settings</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Update your username and email address.</p>
              </div>

              <StatusBanner status={profileStatus} />

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                  className="input-mono"
                  required
                  disabled={profileSaving}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  className="input-mono"
                  required
                  disabled={profileSaving}
                />
              </div>

              <button type="submit" disabled={profileSaving} className="btn-mono w-full py-2.5">
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Choose how MAPP ARKS looks on this device.</p>
              </div>

              <div className="flex items-center justify-between glass-inset px-4 py-3">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Theme</span>
                <div className="flex gap-1 p-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06]">
                  <button
                    onClick={() => darkMode && toggleTheme()}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      !darkMode
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => !darkMode && toggleTheme()}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      darkMode
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Security</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Change your password.</p>
              </div>

              <StatusBanner status={passwordStatus} />

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="input-mono"
                  required
                  disabled={passwordSaving}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="input-mono"
                  required
                  minLength={8}
                  disabled={passwordSaving}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="input-mono"
                  required
                  minLength={8}
                  disabled={passwordSaving}
                />
              </div>

              <button type="submit" disabled={passwordSaving} className="btn-mono w-full py-2.5">
                {passwordSaving ? 'Updating…' : 'Update Password'}
              </button>

              <div className="flex items-center justify-between glass-inset px-4 py-3 mt-2 opacity-60">
                <div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">Two-factor authentication</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Coming soon</p>
                </div>
                <input type="checkbox" disabled className="w-4 h-4 rounded" />
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Preferences are saved on this device.</p>
              </div>

              <label className="flex items-center justify-between glass-inset px-4 py-3 cursor-pointer">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Email notifications</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.email}
                  onChange={() => toggleNotifPref('email')}
                  className="w-4 h-4 rounded"
                />
              </label>
              <label className="flex items-center justify-between glass-inset px-4 py-3 cursor-pointer">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Push notifications</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.push}
                  onChange={() => toggleNotifPref('push')}
                  className="w-4 h-4 rounded"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
