// src/Jsons/NavItems/navRegistry.js
// Supersedes StartupDashboardSidebar.json, UserDashboardSidebar.json,
// StudentDashboardSidebar.json, MainDashboardSidebar.json, PricingPageSidebar.json
// as of the unified-dock migration. Old files kept one release cycle for rollback safety.
//
// icon values are @tabler/icons-react component names — resolved to JSX in FloatingDock.tsx.

// Installed product tiles shown in Hub-mode dock.
// Each role gets its own entry point so the avatar/dock always knows where to land.
// Add future product modules here per role — dock code reads this array dynamically.
export const hubItems = {
  startup: [
    { id: 'startupark', label: 'StartupArk', icon: 'IconRocket', route: '/startupark/startup-dashboard', product: 'startupark' },
  ],
  user: [
    { id: 'startupark', label: 'StartupArk', icon: 'IconRocket', route: '/startupark/user-dashboard', product: 'startupark' },
  ],
  student: [
    { id: 'startupark', label: 'StartupArk', icon: 'IconRocket', route: '/startupark/student-dashboard', product: 'startupark' },
  ],
};

export const globalItems = [
  { id: 'hub',          label: 'Hub',          icon: 'IconLayoutDashboard', route: '/dashboard' },
  { id: 'settings',     label: 'Settings',     icon: 'IconSettings',        route: '/settings'  },
  { id: 'profile',      label: 'My Profile',   icon: 'IconUser',            route: '/profile'   },
  { id: 'subscription', label: 'Subscription', icon: 'IconCreditCard',      route: '/pricing'   },
];

// Fallback pinned order used when no server preference exists for the user.
export const defaultPinnedIds = {
  startup: ['startup-dashboard', 'startup-profile', 'startups-list', 'project-ark', 'messages', 'job-postings'],
  user:    ['user-dashboard',    'startups-list',   'project-ark',   'messages',    'career-launchpad'],
  student: ['student-dashboard', 'startups-list',   'project-ark',   'messages',    'career-launchpad'],
};

export const navRegistry = {
  startup: [
    // ── primary (default pinned) ─────────────────────────────────────────
    { id: 'startup-dashboard', label: 'Dashboard',      icon: 'IconHome',          route: '/startupark/startup-dashboard',    category: 'primary'   },
    { id: 'startup-profile',   label: 'My Startup',     icon: 'IconRocket',        route: '/startupark/startup-profile',      category: 'primary'   },
    { id: 'startups-list',     label: 'Browse Startups',icon: 'IconCompass',       route: '/startupark/startupsList',         category: 'primary'   },
    { id: 'project-ark',       label: 'Project Ark',    icon: 'IconBriefcase2',    route: '/startupark/projectark',           category: 'primary'   },
    { id: 'messages',          label: 'Messages',       icon: 'IconMessage',       route: '/startupark/chat',                 category: 'primary'   },
    { id: 'job-postings',      label: 'Job Postings',   icon: 'IconBriefcase',     route: '/startupark/jobposting',           category: 'primary'   },
    // ── secondary (overflow) ─────────────────────────────────────────────
    { id: 'nearby',            label: 'Nearby',         icon: 'IconMapPin',        route: '/startupark/nearby',               category: 'secondary' },
    { id: 'showcase',          label: 'Showcase',       icon: 'IconBox',           route: '/products',                        category: 'secondary' },
    { id: 'my-products',       label: 'My Products',    icon: 'IconBuildingStore', route: '/manage-products',                 category: 'secondary' },
    { id: 'applications',      label: 'Applications',   icon: 'IconFile',          route: '/startupark/startup/applications', category: 'secondary' },
    { id: 'events',            label: 'Events',         icon: 'IconCalendarEvent', route: '/startupark/startup/events',       category: 'secondary' },
    { id: 'saved',             label: 'Saved',          icon: 'IconBookmarks',     route: '/startupark/favorites',            category: 'secondary' },
    { id: 'calendar',          label: 'Calendar',       icon: 'IconCalendar',      route: '/startupark/startupcalender',      category: 'secondary' },
    { id: 'bookings',          label: 'Bookings',       icon: 'IconCalendarStats', route: '/startupark/manage-bookings',      category: 'secondary' },
  ],

  user: [
    // ── primary ──────────────────────────────────────────────────────────
    { id: 'user-dashboard',    label: 'Dashboard',       icon: 'IconHome',          route: '/startupark/user-dashboard',      category: 'primary'   },
    { id: 'startups-list',     label: 'Browse Startups', icon: 'IconCompass',       route: '/startupark/startupsList',        category: 'primary'   },
    { id: 'project-ark',       label: 'Project Ark',     icon: 'IconBriefcase2',    route: '/startupark/projectark',          category: 'primary'   },
    { id: 'messages',          label: 'Messages',        icon: 'IconMessage',       route: '/startupark/chat',                category: 'primary'   },
    { id: 'career-launchpad',  label: 'Career LaunchPad',icon: 'IconBriefcase',     route: '/startupark/launchpad',           category: 'primary'   },
    // ── secondary ────────────────────────────────────────────────────────
    { id: 'nearby',            label: 'Nearby',          icon: 'IconMapPin',        route: '/startupark/nearby',              category: 'secondary' },
    { id: 'products',          label: 'Products',        icon: 'IconBox',           route: '/products',                       category: 'secondary' },
    { id: 'events',            label: 'Events',          icon: 'IconCalendarEvent', route: '/startupark/events',              category: 'secondary' },
    { id: 'saved',             label: 'Saved',           icon: 'IconBookmarks',     route: '/startupark/favorites',           category: 'secondary' },
    { id: 'calendar',          label: 'Calendar',        icon: 'IconCalendar',      route: '/startupark/usercalender',        category: 'secondary' },
    { id: 'my-bookings',       label: 'My Bookings',     icon: 'IconCalendarStats', route: '/startupark/my-bookings',         category: 'secondary' },
  ],

  student: [
    // ── primary ──────────────────────────────────────────────────────────
    { id: 'student-dashboard', label: 'Dashboard',       icon: 'IconHome',          route: '/startupark/student-dashboard',   category: 'primary'   },
    { id: 'startups-list',     label: 'Browse Startups', icon: 'IconCompass',       route: '/startupark/startupsList',        category: 'primary'   },
    { id: 'project-ark',       label: 'Project Ark',     icon: 'IconBriefcase2',    route: '/startupark/projectark',          category: 'primary'   },
    { id: 'messages',          label: 'Messages',        icon: 'IconMessage',       route: '/startupark/chat',                category: 'primary'   },
    { id: 'career-launchpad',  label: 'Career LaunchPad',icon: 'IconBriefcase',     route: '/startupark/launchpad',           category: 'primary'   },
    // ── secondary ────────────────────────────────────────────────────────
    { id: 'nearby',            label: 'Nearby',          icon: 'IconMapPin',        route: '/startupark/nearby',              category: 'secondary' },
    { id: 'products',          label: 'Products',        icon: 'IconBox',           route: '/products',                       category: 'secondary' },
    { id: 'events',            label: 'Events',          icon: 'IconCalendarEvent', route: '/startupark/events',              category: 'secondary' },
    { id: 'saved',             label: 'Saved',           icon: 'IconBookmarks',     route: '/startupark/favorites',           category: 'secondary' },
    { id: 'calendar',          label: 'Calendar',        icon: 'IconCalendar',      route: '/startupark/usercalender',        category: 'secondary' },
    { id: 'meetings',          label: 'Meetings',        icon: 'IconCalendarStats', route: '/startupark/my-bookings',         category: 'secondary' },
  ],
};
