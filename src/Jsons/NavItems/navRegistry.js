// src/Jsons/NavItems/navRegistry.js
// Supersedes StartupDashboardSidebar.json, UserDashboardSidebar.json,
// StudentDashboardSidebar.json, MainDashboardSidebar.json, PricingPageSidebar.json
// as of the unified-dock migration. Old files kept one release cycle for rollback safety.
//
// icon values are @tabler/icons-react component names — resolved to JSX in FloatingDock.tsx.
// Every navRegistry entry carries a `product` id so the product-mode dock (see
// useNavPreferences.useActiveProduct) can show only the current product's items
// instead of every installed product's items mixed together.

// Installed product tiles shown in Hub-mode dock.
// Each role gets its own entry point so the avatar/dock always knows where to land.
// Add future product modules here per role — dock code reads this array dynamically.
export const hubItems = {
  startup: [
    { id: 'startupark', label: 'StartupArk', icon: 'IconRocket', route: '/startupark/startup-dashboard', product: 'startupark' },
    { id: 'flowboard',  label: 'Flowboard',  icon: 'IconMicrophone', route: '/flowboard', product: 'flowboard' },
    { id: 'docarc',     label: 'DocArc',     icon: 'IconFileText', route: '/docarc', product: 'docarc' },
  ],
  user: [
    { id: 'startupark', label: 'StartupArk', icon: 'IconRocket', route: '/startupark/user-dashboard', product: 'startupark' },
    { id: 'flowboard',  label: 'Flowboard',  icon: 'IconMicrophone', route: '/flowboard', product: 'flowboard' },
    { id: 'docarc',     label: 'DocArc',     icon: 'IconFileText', route: '/docarc', product: 'docarc' },
  ],
  student: [
    { id: 'startupark', label: 'StartupArk', icon: 'IconRocket', route: '/startupark/student-dashboard', product: 'startupark' },
    { id: 'flowboard',  label: 'Flowboard',  icon: 'IconMicrophone', route: '/flowboard', product: 'flowboard' },
    { id: 'docarc',     label: 'DocArc',     icon: 'IconFileText', route: '/docarc', product: 'docarc' },
  ],
};

export const globalItems = [
  { id: 'hub',          label: 'Hub',          icon: 'IconLayoutDashboard', route: '/dashboard' },
  { id: 'settings',     label: 'Settings',     icon: 'IconSettings',        route: '/settings'  },
  { id: 'profile',      label: 'My Profile',   icon: 'IconUser',            route: '/profile'   },
  { id: 'subscription', label: 'Subscription', icon: 'IconCreditCard',      route: '/pricing'   },
  // 'guide' intentionally removed from the dock — the Hub page now surfaces an
  // interactive guide widget inline and links out to /guide (page kept, just
  // no longer a separate nav entry). See Dashboard.jsx's GuideSpotlight.
];

// Fallback pinned order used when no server preference exists for the user.
export const defaultPinnedIds = {
  startup: ['startup-dashboard', 'startup-profile', 'startups-list', 'project-ark', 'messages'],
  user:    ['user-dashboard',    'startups-list',   'project-ark',   'messages'],
  student: ['student-dashboard', 'startups-list',   'project-ark',   'messages'],
};

