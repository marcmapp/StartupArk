import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../../../../components/Loader';
import { getImageUrl } from '../../../../../../utils/imageUrls';
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

export default function StartupDashboard() {
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios.get(`${baseUrl}/startupark/api/profile/startup`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setStartup(r.data?.profile || null))
      .catch(err => {
        if (err.response?.status === 401) navigate('/login');
        else setError(err.response?.data?.error || 'Failed to load');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <Loader />;

  if (error || !startup) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-zinc-500 dark:text-zinc-400">{error || 'No startup profile found.'}</p>
      <button onClick={() => navigate('/startupark')} className="btn-mono">Set Up Profile</button>
    </div>
  );

  const companyName = startup.companyName || startup.startupName || 'Your Startup';
  const logoUrl = startup.logo ? getImageUrl(startup.logo, baseUrl) : null;
  const hasAvailability = startup.availability?.days?.length > 0;

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
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="w-16 h-16 rounded-2xl object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Startup Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{companyName}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{startup.tagline || startup.industry || 'Building the future'}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => navigate('/startupark/startup-profile')} className="btn-ghost">
              <box-icon name="show" type="solid" size="16px" color="currentColor" />
              View
            </button>
            <button onClick={() => navigate('/startupark/startup-edit-profile')} className="btn-mono">
              <box-icon name="edit" type="solid" size="16px" color="currentColor" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Availability status — surfaced up top since it gates whether users
          can even book this startup (semantic colors kept). */}
      <div className={`p-5 rounded-2xl border mb-6 ${hasAvailability ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${hasAvailability ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
              <box-icon name="calendar" type="solid" color="currentColor" size="18px" />
            </div>
            <div className="min-w-0">
              <p className={`font-semibold text-sm ${hasAvailability ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                {hasAvailability ? 'Availability Set' : 'No Availability Set'}
              </p>
              <p className={`text-xs truncate ${hasAvailability ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {hasAvailability
                  ? `${startup.availability.days.join(', ')} · ${startup.availability.timeRange?.start || ''} – ${startup.availability.timeRange?.end || ''}`
                  : 'Users cannot book meetings until you set your availability'}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/startupark/startup-profile')}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${hasAvailability ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30' : 'text-amber-700 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-900/30'}`}>
            {hasAvailability ? 'Edit' : 'Set'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Team Members" value={startup.team?.length || 0} icon="group" />
        <StatCard label="Products" value={startup.products?.length || '—'} icon="box" />
        <StatCard label="Gallery Items" value={startup.gallery?.length || 0} icon="image-alt" />
        <StatCard label="Funding Stage" value={startup.fundingStage || '—'} icon="rocket" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-bold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard title="View Startup Profile" desc="See your public-facing page" icon="show" onClick={() => navigate('/startupark/startup-profile')} />
              <ActionCard title="Manage Bookings" desc="Review meeting requests" icon="calendar-check" onClick={() => navigate('/startupark/manage-bookings')} />
              <ActionCard title="My Products" desc="Manage product listings" icon="box" onClick={() => navigate('/products')} />
              <ActionCard title="Job Postings" desc="Post roles & find talent" icon="briefcase" onClick={() => navigate('/startupark/projectark?mode=role')} />
              <ActionCard title="Messages" desc="Chats with users & investors" icon="chat" onClick={() => navigate('/startupark/chat')} />
              <ActionCard title="Events" desc="Manage & join startup events" icon="calendar-event" onClick={() => navigate('/startupark/startup/events')} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">At a Glance</p>
            <div className="space-y-2.5">
              {[
                { label: 'Industry', value: startup.industry || 'Not set' },
                { label: 'Stage', value: startup.fundingStage || 'Not set' },
                { label: 'Team Size', value: startup.teamSize || `${startup.team?.length || 0} members` },
                { label: 'Location', value: (typeof startup.location === 'object' ? [startup.location?.city, startup.location?.state].filter(Boolean).join(', ') : startup.location) || 'Not set' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400 flex-shrink-0">{label}</span>
                  <span className="text-zinc-900 dark:text-white font-medium text-right truncate max-w-[140px]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Manage</p>
            {[
              { label: 'Applications', icon: 'notepad', to: '/startupark/projectark?mode=role' },
              { label: 'Edit Profile', icon: 'edit', to: '/startupark/startup-edit-profile' },
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
