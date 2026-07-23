// pages/GuidePage.jsx — Tier 3 C#9 (canvas rework)
// A pannable, zoomable map of the viewer's own nav — scoped to their actual
// role (Startup / Student / User), plus the items that live outside any one
// role ("Everywhere"). Not a cross-role reference; each viewer only sees the
// path that's actually theirs.
//
// Not an interactive tour — that already exists (DockTour); this just links
// out to replay it for anyone who wants the guided version instead of this map.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IconRocket, IconMicrophone, IconFileText, IconLayoutDashboard, IconSettings,
  IconUser, IconCreditCard, IconHome, IconCompass, IconBriefcase2, IconMessage,
  IconBox, IconCalendarEvent, IconNews, IconEdit, IconCalendar, IconCalendarStats,
  IconUsers, IconListCheck, IconActivity, IconHelpCircle, IconArrowLeft,
  IconPlus, IconMinus,
} from '@tabler/icons-react';
import { navRegistry, globalItems } from '../Jsons/NavItems/navRegistry';
import { resetDockTour } from '../hooks/useNavPreferences';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function deriveRole(user) {
  return user?.startuparkRole || user?.role || (user?.isStartup ? 'startup' : 'user');
}

const ICON_MAP = {
  IconRocket, IconMicrophone, IconFileText, IconLayoutDashboard, IconSettings,
  IconUser, IconCreditCard, IconHome, IconCompass, IconBriefcase2, IconMessage,
  IconBox, IconCalendarEvent, IconNews, IconEdit, IconCalendar, IconCalendarStats,
  IconUsers, IconListCheck, IconActivity,
};

function resolveIcon(name) {
  return ICON_MAP[name] || IconHelpCircle;
}

// One line per nav id — covers every id across all three navRegistry roles plus
// globalItems. Falls back to the item's own label if an id is ever added here
// without a matching description, so the map never renders a blank card.
const NAV_DESCRIPTIONS = {
  'startup-dashboard': 'Your StartupArk home base — activity summary and quick links.',
  'user-dashboard': 'Your StartupArk home base — activity summary and quick links.',
  'student-dashboard': 'Your StartupArk home base — activity summary and quick links.',
  'startup-profile': 'Your public company profile — logo, pitch, team, and documents investors and talent see.',
  'startups-list': 'Browse every startup on the platform. Toggle "Nearby" to filter by distance.',
  'project-ark': 'The work marketplace — startup projects, talent requests, jobs/internships, and the Talent Directory all live here as tabs.',
  'messages': 'Direct chat with anyone you’re connected with through a booking, proposal, or profile.',
  'products': 'Showcase (startups) or browse (everyone) the products and services live on the platform.',
  'events': 'Upcoming webinars, workshops, and networking sessions you can join.',
  'updates': 'A feed of startup news — funding, launches, hiring — from founders you follow or discover.',
  'my-updates': 'Post and manage your own startup’s update feed.',
  'bookings': 'Manage incoming booking requests from users and students.',
  'my-bookings': 'Sessions you’ve booked with startups.',
  'meetings': 'Sessions you’ve booked with startups.',
  'student-list': 'The Talent Directory, pre-filtered to student profiles — find student talent fast.',
  'flowboard-canvas': 'Flowboard’s voice-to-notes canvas.',
  'flowboard-tasks': 'Tasks captured or created in Flowboard.',
  'flowboard-activity': 'Recent Flowboard activity across your workspace.',
  'docarc-studio': 'DocArc’s document workspace.',
  'hub': 'Switch between installed products (StartupArk, Flowboard, DocArc).',
  'settings': 'Account, notification, and security settings.',
  'profile': 'Your MappArks identity — the one profile shared across every product.',
  'subscription': 'Manage your plan and billing.',
  'guide': 'This page.',
};

