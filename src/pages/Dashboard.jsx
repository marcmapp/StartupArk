import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HyperText from "../components/HyperText";
import Loader from "../components/Loader";
import { getImageUrl } from "../utils/imageUrls";
import "boxicons";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const ROLE_ROUTES = {
  startup: '/startupark/startup-dashboard',
  student: '/startupark/student-dashboard',
  user: '/startupark/user-dashboard',
};

const ROLE_META = {
  startup: { label: 'Startup Dashboard', icon: 'rocket', description: 'Manage your startup, post opportunities, and connect with talent.' },
  student: { label: 'Student Dashboard', icon: 'graduation', description: 'Explore internships, apply to opportunities, and build your career.' },
  user: { label: 'User Dashboard', icon: 'user', description: 'Browse startups, book meetings, and explore the ecosystem.' },
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [roleStatus, setRoleStatus] = useState(null); // { startuparkRole, agreements, profiles }
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.allSettled([
      axios.get(`${baseUrl}/api/mappuser/me`, { headers }),
      axios.get(`${baseUrl}/startupark/api/role`, { headers }),
    ]).then(([meRes, roleRes]) => {
      if (meRes.status === 'fulfilled') setUser(meRes.value.data);
      else { navigate("/login"); return; }
      if (roleRes.status === 'fulfilled') setRoleStatus(roleRes.value.data);
    });
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return <Loader />;

  const role = user.startuparkRole;
  const roleMeta = role ? ROLE_META[role] : null;
  const avatarUrl = (user.profilePicture || user.profileImage) ? getImageUrl(user.profilePicture || user.profileImage) : null;

  // Setup is complete only when a role is chosen AND that role's profile exists.
  const profileComplete = !!(role && roleStatus?.profiles?.[role]);
  const agreed = !!(role && roleStatus?.agreements?.[role]);
  // Resume target: setup flow figures out the right step from saved progress.
  const setupIncomplete = role && !profileComplete;

  const primaryAction = () => {
    if (!role) return navigate('/startupark');         // pick a role
    if (setupIncomplete) return navigate('/startupark'); // resume setup
    navigate(ROLE_ROUTES[role]);                          // enter dashboard
  };

  const primaryLabel = !role
    ? 'Set Up Your Profile'
    : setupIncomplete
      ? (agreed ? 'Finish Your Profile' : 'Continue Setup')
      : `Go to ${roleMeta?.label}`;

  const modules = [
    { label: 'Explore Startups', icon: 'search', to: '/startupark/startupsList' },
    { label: 'Browse Products', icon: 'box', to: '/products' },
    { label: 'Career LaunchPad', icon: 'briefcase', to: '/startupark/projectark?mode=role' },
    { label: 'Bookings', icon: 'calendar', to: role === 'startup' ? '/startupark/manage-bookings' : '/startupark/my-bookings' },
    { label: 'Chat', icon: 'chat', to: '/startupark/chat' },
    { label: 'Events', icon: 'calendar-event', to: '/startupark/events' },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-8">

      {/* Welcome header — mono glass */}
      <div className="glass-panel p-6 sm:p-7 mb-6">
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.username} className="w-14 h-14 rounded-2xl object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xl font-bold flex-shrink-0">
                {user.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                Welcome, <HyperText>{user.username}</HyperText>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                Your hub for startup discovery, connections, and growth.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-3xl font-mono font-bold text-zinc-900 dark:text-white tabular-nums">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
            <p className="font-medium text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: StartupArk entry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8">
            <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-zinc-900 dark:bg-white blur-3xl" />
            </div>
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
                  {role ? (setupIncomplete ? 'Setup In Progress' : 'Your Space') : 'Get Started'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  {roleMeta ? roleMeta.label : 'Enter StartupArk'}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md text-sm">
                  {setupIncomplete
                    ? "You started setting up but haven't finished. Complete your profile to unlock your dashboard."
                    : roleMeta ? roleMeta.description
                    : "Choose your role as a User, Startup, or Student and unlock your personalized experience."}
                </p>
              </div>
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] items-center justify-center flex-shrink-0 text-zinc-700 dark:text-zinc-200">
                <box-icon name={roleMeta?.icon || 'rocket'} type="solid" color="currentColor" size="28px"></box-icon>
              </div>
            </div>

            {setupIncomplete && (
              <div className="relative mt-5 mb-4 flex items-center gap-3">
                {['Role', 'Terms', 'Profile'].map((s, i) => {
                  const done = i === 0 ? true : i === 1 ? agreed : profileComplete;
                  return (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-black/[0.06] dark:bg-white/10 text-zinc-400'}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{s}</span>
                      {i < 2 && <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />}
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={primaryAction} className="btn-mono mt-5 px-6 py-3">
              <box-icon name="right-arrow-circle" type="solid" size="18px" color="currentColor"></box-icon>
              {primaryLabel}
            </button>
          </div>

          {/* Module grid — mono */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {modules.map(({ label, icon, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex flex-col items-center justify-center gap-2 p-4 glass-card hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all"
              >
                <div className="text-zinc-700 dark:text-zinc-200">
                  <box-icon name={icon} type="solid" size="24px" color="currentColor"></box-icon>
                </div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.username} className="w-11 h-11 rounded-full object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {user.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-white truncate">{user.username}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Role</span>
                <span className="font-semibold capitalize px-2.5 py-0.5 rounded-full text-xs glass-inset text-zinc-700 dark:text-zinc-200">
                  {role || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Setup</span>
                <span className={`font-medium flex items-center gap-1 text-xs ${profileComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${profileComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {profileComplete ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
            {setupIncomplete && (
              <button onClick={() => navigate('/startupark')} className="btn-mono w-full mt-4 py-2.5 text-sm">
                Complete Setup →
              </button>
            )}
            {!role && (
              <button onClick={() => navigate('/startupark')} className="btn-mono w-full mt-4 py-2.5 text-sm">
                Set Up Profile →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
