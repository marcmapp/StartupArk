import { Navigate } from "react-router-dom";
import { IconMicrophone, IconFileText } from "@tabler/icons-react";
import LayoutWrapper from "./LayoutWrapper";
import PrivateRoute from "../components/Specific-Usecase-Components/PrivateRoute";
import ComingSoon from "../components/ComingSoon";
//Main files
import Login from '../pages/Login';
import Signup from '../pages/Signup';

// Common files
import Dashboard from '../pages/Dashboard';
import Pricing from '../pages/Pricing';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import GuidePage from '../pages/GuidePage';

// Startup pages
import Startupark from '../pages/Product-Specific-Pages/startupark/startupark-setup/StartuparkSetup';
import StartuparkUserDashboard from '../pages/Product-Specific-Pages/startupark/users/user/UserDashboard';

// startup pages sidebar
import StartuparkStartupProfile from '../pages/Product-Specific-Pages/startupark/users/startups/startup-profile/StartupProfile';

// startup components
import StartupDetail from '../pages/Product-Specific-Pages/startupark/users/startups/startup-list/startup-description-page/StartupDetail'
import StartupList from '../pages/Product-Specific-Pages/startupark/users/startups/startup-list/StartupList'
import EditStartupProfile from "../pages/Product-Specific-Pages/startupark/users/startups/startup-profile/EditStartupProfile";
import EditProfile from "../pages/Product-Specific-Pages/startupark/users/EditProfile";
import StartupDashboard from "../pages/Product-Specific-Pages/startupark/users/startups/startup-dashboard/StartupDashboard";

//students
import StudentDashboard from '../pages/Product-Specific-Pages/startupark/users/students/StudentDashboard';

import ProductShowcasePage from "../pages/Product-Specific-Pages/startupark/products/ProductShowcasePage"
import Startups from "../pages/Product-Specific-Pages/startupark/users/startups/startup-list/Startups";
import ProductDetail from "../pages/Product-Specific-Pages/startupark/products/ProductDetail";
import FavoritesPage from "../pages/Product-Specific-Pages/startupark/favourite-module/FavoritesPage";
import NotificationsPage from "../pages/Product-Specific-Pages/startupark/notifications/NotificationsPage";
import FollowersPage from "../pages/FollowersPage";

import BlogPage from "../pages/Product-Specific-Pages/startupark/blog/BlogPage"
import VirtualCardPublicView from "../pages/Product-Specific-Pages/startupark/virtualcard-module/VirtualCardPublicView";


//bookings
import UserBookingsPage from "../pages/Product-Specific-Pages/startupark/bookings/UserBookingsPage";
import StartupBookingsPage from "../pages/Product-Specific-Pages/startupark/bookings/StartupBookingsPage";

import ChatInterface from "../pages/Product-Specific-Pages/startupark/chat/ChatInterface";

// Virtual events (canonical pages)
import StartupEventsPage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/StartupEventsPage";
import UserEventsPage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/UserEventsPage";
import EventDetailPage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/EventDetailPage";
import VideoConferencePage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/VideoConference";

// Newsletter (formerly "Startup Updates") — feed + owner composer live in one page
import UpdatesFeedPage from "../pages/Product-Specific-Pages/startupark/updates/UpdatesFeedPage";
import UpdateDetailPage from "../pages/Product-Specific-Pages/startupark/updates/UpdateDetailPage";
import ProductPlans from "../pages/ProductPlans";
import CalendarWrapper from "../pages/Product-Specific-Pages/startupark/calendars/CalendarWrapper";
import ProjectArk from "../pages/Product-Specific-Pages/startupark/projectark/ProjectArk";
import CreateWorkPost from "../pages/Product-Specific-Pages/startupark/projectark/CreateWorkPost";
import WorkPostDetail from "../pages/Product-Specific-Pages/startupark/projectark/WorkPostDetail";
import EngagementDetail from "../pages/Product-Specific-Pages/startupark/projectark/EngagementDetail";
import TalentDetail from "../pages/Product-Specific-Pages/startupark/projectark/TalentDetail";

// Flowboard (task studio product)
import FlowboardCanvas from "../pages/Product-Specific-Pages/flowboard/FlowboardCanvas";
import FlowboardTasks from "../pages/Product-Specific-Pages/flowboard/FlowboardTasks";
import FlowboardActivity from "../pages/Product-Specific-Pages/flowboard/FlowboardActivity";

// DocArc (document management / AI lab — ported 1:1 from the standalone R&D prototype)
import DocArc from "../pages/Product-Specific-Pages/docarc/DocArc";

