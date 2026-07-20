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
    { id: 'nearby',            label: 'Nearby',         icon: 'IconMapPin',        route: '/startupark/nearby',               category: 'secondary', product: 'startupark' },
    { id: 'showcase',          label: 'Showcase',       icon: 'IconBox',           route: '/products',                        category: 'secondary', product: 'startupark' },
    { id: 'my-products',       label: 'My Products',    icon: 'IconBuildingStore', route: '/manage-products',                 category: 'secondary', product: 'startupark' },
    { id: 'events',            label: 'Events',         icon: 'IconCalendarEvent', route: '/startupark/startup/events',       category: 'secondary', product: 'startupark' },
    { id: 'saved',             label: 'Saved',          icon: 'IconBookmarks',     route: '/startupark/favorites',            category: 'secondary', product: 'startupark' },
    { id: 'calendar',          label: 'Calendar',       icon: 'IconCalendar',      route: '/startupark/startupcalender',      category: 'secondary', product: 'startupark' },
    { id: 'bookings',          label: 'Bookings',       icon: 'IconCalendarStats', route: '/startupark/manage-bookings',      category: 'secondary', product: 'startupark' },
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
    { id: 'nearby',            label: 'Nearby',          icon: 'IconMapPin',        route: '/startupark/nearby',              category: 'secondary', product: 'startupark' },
    { id: 'products',          label: 'Products',        icon: 'IconBox',           route: '/products',                       category: 'secondary', product: 'startupark' },
    { id: 'events',            label: 'Events',          icon: 'IconCalendarEvent', route: '/startupark/events',              category: 'secondary', product: 'startupark' },
    { id: 'saved',             label: 'Saved',           icon: 'IconBookmarks',     route: '/startupark/favorites',           category: 'secondary', product: 'startupark' },
    { id: 'calendar',          label: 'Calendar',        icon: 'IconCalendar',      route: '/startupark/usercalender',        category: 'secondary', product: 'startupark' },
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
    { id: 'nearby',            label: 'Nearby',          icon: 'IconMapPin',        route: '/startupark/nearby',              category: 'secondary', product: 'startupark' },
    { id: 'products',          label: 'Products',        icon: 'IconBox',           route: '/products',                       category: 'secondary', product: 'startupark' },
    { id: 'events',            label: 'Events',          icon: 'IconCalendarEvent', route: '/startupark/events',              category: 'secondary', product: 'startupark' },
    { id: 'saved',             label: 'Saved',           icon: 'IconBookmarks',     route: '/startupark/favorites',           category: 'secondary', product: 'startupark' },
    { id: 'calendar',          label: 'Calendar',        icon: 'IconCalendar',      route: '/startupark/usercalender',        category: 'secondary', product: 'startupark' },
    { id: 'meetings',          label: 'Meetings',        icon: 'IconCalendarStats', route: '/startupark/my-bookings',         category: 'secondary', product: 'startupark' },
    // ── Flowboard ─────────────────────────────────────────────────────────
    { id: 'flowboard-canvas',   label: 'Canvas',   icon: 'IconMicrophone', route: '/flowboard',          category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-tasks',    label: 'Tasks',    icon: 'IconListCheck',  route: '/flowboard/tasks',    category: 'primary',   product: 'flowboard' },
    { id: 'flowboard-activity', label: 'Activity', icon: 'IconActivity',   route: '/flowboard/activity', category: 'secondary', product: 'flowboard' },
    // ── DocArc ────────────────────────────────────────────────────────────
    { id: 'docarc-studio', label: 'Studio', icon: 'IconFileText', route: '/docarc', category: 'primary', product: 'docarc' },
  ],
};
