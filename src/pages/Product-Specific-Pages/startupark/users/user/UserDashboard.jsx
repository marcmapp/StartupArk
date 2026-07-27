import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../../../components/Loader';
import TrustBadge from '../../../../../components/TrustBadge';
import { getImageUrl } from '../../../../../utils/imageUrls';
import 'boxicons';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ label, value, icon }) => (
  <div className="glass-card p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300">
      <box-icon name={icon} type="solid" color="currentColor" size="20px" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ActionCard = ({ title, desc, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 rounded-xl border border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:border-black/10 dark:hover:border-white/20 transition-all duration-200 group"
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300">
        <box-icon name={icon} type="solid" color="currentColor" size="20px" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-zinc-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
      </div>
      <div className="ml-auto flex-shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
        <box-icon name="chevron-right" color="currentColor" size="16px" />
      </div>
    </div>
  </button>
);

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ savedStartups: null, savedProducts: null, bookings: null, unreadMessages: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.allSettled([
      axios.get(`${baseUrl}/api/mappuser/me`, { headers }),
      axios.get(`${baseUrl}/startupark/api/profile/user`, { headers }),
      axios.get(`${baseUrl}/startupark/api/favorites?entityType=startup`, { headers }),
      axios.get(`${baseUrl}/startupark/api/favorites?entityType=product`, { headers }),
      axios.get(`${baseUrl}/startupark/api/bookings`, { headers }),
      axios.get(`${baseUrl}/startupark/api/chat/conversations`, { headers }),
    ]).then(([u, p, savedStartups, savedProducts, bookings, conversations]) => {
      if (u.status === 'fulfilled') setUser(u.value.data); else navigate('/');
      setProfile(p.status === 'fulfilled' ? p.value.data?.profile : null);

      const userId = u.status === 'fulfilled' ? u.value.data?._id : null;
      const unreadMessages = conversations.status === 'fulfilled'
        ? (conversations.value.data?.conversations || []).reduce(
            (sum, c) => sum + (Number(c.unreadCount?.[userId]) || 0), 0)
        : null;

      setStats({
        savedStartups: savedStartups.status === 'fulfilled' ? (savedStartups.value.data?.favorites?.length ?? 0) : null,
        savedProducts: savedProducts.status === 'fulfilled' ? (savedProducts.value.data?.favorites?.length ?? 0) : null,
        bookings: bookings.status === 'fulfilled' ? (bookings.value.data?.bookings?.length ?? 0) : null,
        unreadMessages,
      });
    }).finally(() => setLoading(false));
  }, [navigate]);

  if (loading || !user) return <Loader />;

  const name = user.username || user.email || 'Explorer';
  // Prefer the StartupArk-scoped avatar; fall back to the global user pic.
  const avatarKey = profile?.profilePicture || user.profilePicture || user.profileImage;
  const avatarUrl = avatarKey ? getImageUrl(avatarKey, baseUrl) : null;

  return (
    <div className="max-w-7xl lg:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Welcome banner — mono glass */}
      <div className="glass-panel p-6 sm:p-8 mb-6">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-zinc-900 dark:bg-white blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-zinc-900 dark:bg-white blur-2xl" />
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
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">User Dashboard</p>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Welcome back, {name}</h1>
                <TrustBadge userId={user?._id} />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">Discover startups, book meetings, and explore the ecosystem.</p>
            </div>
          </div>
          <button onClick={() => navigate('/startupark/startupsList')} className="btn-mono shrink-0">
            <box-icon name="search" type="solid" size="16px" color="currentColor" />
            Browse Startups
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Saved Startups" value={stats.savedStartups ?? '—'} icon="bookmark" />
        <StatCard label="My Bookings" value={stats.bookings ?? '—'} icon="calendar-check" />
        <StatCard label="Messages" value={stats.unreadMessages ?? '—'} icon="chat" />
        <StatCard label="Saved Products" value={stats.savedProducts ?? '—'} icon="box" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-bold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard title="Browse Startups" desc="Discover & connect with founders" icon="rocket" onClick={() => navigate('/startupark/startupsList')} />
              <ActionCard title="Saved Startups" desc="Your bookmarked startups" icon="bookmark" onClick={() => navigate('/startupark/favorites')} />
              <ActionCard title="My Bookings" desc="Upcoming meetings & history" icon="calendar-check" onClick={() => navigate('/startupark/my-bookings')} />
              <ActionCard title="Browse Products" desc="Explore startup products" icon="box" onClick={() => navigate('/products')} />
              <ActionCard title="Messages" desc="Chat with founders" icon="chat" onClick={() => navigate('/startupark/chat')} />
              <ActionCard title="Career LaunchPad" desc="Jobs & internships" icon="briefcase" onClick={() => navigate('/startupark/projectark?mode=role')} />
              <ActionCard title="Pitch Yourself to Startups" desc="Post what you're looking for — startups reach out to you" icon="megaphone" onClick={() => navigate('/startupark/projectark/create')} />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">Upcoming Events</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Workshops, talks & startup demos</p>
              </div>
              <button onClick={() => navigate('/startupark/events')} className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                View All
                <box-icon name="chevron-right" color="currentColor" size="16px" />
              </button>
            </div>
          </div>

        </div>

        {/* Profile card */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-zinc-900 dark:text-white truncate">{name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Role', value: user.startuparkRole || 'Explorer' },
                { label: 'Status', value: 'Active', dot: 'bg-emerald-500' },
              ].map(({ label, value, dot }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize glass-inset text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                    {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Account</p>
            {[
              { label: 'Edit Profile', icon: 'user', to: '/startupark/edit-profile' },
              { label: 'My Bookings', icon: 'calendar-check', to: '/startupark/my-bookings' },
            ].map(({ label, icon, to }) => (
              <button key={to} onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-sm text-zinc-700 dark:text-zinc-300 transition-colors">
                <box-icon name={icon} type="solid" color="currentColor" size="16px" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
