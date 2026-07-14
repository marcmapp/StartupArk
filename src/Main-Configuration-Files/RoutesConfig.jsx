import { Navigate } from "react-router-dom";
import LayoutWrapper from "./LayoutWrapper";
import PrivateRoute from "../components/Specific-Usecase-Components/PrivateRoute";
//Main files
import Login from '../pages/Login';
import Signup from '../pages/Signup';

// Common files
import Dashboard from '../pages/Dashboard';
import Pricing from '../pages/Pricing';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';

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

import BlogPage from "../pages/Product-Specific-Pages/startupark/blog/BlogPage"
import VirtualCardPublicView from "../pages/Product-Specific-Pages/startupark/virtualcard-module/VirtualCardPublicView";


//bookings
import UserBookingsPage from "../pages/Product-Specific-Pages/startupark/bookings/UserBookingsPage";
import StartupBookingsPage from "../pages/Product-Specific-Pages/startupark/bookings/StartupBookingsPage";
import UserCalendarPage from "../pages/Product-Specific-Pages/startupark/calendars/UserCalendarPage";
import StartupCalendarPage from "../pages/Product-Specific-Pages/startupark/calendars/StartupCalendarPage";

import ChatInterface from "../pages/Product-Specific-Pages/startupark/chat/ChatInterface";

//career
import CareerLaunchPad from "../pages/Product-Specific-Pages/startupark/resource-module/careerlaunchpad/CareerLaunchPad";
import StartupJobPosting from "../pages/Product-Specific-Pages/startupark/resource-module/careerlaunchpad/StartupJobPosting";
import StartupApplications from "../pages/Product-Specific-Pages/startupark/resource-module/application/StartupApplications";
// Virtual events (canonical pages)
import StartupEventsPage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/StartupEventsPage";
import UserEventsPage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/UserEventsPage";
import EventDetailPage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/EventDetailPage";
import VideoConferencePage from "../pages/Product-Specific-Pages/startupark/VirtualEvent/VideoConference";
import ProductPlans from "../pages/ProductPlans";
import ProductManagement from "../pages/Product-Specific-Pages/startupark/products/ProductManagement";
import CalendarWrapper from "../pages/Product-Specific-Pages/startupark/calendars/CalendarWrapper";
import GeoSearch from "../pages/Product-Specific-Pages/startupark/geo/GeoSearch";
import ProjectArk from "../pages/Product-Specific-Pages/startupark/projectark/ProjectArk";
import CreateWorkPost from "../pages/Product-Specific-Pages/startupark/projectark/CreateWorkPost";
import WorkPostDetail from "../pages/Product-Specific-Pages/startupark/projectark/WorkPostDetail";
import EngagementDetail from "../pages/Product-Specific-Pages/startupark/projectark/EngagementDetail";

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
  { path: "/startupark/nearby",             element: <PrivateRoute><LayoutWrapper><GeoSearch /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startups/:id",       element: <PrivateRoute><LayoutWrapper><StartupDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startups-by-id/:id", element: <PrivateRoute><LayoutWrapper><StartupDetail /></LayoutWrapper></PrivateRoute> },

  // Favourites
  { path: "/startupark/favorites",          element: <PrivateRoute><LayoutWrapper><FavoritesPage /></LayoutWrapper></PrivateRoute> },

  // Products
  { path: "/products",        element: <PrivateRoute><LayoutWrapper><ProductShowcasePage /></LayoutWrapper></PrivateRoute> },
  { path: "/products/:id",    element: <PrivateRoute><LayoutWrapper><ProductDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/manage-products", element: <PrivateRoute><LayoutWrapper><ProductManagement /></LayoutWrapper></PrivateRoute> },

  // Bookings
  { path: "/startupark/my-bookings",          element: <PrivateRoute><LayoutWrapper><UserBookingsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/manage-bookings",      element: <PrivateRoute><LayoutWrapper><StartupBookingsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/bookings/calendar/:type", element: <PrivateRoute><LayoutWrapper><CalendarWrapper /></LayoutWrapper></PrivateRoute> },

  // Chat
  { path: "/startupark/chat",           element: <PrivateRoute><LayoutWrapper><ChatInterface /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/chat/:startupId", element: <PrivateRoute><LayoutWrapper><ChatInterface /></LayoutWrapper></PrivateRoute> },

  // Blog
  { path: "/startupark/blog",           element: <PrivateRoute><LayoutWrapper><BlogPage /></LayoutWrapper></PrivateRoute> },

  // Calendars
  { path: "/startupark/usercalender",   element: <PrivateRoute><LayoutWrapper><UserCalendarPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startupcalender", element: <PrivateRoute><LayoutWrapper><StartupCalendarPage /></LayoutWrapper></PrivateRoute> },

  // Virtual cards
  { path: "/vc/:id",                    element: <PrivateRoute><LayoutWrapper><VirtualCardPublicView /></LayoutWrapper></PrivateRoute> },

  // Career
  { path: "/startupark/launchpad",              element: <PrivateRoute><LayoutWrapper><CareerLaunchPad /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/jobposting",             element: <PrivateRoute><LayoutWrapper><StartupJobPosting /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startup/applications",   element: <PrivateRoute><LayoutWrapper><StartupApplications /></LayoutWrapper></PrivateRoute> },

  // Virtual Events
  { path: "/startupark/startup/events", element: <PrivateRoute><LayoutWrapper><StartupEventsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/events",         element: <PrivateRoute><LayoutWrapper><UserEventsPage /></LayoutWrapper></PrivateRoute> },
  { path: "/events/:id",                element: <PrivateRoute><LayoutWrapper><EventDetailPage /></LayoutWrapper></PrivateRoute> },

  // Video Conference Room — no dock/layout wrapper needed
  { path: "/virtual-event/:id",         element: <PrivateRoute><VideoConferencePage /></PrivateRoute> },

  // ProjectArk
  { path: "/startupark/projectark",                    element: <PrivateRoute><LayoutWrapper><ProjectArk /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/projectark/create",             element: <PrivateRoute><LayoutWrapper><CreateWorkPost /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/projectark/posts/:postId",      element: <PrivateRoute><LayoutWrapper><WorkPostDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/engagements/:engagementId",     element: <PrivateRoute><LayoutWrapper><EngagementDetail /></LayoutWrapper></PrivateRoute> },
];
