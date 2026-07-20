import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import { getImageUrl } from '../utils/imageUrls';
import 'boxicons';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        setIsLoading(true);
        const [userRes, subRes] = await Promise.allSettled([
          axios.get(`${baseUrl}/api/mappuser/me`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${baseUrl}/api/mappuser/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
          setEditForm({
            username: userRes.value.data.username,
            email: userRes.value.data.email,
            whatsappNumber: userRes.value.data.whatsappNumber,
          });
        }
        // Subscriptions are per-product (keyed by productId, e.g. "startupArk");
        // surface the first active one, if any.
        if (subRes.status === 'fulfilled') {
          const subs = subRes.value.data.subscriptions || {};
          const activeEntry = Object.entries(subs).find(([, s]) => s?.status === 'active');
          setSubscription(activeEntry ? activeEntry[1] : null);
        } else {
          setSubscription(null);
        }
      } catch (e) {
        console.error(e);
        showMessage('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const r = await axios.put(`${baseUrl}/api/mappuser/profile`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      setUser(r.data.user);
      setIsEditing(false);
      showMessage('Profile updated successfully!', 'success');
    } catch (e) {
      showMessage(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const isSubscriptionActive = () => subscription?.expiryDate && new Date(subscription.expiryDate) > new Date();

  if (isLoading && !user) return <Loader />;
  if (!user) return null;

  const name = user.username || 'User';
  const avatarUrl = user.profilePicture ? getImageUrl(user.profilePicture, baseUrl) : null;
  const Pill = ({ children }) => (
    <span className="px-3 py-1 rounded-full text-xs font-medium glass-inset text-zinc-700 dark:text-zinc-200 capitalize">{children}</span>
  );
  const Row = ({ label, value }) => (
    <div>
      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">{label}</p>
      <p className="text-zinc-900 dark:text-white text-lg font-semibold mt-0.5">{value || '—'}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header banner */}
      <div className="glass-panel p-6 sm:p-8 mb-6">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-zinc-900 dark:bg-white blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-2xl object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-0.5">My Profile</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{name}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <box-icon name="log-out-circle" size="16px" color="currentColor" /> Logout
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center border ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Basic Information</h2>
              <button onClick={() => setIsEditing(!isEditing)} className={isEditing ? 'btn-ghost' : 'btn-mono'}>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Row label="Username" value={user.username} />
                  <Row label="Email" value={user.email} />
                  <Row label="WhatsApp Number" value={user.whatsappNumber} />
                  <Row label="Member Since" value={formatDate(user.createdAt)} />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Pill>{user.startuparkRole || 'User'}</Pill>
                  <Pill>{user.subscriptionPlan || 'Basic'} plan</Pill>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
                    <input type="text" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="input-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
                    <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">WhatsApp Number</label>
                  <input type="text" value={editForm.whatsappNumber || ''} onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })} className="input-mono" />
                </div>
                <button type="submit" disabled={isLoading} className="btn-mono w-full py-3 disabled:opacity-50">
                  {isLoading ? 'Updating…' : 'Update Profile'}
                </button>
              </form>
            )}
          </div>

          {/* Agreement status */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Agreement Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { ok: user.hasAgreedTostartuparkUser, label: 'StartupArk User', show: true },
                { ok: user.hasAgreedTostartuparkStartup, label: 'StartupArk Startup', show: user.startuparkRole === 'startup' },
                { ok: user.hasAgreedTostartuparkStudent, label: 'StartupArk Student', show: user.startuparkRole === 'student' },
              ].filter(a => a.show).map(({ ok, label }) => (
                <div key={label} className="flex items-center gap-2 glass-inset rounded-xl px-3 py-2.5">
                  <box-icon name={ok ? 'check-circle' : 'x-circle'} color={ok ? '#10B981' : '#EF4444'} size="18px" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-200">{label}: <span className="font-medium">{ok ? 'Agreed' : 'Not Agreed'}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Subscription */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Subscription</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Current Plan</span>
                <Pill>{subscription?.plan || 'Basic'}</Pill>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  isSubscriptionActive()
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}>
                  {isSubscriptionActive() ? 'Active' : 'Inactive'}
                </span>
              </div>
              {subscription?.expiryDate && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Expires</span>
                  <span className="text-zinc-900 dark:text-white font-medium">{formatDate(subscription.expiryDate)}</span>
                </div>
              )}
              <button onClick={() => navigate('/pricing')} className="btn-mono w-full py-2.5 mt-2">Upgrade Plan</button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Go to Dashboard', to: '/dashboard' },
                { label: 'Explore StartupArk', to: '/startupark' },
                { label: 'My Favorites', to: '/startupark/favorites' },
              ].map(({ label, to }) => (
                <button key={to} onClick={() => navigate(to)} className="btn-ghost w-full justify-start">{label}</button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Account Stats</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Favorites</span>
                <span className="text-zinc-900 dark:text-white font-medium">{user.favorites?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Last Active</span>
                <span className="text-zinc-900 dark:text-white font-medium">{formatDate(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
