import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../../../components/Loader';
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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    Promise.allSettled([
      axios.get(`${baseUrl}/api/mappuser/me`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${baseUrl}/startupark/api/profile/student`, { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([u, p]) => {
      setUser(u.status === 'fulfilled' ? u.value.data : null);
      setProfile(p.status === 'fulfilled' ? p.value.data?.profile : null);
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [navigate]);

  if (loading || !user) return <Loader />;

  const name = user.username || user.email || 'Student';
  const avatarKey = profile?.profilePicture || user.profilePicture || user.profileImage;
  const avatarUrl = avatarKey ? getImageUrl(avatarKey, baseUrl) : null;
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const hasProfile = !!(profile?.institution && profile?.course);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Student Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Welcome, {name}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                {profile?.institution ? `${profile.institution} · ${profile.course || ''}` : 'Continue your journey to career success.'}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/startupark/launchpad')} className="btn-mono shrink-0">
            <box-icon name="briefcase" type="solid" size="16px" color="currentColor" />
            Career LaunchPad
          </button>
        </div>
      </div>

      {/* Profile completion alert (semantic amber kept) */}
      {!hasProfile && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
            <box-icon name="error" type="solid" color="currentColor" size="20px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Complete Your Profile</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Add your education details to get matched with startups.</p>
          </div>
          <button onClick={() => navigate('/startupark/edit-profile')} className="shrink-0 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors">
            Complete
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Skills" value={skills.length || '—'} icon="code-block" />
        <StatCard label="Applications" value="—" icon="notepad" />
        <StatCard label="Messages" value="—" icon="chat" />
        <StatCard label="Events Joined" value="—" icon="calendar-event" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-bold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard title="Browse Startups" desc="Find startups to apply to" icon="rocket" onClick={() => navigate('/startupark/startupsList')} />
              <ActionCard title="Career LaunchPad" desc="Jobs, internships & opportunities" icon="briefcase" onClick={() => navigate('/startupark/launchpad')} />
              <ActionCard title="Explore Products" desc="Discover startup products" icon="box" onClick={() => navigate('/products')} />
              <ActionCard title="My Meetings" desc="Track your meeting requests" icon="calendar-check" onClick={() => navigate('/startupark/my-bookings')} />
              <ActionCard title="Messages" desc="Chat with founders & mentors" icon="chat" onClick={() => navigate('/startupark/chat')} />
              <ActionCard title="My Profile" desc="Update your student info" icon="user-circle" onClick={() => navigate('/startupark/edit-profile')} />
            </div>
          </div>

          {skills.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-3 text-sm">My Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 8).map((skill, i) => (
                  <span key={i} className="px-3 py-1 glass-inset text-zinc-700 dark:text-zinc-200 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {skills.length > 8 && (
                  <span className="px-3 py-1 glass-inset text-zinc-500 dark:text-zinc-400 rounded-full text-xs">+{skills.length - 8} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile sidebar */}
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
            <div className="space-y-2.5">
              {[
                { label: 'Role', value: 'Student' },
                { label: 'Institution', value: profile?.institution || 'Not set' },
                { label: 'Course', value: profile?.course || 'Not set' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400 flex-shrink-0">{label}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium truncate max-w-[140px] glass-inset text-zinc-700 dark:text-zinc-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Quick Links</p>
            {[
              { label: 'Edit Profile', icon: 'user', to: '/startupark/edit-profile' },
              { label: 'My Meetings', icon: 'calendar-check', to: '/startupark/my-bookings' },
              { label: 'Browse Startups', icon: 'rocket', to: '/startupark/startupsList' },
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