export const navRegistry = {
  startup: [
    // ── primary (default pinned) ─────────────────────────────────────────
    { id: 'startup-dashboard', label: 'Dashboard',      icon: 'IconHome',          route: '/startupark/startup-dashboard',    category: 'primary',   product: 'startupark' },
    { id: 'startup-profile',   label: 'My Startup',     icon: 'IconRocket',        route: '/startupark/startup-profile',      category: 'primary',   product: 'startupark' },
    { id: 'startups-list',     label: 'Browse Startups',icon: 'IconCompass',       route: '/startupark/startupsList',         category: 'primary',   product: 'startupark' },
    { id: 'project-ark',       label: 'Project Ark',    icon: 'IconBriefcase2',    route: '/startupark/projectark',           category: 'primary',   product: 'startupark' },
    { id: 'messages',          label: 'Messages',       icon: 'IconMessage',       route: '/startupark/chat',                 category: 'primary',   product: 'startupark' },
    // ── secondary (overflow) ─────────────────────────────────────────────
    // 'nearby' folded into the Startup List page as a toggle, 'saved' moved to
    // a header icon panel, 'my-products' folded into the Products page as a
    // tab — Tier 3 C#5. Removed here to match startupark-nav-preferences.cjs.
    { id: 'products',          label: 'Products',       icon: 'IconBox',           route: '/products',                        category: 'secondary', product: 'startupark' },
    { id: 'events',            label: 'Events',         icon: 'IconCalendarEvent', route: '/startupark/startup/events',       category: 'secondary', product: 'startupark' },
    // 'my-updates' folded into the Newsletter page as an in-page "Mine" tab —
    // it was a straight duplicate of the switch already available there.
    { id: 'updates',           label: 'Newsletter',     icon: 'IconNews',          route: '/startupark/updates',              category: 'secondary', product: 'startupark' },
    { id: 'bookings',          label: 'Bookings',       icon: 'IconCalendarStats', route: '/startupark/manage-bookings',      category: 'secondary', product: 'startupark' },
    // Tier 3 C#9: startup-only entry point into the existing Talent Directory,
    // pre-filtered to students — not a separate page.
    { id: 'student-list',      label: 'Students',       icon: 'IconUsers',         route: '/startupark/projectark?mode=talent&type=student', category: 'secondary', product: 'startupark' },
    // ── Flowboard ─────────────────────────────────────────────────────────
    { id: 'flowboard-canvas',   label: 'Canvas',   icon: 'IconMicrophone', route: '/flowboard',          category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-tasks',    label: 'Tasks',    icon: 'IconListCheck',  route: '/flowboard/tasks',    category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-activity', label: 'Activity', icon: 'IconActivity',   route: '/flowboard/activity', category: 'secondary', product: 'flowboard' },
    // ── DocArc ────────────────────────────────────────────────────────────
    { id: 'docarc-studio', label: 'Studio', icon: 'IconFileText', route: '/docarc', category: 'primary', product: 'docarc' },
  ],

  user: [
    // ── primary ──────────────────────────────────────────────────────────
    { id: 'user-dashboard',    label: 'Dashboard',       icon: 'IconHome',          route: '/startupark/user-dashboard',      category: 'primary',   product: 'startupark' },
    { id: 'startups-list',     label: 'Browse Startups', icon: 'IconCompass',       route: '/startupark/startupsList',        category: 'primary',   product: 'startupark' },
    { id: 'project-ark',       label: 'Project Ark',     icon: 'IconBriefcase2',    route: '/startupark/projectark',          category: 'primary',   product: 'startupark' },
    { id: 'messages',          label: 'Messages',        icon: 'IconMessage',       route: '/startupark/chat',                category: 'primary',   product: 'startupark' },
    // ── secondary ────────────────────────────────────────────────────────
    // 'nearby' folded into the Startup List page as a toggle, 'saved' moved to
    // a header icon panel — Tier 3 C#5. Removed here to match
    // startupark-nav-preferences.cjs.
    { id: 'products',          label: 'Products',        icon: 'IconBox',           route: '/products',                       category: 'secondary', product: 'startupark' },
    { id: 'events',            label: 'Events',          icon: 'IconCalendarEvent', route: '/startupark/events',              category: 'secondary', product: 'startupark' },
    { id: 'updates',           label: 'Newsletter',      icon: 'IconNews',          route: '/startupark/updates',             category: 'secondary', product: 'startupark' },
    { id: 'my-bookings',       label: 'My Bookings',     icon: 'IconCalendarStats', route: '/startupark/my-bookings',         category: 'secondary', product: 'startupark' },
    // ── Flowboard ─────────────────────────────────────────────────────────
    { id: 'flowboard-canvas',   label: 'Canvas',   icon: 'IconMicrophone', route: '/flowboard',          category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-tasks',    label: 'Tasks',    icon: 'IconListCheck',  route: '/flowboard/tasks',    category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-activity', label: 'Activity', icon: 'IconActivity',   route: '/flowboard/activity', category: 'secondary', product: 'flowboard' },
    // ── DocArc ────────────────────────────────────────────────────────────
    { id: 'docarc-studio', label: 'Studio', icon: 'IconFileText', route: '/docarc', category: 'primary', product: 'docarc' },
  ],

  student: [
    // ── primary ──────────────────────────────────────────────────────────
    { id: 'student-dashboard', label: 'Dashboard',       icon: 'IconHome',          route: '/startupark/student-dashboard',   category: 'primary',   product: 'startupark' },
    { id: 'startups-list',     label: 'Browse Startups', icon: 'IconCompass',       route: '/startupark/startupsList',        category: 'primary',   product: 'startupark' },
    { id: 'project-ark',       label: 'Project Ark',     icon: 'IconBriefcase2',    route: '/startupark/projectark',          category: 'primary',   product: 'startupark' },
    { id: 'messages',          label: 'Messages',        icon: 'IconMessage',       route: '/startupark/chat',                category: 'primary',   product: 'startupark' },
    // ── secondary ────────────────────────────────────────────────────────
    // 'nearby' folded into the Startup List page as a toggle, 'saved' moved to
    // a header icon panel — Tier 3 C#5. Removed here to match
    // startupark-nav-preferences.cjs.
    { id: 'products',          label: 'Products',        icon: 'IconBox',           route: '/products',                       category: 'secondary', product: 'startupark' },
    { id: 'events',            label: 'Events',          icon: 'IconCalendarEvent', route: '/startupark/events',              category: 'secondary', product: 'startupark' },
    { id: 'updates',           label: 'Newsletter',      icon: 'IconNews',          route: '/startupark/updates',             category: 'secondary', product: 'startupark' },
    { id: 'meetings',          label: 'Meetings',        icon: 'IconCalendarStats', route: '/startupark/my-bookings',         category: 'secondary', product: 'startupark' },
    // ── Flowboard ─────────────────────────────────────────────────────────
    { id: 'flowboard-canvas',   label: 'Canvas',   icon: 'IconMicrophone', route: '/flowboard',          category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-tasks',    label: 'Tasks',    icon: 'IconListCheck',  route: '/flowboard/tasks',    category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-activity', label: 'Activity', icon: 'IconActivity',   route: '/flowboard/activity', category: 'secondary', product: 'flowboard' },
    // ── DocArc ────────────────────────────────────────────────────────────
    { id: 'docarc-studio', label: 'Studio', icon: 'IconFileText', route: '/docarc', category: 'primary', product: 'docarc' },
  ],
};