const ROLE_LANE_LABEL = {
  startup: 'For Startups',
  student: 'For Students',
  user: 'For Users',
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const DEFAULT_PAN = { x: 96, y: 130 };

// ── canvas nodes ─────────────────────────────────────────────────────────────

const FlowCard = ({ item, index }) => {
  const Icon = resolveIcon(item.icon);
  return (
    <div className="flex-shrink-0 w-48">
      <div className="glass-card relative h-full p-3.5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 text-zinc-700 dark:text-zinc-200">
            <Icon size={18} stroke={1.75} />
          </div>
          <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-600 tabular-nums mt-1">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{item.label}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
            {NAV_DESCRIPTIONS[item.id] || item.label}
          </p>
        </div>
      </div>
    </div>
  );
};

const Connector = () => (
  <div className="flex items-center flex-shrink-0 w-8">
    <div className="relative w-full h-px bg-zinc-400/50 dark:bg-white/15">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-white/30" />
    </div>
  </div>
);

const Lane = ({ label, items, accent }) => (
  <div className="flex items-start gap-6">
    <div className="w-28 flex-shrink-0 pt-3.5">
      <p className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap ${accent ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
        {label}
      </p>
    </div>
    <div className="flex">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-stretch">
          <FlowCard item={item} index={i} />
          {i < items.length - 1 && <Connector />}
        </div>
      ))}
    </div>
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────

const GuidePage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [replaying, setReplaying] = useState(false);
  const [pan, setPan] = useState(DEFAULT_PAN);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoadingRole(false); return; }
    axios
      .get(`${BASE_URL}/api/mappuser/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRole(deriveRole(res.data)))
      .catch(() => setRole('user'))
      .finally(() => setLoadingRole(false));
  }, []);

  // Canvas-surface handlers — kept off the toolbar/zoom-control buttons (they're
  // siblings, not ancestors, of the drag surface) so pointer capture here never
  // hijacks their clicks.
  const onPointerDown = useCallback((e) => {
    setDragging(true);
    lastPoint.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, [dragging]);

  const onPointerUp = useCallback((e) => {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(3))));
  }, []);

  const zoomBy = (delta) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))));
  const resetView = () => { setZoom(1); setPan(DEFAULT_PAN); };

  async function replayTour() {
    setReplaying(true);
    try {
      await resetDockTour();
      window.location.href = '/dashboard';
    } catch {
      setReplaying(false);
    }
  }

  const roleItems = navRegistry[role] ?? [];
  const roleLabel = ROLE_LANE_LABEL[role] || 'Your nav';

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-zinc-200 dark:bg-zinc-950">
      {/* canvas surface — owns pan/zoom, sits full-bleed beneath the HUD */}
      <div
        className={`absolute inset-0 touch-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        {/* moving dot grid — reinforces that this is a canvas, not a page */}
        <div
          className="hud-grid absolute inset-0 pointer-events-none"
          style={{ backgroundPosition: `${pan.x}px ${pan.y}px`, backgroundSize: `${22 * zoom}px ${22 * zoom}px` }}
        />

        {loadingRole ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass-inset px-5 py-3 text-sm text-zinc-500 dark:text-zinc-400">Loading your guide…</div>
          </div>
        ) : (
          <div
            className="absolute top-0 left-0 space-y-12 px-4 py-10 select-none"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
          >
            <Lane label={roleLabel} items={roleItems} accent />
            <Lane label="Everywhere" items={globalItems} />
          </div>
        )}
      </div>

      {/* top toolbar — sibling of the canvas surface, never hijacked by drag */}
      <div className="fixed top-4 left-4 right-4 z-10 flex items-center gap-3 glass-panel px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="glass-inset flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
        >
          <IconArrowLeft size={16} stroke={2.25} />
          Back
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">Guide</h1>
          <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 truncate">
            Drag to pan, scroll to zoom — what your dock does.
          </p>
        </div>
        <button
          onClick={replayTour}
          disabled={replaying}
          className="btn-mono flex-shrink-0 text-xs sm:text-sm px-3 py-2 disabled:opacity-50"
        >
          {replaying ? 'Starting…' : 'Replay tour'}
        </button>
      </div>

      {/* zoom controls — sibling of the canvas surface too */}
      <div className="fixed bottom-6 right-6 z-10 glass-panel flex items-center gap-1 p-1.5">
        <button
          onClick={() => zoomBy(-0.15)}
          className="w-9 h-9 rounded-lg flex items-center justify-center glass-inset hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors text-zinc-700 dark:text-zinc-200"
          aria-label="Zoom out"
        >
          <IconMinus size={16} />
        </button>
        <button
          onClick={resetView}
          className="px-2.5 h-9 rounded-lg flex items-center justify-center glass-inset hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors text-xs font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums"
          aria-label="Reset view"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => zoomBy(0.15)}
          className="w-9 h-9 rounded-lg flex items-center justify-center glass-inset hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors text-zinc-700 dark:text-zinc-200"
          aria-label="Zoom in"
        >
          <IconPlus size={16} />
        </button>
      </div>
    </div>
  );
};

export default GuidePage;
