import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HyperText from "../components/HyperText";
import Loader from "../components/Loader";
import BillboardSection from "../components/hub/BillboardSection";
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

// Rotating one-liners for the inline Guide widget — a taste of what's in the
// full guide, not a duplicate of it. Generic across roles on purpose; the
// full breakdown at /guide is where role-specific detail lives.
const GUIDE_TIPS = [
  { icon: 'layout', text: "The Hub is your cross-product switcher — jump between StartupArk, Flowboard, and DocArc from the dock." },
  { icon: 'bell', text: "The bell in the header surfaces bookings, proposals, and replies that need your attention." },
  { icon: 'search', text: "Use search to find people, startups, and posts without leaving the page you're on." },
  { icon: 'id-card', text: "Your profile is shared across every product — update it once in Settings." },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [roleStatus, setRoleStatus] = useState(null); // { startuparkRole, agreements, profiles }
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tipIndex, setTipIndex] = useState(0);
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

  useEffect(() => {
    const timer = setInterval(() => setTipIndex((i) => (i + 1) % GUIDE_TIPS.length), 4500);
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

  const tip = GUIDE_TIPS[tipIndex];
  // Once a role's set up, the Hub's dock already gets you into that product —
  // this card only needs to exist while onboarding isn't finished yet.
  const showSetupCard = !role || setupIncomplete;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-8">

      {/* Welcome header — mono glass */}
      <div className="glass-panel p-6 sm:p-7 mb-6">
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <div className="h-full w-1/4 bg-gradient-to-r from-transparent via-zinc-900/30 dark:via-white/40 to-transparent animate-hud-sweep" />
        </div>
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

      {/* Billboard — the hub's main event: events + newsletter, front and center.
          Everything below it is status, not navigation. */}
      <div className="mb-6">
        <BillboardSection />
      </div>

      <div className={`grid grid-cols-1 gap-5 ${showSetupCard ? 'md:grid-cols-2' : ''}`}>
        {/* Your space — setup status / entry point into StartupArk. Only shown
            while onboarding isn't finished; once a role's set up, the dock
            already gets you into that product. */}
        {showSetupCard && (
          <div className="glass-card relative overflow-hidden p-5">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-zinc-900/[0.04] dark:bg-white/[0.06] blur-3xl pointer-events-none" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {role ? 'Setup in progress' : 'Get started'}
                </p>
                <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                  {roleMeta ? roleMeta.label : 'Enter StartupArk'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 text-zinc-700 dark:text-zinc-200">
                <box-icon name={roleMeta?.icon || 'rocket'} type="solid" color="currentColor" size="20px"></box-icon>
              </div>
            </div>

            <div className="relative mt-4 mb-1 flex items-center gap-2">
              {['Role', 'Terms', 'Profile'].map((s, i) => {
                const done = i === 0 ? true : i === 1 ? agreed : profileComplete;
                return (
                  <div key={s} className="flex items-center gap-1.5 flex-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${done ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-black/[0.06] dark:bg-white/10 text-zinc-400'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    {i < 2 && <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />}
                  </div>
                );
              })}
            </div>

            <button onClick={primaryAction} className="btn-mono w-full mt-4 py-2.5 text-sm">
              {primaryLabel}
            </button>
          </div>
        )}

        {/* Guide — interactive, inline. Full breakdown lives at /guide. */}
        <button
          onClick={() => navigate('/guide')}
          className="hud-grid text-zinc-900 dark:text-white relative overflow-hidden p-5 text-left glass-card
                     hover:border-zinc-400/60 dark:hover:border-white/25 hover:-translate-y-0.5 transition-all duration-300 group"
          style={{ backgroundSize: '20px 20px' }}
        >
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-zinc-900/[0.04] dark:bg-white/[0.06] blur-3xl pointer-events-none" />
          <div className="relative flex items-start justify-between gap-3 mb-3">
            <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Guide</p>
            <div className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 text-zinc-700 dark:text-zinc-200">
              <box-icon name="help-circle" type="solid" color="currentColor" size="20px"></box-icon>
            </div>
          </div>
          <div key={tipIndex} className="relative animate-fade-in min-h-[52px]">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0 text-zinc-400 dark:text-zinc-500">
                <box-icon name={tip.icon} size="16px" color="currentColor"></box-icon>
              </span>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">{tip.text}</p>
            </div>
          </div>
          <div className="relative flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              {GUIDE_TIPS.map((_, i) => (
                <span key={i} className={`h-1 rounded-full transition-all ${i === tipIndex ? 'w-4 bg-zinc-900 dark:bg-white' : 'w-1 bg-black/15 dark:bg-white/15'}`} />
              ))}
            </div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
              Open guide
              <box-icon name="chevron-right" size="14px" color="currentColor"></box-icon>
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