// WIP products (Flowboard, DocArc) render a "Coming Soon" placeholder instead of
// their real pages unless VITE_DEMO_MODE=true — lets prod ship the dock entry
// point ahead of the product itself. Flip to true in .env.development/.env.uat
// while building, false in .env.production until launch-ready.
const SHOW_WIP_PRODUCTS = import.meta.env.VITE_DEMO_MODE === "true";

const FlowboardCanvasOrComingSoon = SHOW_WIP_PRODUCTS
  ? FlowboardCanvas
  : () => <ComingSoon productName="Flowboard" icon={IconMicrophone} />;
const FlowboardTasksOrComingSoon = SHOW_WIP_PRODUCTS
  ? FlowboardTasks
  : () => <ComingSoon productName="Flowboard" icon={IconMicrophone} />;
const FlowboardActivityOrComingSoon = SHOW_WIP_PRODUCTS
  ? FlowboardActivity
  : () => <ComingSoon productName="Flowboard" icon={IconMicrophone} />;
const DocArcOrComingSoon = SHOW_WIP_PRODUCTS
  ? DocArc
  : () => <ComingSoon productName="DocArc" icon={IconFileText} />;

// ** Public Routes (No Auth Required) **
export const publicRoutes = [
  { path: "/", element: <Navigate to="/login" /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
];

// ** Private Routes (Require Auth) **
export const privateRoutes = [
  { path: "/profile",         element: <PrivateRoute><LayoutWrapper><Profile /></LayoutWrapper></PrivateRoute> },
  { path: "/dashboard",       element: <PrivateRoute><LayoutWrapper><Dashboard /></LayoutWrapper></PrivateRoute> },
  { path: "/pricing",         element: <PrivateRoute><LayoutWrapper><Pricing /></LayoutWrapper></PrivateRoute> },
  { path: "/pricing/:productId", element: <PrivateRoute><LayoutWrapper><ProductPlans /></LayoutWrapper></PrivateRoute> },
  { path: "/settings",        element: <PrivateRoute><LayoutWrapper><Settings /></LayoutWrapper></PrivateRoute> },
  { path: "/guide",           element: <PrivateRoute><LayoutWrapper><GuidePage /></LayoutWrapper></PrivateRoute> },

  { path: "/startupark",      element: <PrivateRoute><LayoutWrapper><Startupark /></LayoutWrapper></PrivateRoute> },

  // Role-specific dashboards
  { path: "/startupark/user-dashboard",     element: <PrivateRoute><LayoutWrapper><StartuparkUserDashboard /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startup-dashboard",  element: <PrivateRoute><LayoutWrapper><StartupDashboard /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/student-dashboard",  element: <PrivateRoute><LayoutWrapper><StudentDashboard /></LayoutWrapper></PrivateRoute> },

  // Startup profile
  { path: "/startupark/startup-profile",    element: <PrivateRoute><LayoutWrapper><StartuparkStartupProfile /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startup-edit-profile", element: <PrivateRoute><LayoutWrapper><EditStartupProfile /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/edit-profile",       element: <PrivateRoute><LayoutWrapper><EditProfile /></LayoutWrapper></PrivateRoute> },

  // Discovery
  { path: "/startupark/startupsList",       element: <PrivateRoute><LayoutWrapper><Startups /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startups",           element: <PrivateRoute><LayoutWrapper><StartupList /></LayoutWrapper></PrivateRoute> },
  // Nearby (Tier 3 C#5): folded into the Startup List page as a toggle — redirect
  // any bookmarked/shared link to the new location instead of 404ing.
  { path: "/startupark/nearby",             element: <Navigate to="/startupark/startupsList?nearby=true" replace /> },
  { path: "/startupark/startups/:id",       element: <PrivateRoute><LayoutWrapper><StartupDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startups-by-id/:id", element: <PrivateRoute><LayoutWrapper><StartupDetail /></LayoutWrapper></PrivateRoute> },

  // Favourites
  { path: "/startupark/favorites",          element: <PrivateRoute><LayoutWrapper><FavoritesPage /></LayoutWrapper></PrivateRoute> },

  // Notifications
  { path: "/startupark/notifications",      element: <PrivateRoute><LayoutWrapper><NotificationsPage /></LayoutWrapper></PrivateRoute> },

  // Follow graph
  { path: "/startupark/users/:userId/followers", element: <PrivateRoute><LayoutWrapper><FollowersPage type="followers" /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/users/:userId/following", element: <PrivateRoute><LayoutWrapper><FollowersPage type="following" /></LayoutWrapper></PrivateRoute> },

  // Products
  { path: "/products",        element: <PrivateRoute><LayoutWrapper><ProductShowcasePage /></LayoutWrapper></PrivateRoute> },
  { path: "/products/:id",    element: <PrivateRoute><LayoutWrapper><ProductDetail /></LayoutWrapper></PrivateRoute> },
  // My Products (Tier 3 C#5): folded into the Products page as a tab — redirect
  // the old standalone route/nav entry instead of leaving it (or a bookmark) 404ing.
  { path: "/manage-products", element: <Navigate to="/products?tab=mine" replace /> },

  // Bookings
  { path: "/startupark/my-bookings",          element: <PrivateRoute><LayoutWrapper><UserBookingsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/manage-bookings",      element: <PrivateRoute><LayoutWrapper><StartupBookingsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/bookings/calendar/:type", element: <PrivateRoute><LayoutWrapper><CalendarWrapper /></LayoutWrapper></PrivateRoute> },

  // Chat
  { path: "/startupark/chat",           element: <PrivateRoute><LayoutWrapper><ChatInterface /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/chat/:startupId", element: <PrivateRoute><LayoutWrapper><ChatInterface /></LayoutWrapper></PrivateRoute> },

  // Blog
  { path: "/startupark/blog",           element: <PrivateRoute><LayoutWrapper><BlogPage /></LayoutWrapper></PrivateRoute> },

  // Virtual cards
  { path: "/vc/:id",                    element: <PrivateRoute><LayoutWrapper><VirtualCardPublicView /></LayoutWrapper></PrivateRoute> },

  // Career (retired — Career LaunchPad/Job Postings/Applications folded into Project Ark's Roles mode)
  { path: "/startupark/launchpad",              element: <Navigate to="/startupark/projectark?mode=role" replace /> },
  { path: "/startupark/jobposting",             element: <Navigate to="/startupark/projectark?mode=role" replace /> },
  { path: "/startupark/startup/applications",   element: <Navigate to="/startupark/projectark?mode=role" replace /> },

  // Virtual Events
  { path: "/startupark/startup/events", element: <PrivateRoute><LayoutWrapper><StartupEventsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/events",         element: <PrivateRoute><LayoutWrapper><UserEventsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/events/:id",                element: <PrivateRoute><LayoutWrapper><EventDetailPage /></LayoutWrapper></PrivateRoute> },

  // Newsletter (formerly "Startup Updates") — the feed and the owner composer
  // now live in one page with an in-page tab switch, so "My Updates" no
  // longer needs its own route or nav entry.
  { path: "/startupark/updates",        element: <PrivateRoute><LayoutWrapper><UpdatesFeedPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/my-updates",     element: <Navigate to="/startupark/updates" replace /> },
  { path: "/updates/:id",               element: <PrivateRoute><LayoutWrapper><UpdateDetailPage /></LayoutWrapper></PrivateRoute> },

  // Video Conference Room — no dock/layout wrapper needed
  { path: "/virtual-event/:id",         element: <PrivateRoute><VideoConferencePage /></PrivateRoute> },

  // ProjectArk
  { path: "/startupark/projectark",                    element: <PrivateRoute><LayoutWrapper><ProjectArk /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/projectark/create",             element: <PrivateRoute><LayoutWrapper><CreateWorkPost /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/projectark/posts/:postId",      element: <PrivateRoute><LayoutWrapper><WorkPostDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/projectark/talent/:profileType/:id", element: <PrivateRoute><LayoutWrapper><TalentDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/engagements/:engagementId",     element: <PrivateRoute><LayoutWrapper><EngagementDetail /></LayoutWrapper></PrivateRoute> },

  // Flowboard
  { path: "/flowboard",          element: <PrivateRoute><LayoutWrapper><FlowboardCanvasOrComingSoon /></LayoutWrapper></PrivateRoute> },
  { path: "/flowboard/tasks",    element: <PrivateRoute><LayoutWrapper><FlowboardTasksOrComingSoon /></LayoutWrapper></PrivateRoute> },
  { path: "/flowboard/activity", element: <PrivateRoute><LayoutWrapper><FlowboardActivityOrComingSoon /></LayoutWrapper></PrivateRoute> },

  // DocArc
  { path: "/docarc", element: <PrivateRoute><LayoutWrapper><DocArcOrComingSoon /></LayoutWrapper></PrivateRoute> },

  // Fallback — unmatched paths redirect instead of rendering blank
  { path: "*", element: <Navigate to="/dashboard" replace /> },
];
