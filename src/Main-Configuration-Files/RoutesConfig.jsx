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
// common files sidebars
import MainDashboard from "../Jsons/SidebarOptions/MainDashboardSidebar.json";
import Pricingpagesidebar from "../Jsons/SidebarOptions/PricingPageSidebar.json";
import UserDashboardSidebar from '../Jsons/SidebarOptions/UserDashboardSidebar.json';
import StartupDashboardSidebar from '../Jsons/SidebarOptions/StartupDashboardSidebar.json';
import StudentDashboardSidebar from '../Jsons/SidebarOptions/StudentDashboardSidebar.json';
// Startup pages
import Smart from '../pages/Product-Specific-Pages/SmartSetup'
import SmartUserDashboard from '../pages/Product-Specific-Pages/S-mart/UserDashboard'

// startup pages sidebar
import SmartStartupProfile from '../pages/Product-Specific-Pages/S-mart/startups/startup-profile/StartupProfile';

// startup components
import StartupDetail from '../pages/Product-Specific-Pages/S-mart/startups/startup-list/startup-description-page/StartupDetail'
import StartupList from '../pages/Product-Specific-Pages/S-mart/startups/startup-list/StartupList'
import EditStartupProfile from "../pages/Product-Specific-Pages/S-mart/startups/startup-profile/EditStartupProfile";
import StartupDashboard from "../pages/Product-Specific-Pages/S-mart/startups/startup-dashboard/StartupDashboard";


//students
import StudentDashboard from '../pages/Product-Specific-Pages/S-mart/students/StudentDashboard';

import ProductShowcasePage from "../pages/Product-Specific-Pages/S-mart/products/ProductShowcasePage"
import Startups from "../pages/Product-Specific-Pages/S-mart/startups/startup-list/Startups";
import ProductDetail from "../pages/Product-Specific-Pages/S-mart/products/ProductDetail";
import FavoritesPage from "../pages/Product-Specific-Pages/S-mart/startups/startup-list/FavoritesPage";

import BlogPage from "../pages/Product-Specific-Pages/S-mart/blog/BlogPage"
import VirtualCardPublicView from "../pages/Product-Specific-Pages/S-mart/startups/VirtualCardPublicView";


//bookings
import UserBookingsPage from "../pages/Product-Specific-Pages/S-mart/bookings/UserBookingsPage";
import StartupBookingsPage from "../pages/Product-Specific-Pages/S-mart/bookings/StartupBookingsPage";
import UserCalendarPage from "../pages/Product-Specific-Pages/S-mart/calendars/UserCalendarPage";
import StartupCalendarPage from "../pages/Product-Specific-Pages/S-mart/calendars/StartupCalendarPage";

import ChatInterface from "../pages/Product-Specific-Pages/S-mart/chat/ChatInterface";

//career
import CareerLaunchPad from "../pages/Product-Specific-Pages/S-mart/students/careerlaunchpad/CareerLaunchPad";
import StartupJobPosting from "../pages/Product-Specific-Pages/S-mart/students/careerlaunchpad/StartupJobPosting";
import StartupApplications from "../pages/Product-Specific-Pages/S-mart/students/application/StartupApplications";
//V-events
import StartupVEvents from "../pages/Product-Specific-Pages/S-mart/VirtualEvent/StartupVEvents";
import VEvents from "../pages/Product-Specific-Pages/S-mart/VirtualEvent/VEvents";
// V-events - UPDATED IMPORTS
import StartupEventsPage from "../pages/Product-Specific-Pages/S-mart/VirtualEvent/StartupEventsPage";
import UserEventsPage from "../pages/Product-Specific-Pages/S-mart/VirtualEvent/UserEventsPage";
import EventDetailPage from "../pages/Product-Specific-Pages/S-mart/VirtualEvent/EventDetailPage";
import VideoConferencePage from "../pages/Product-Specific-Pages/S-mart/VirtualEvent/VideoConference";
import ProductPlans from "../pages/ProductPlans";
import ProductManagement from "../pages/Product-Specific-Pages/S-mart/products/ProductManagement";
import CalendarWrapper from "../pages/Product-Specific-Pages/S-mart/calendars/CalendarWrapper";
import Loader from "../components/Loader";

// ** Public Routes (No Auth Required) **
export const publicRoutes = [
  { path: "/", element: <Navigate to="/login" /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
];

// ** Private Routes (Require Auth) **
export const privateRoutes = [
  // Pages with fixed sidebars
  { path: "/profile", element: (<PrivateRoute><LayoutWrapper sidebarOptions={MainDashboard}><Profile /></LayoutWrapper></PrivateRoute>) },
  { path: "/dashboard", element: (<PrivateRoute><LayoutWrapper sidebarOptions={MainDashboard}><Dashboard /></LayoutWrapper></PrivateRoute>) },
  { path: "/pricing", element: (<PrivateRoute><LayoutWrapper sidebarOptions={Pricingpagesidebar}><Pricing /></LayoutWrapper></PrivateRoute>) },
{ path: "/pricing/:productId", element: (<PrivateRoute><LayoutWrapper sidebarOptions={Pricingpagesidebar}><ProductPlans /></LayoutWrapper></PrivateRoute>) },
  { path: "/settings", element: (<PrivateRoute><LayoutWrapper sidebarOptions={MainDashboard}><Settings /></LayoutWrapper></PrivateRoute>) },

  // pages
  { path: "/smart", element: <PrivateRoute><Smart /></PrivateRoute> },

  // Role-specific dashboards with fixed sidebars
  { path: "/smart/user-dashboard", element: (<PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><SmartUserDashboard /></LayoutWrapper></PrivateRoute>) },
  { path: "/smart/startup-dashboard", element: (<PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupDashboard /></LayoutWrapper ></PrivateRoute>) },
  { path: "/smart/student-dashboard", element: (<PrivateRoute><LayoutWrapper sidebarOptions={StudentDashboardSidebar}><StudentDashboard /></LayoutWrapper></PrivateRoute>) },
  
  //startup-profile with fixed sidebar
  { path: "/smart/startup-profile", element: (<PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><SmartStartupProfile /></LayoutWrapper ></PrivateRoute>) },
  { path: "/smart/startup-edit-profile", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><EditStartupProfile /></LayoutWrapper></PrivateRoute> },

  // Pages with dynamic sidebars
  { path: "/smart/startupsList", element: <PrivateRoute><LayoutWrapper dynamicSidebar><Startups /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/startups", element: <PrivateRoute><LayoutWrapper dynamicSidebar><StartupList /></LayoutWrapper></PrivateRoute> },
  { path: "/smart/startups/:id", element: <PrivateRoute><LayoutWrapper dynamicSidebar><StartupDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/smart/startups-by-id/:id", element: <PrivateRoute><LayoutWrapper dynamicSidebar><StartupDetail /></LayoutWrapper></PrivateRoute> },
  
  //favorites with dynamic sidebar
  { path: "/smart/favorites", element: <PrivateRoute><LayoutWrapper dynamicSidebar><FavoritesPage /></LayoutWrapper ></PrivateRoute> },

  //products with dynamic sidebar
  { path: "/products", element: (<PrivateRoute><LayoutWrapper dynamicSidebar><ProductShowcasePage /></LayoutWrapper ></PrivateRoute>) },
  { path: "/products/:id", element: (<PrivateRoute><LayoutWrapper dynamicSidebar><ProductDetail /></LayoutWrapper ></PrivateRoute>) },
  { path: "/manage-products", element: (<PrivateRoute><LayoutWrapper dynamicSidebar><ProductManagement /></LayoutWrapper ></PrivateRoute>) },

  //bookings with fixed sidebars
  { path: "/smart/my-bookings", element: <PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><UserBookingsPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/manage-bookings", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupBookingsPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/bookings/calendar/:type", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><CalendarWrapper /></LayoutWrapper ></PrivateRoute> },

  //chat with dynamic sidebar
  { path: "/smart/chat", element: <PrivateRoute><LayoutWrapper dynamicSidebar><ChatInterface /></LayoutWrapper></PrivateRoute> },
  { path: "/smart/chat/:startupId", element: <PrivateRoute><LayoutWrapper dynamicSidebar><ChatInterface /></LayoutWrapper></PrivateRoute> },
  
  //blog with fixed sidebar
  { path: "/smart/blog", element: <PrivateRoute><LayoutWrapper dynamicSidebar><BlogPage /></LayoutWrapper ></PrivateRoute> },
  
  //calendar with fixed sidebars
  { path: "/smart/usercalender", element: <PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><UserCalendarPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/startupcalender", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupCalendarPage /></LayoutWrapper ></PrivateRoute> },
  
  //startup-virtual-cards with dynamic sidebar
  { path: "/vc/:id", element: <PrivateRoute><LayoutWrapper dynamicSidebar><VirtualCardPublicView /></LayoutWrapper ></PrivateRoute> },
  
  //career pages with fixed sidebars
  { path: "/smart/launchpad", element: <PrivateRoute><LayoutWrapper dynamicSidebar><CareerLaunchPad /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/jobposting", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupJobPosting /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/startup/applications", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupApplications /></LayoutWrapper ></PrivateRoute> },

  // ========== VIRTUAL EVENTS ROUTES ==========
  // Events with fixed sidebars
  { path: "/smart/sv-event", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupVEvents /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/v-event", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><VEvents /></LayoutWrapper ></PrivateRoute> },
  { 
    path: "/smart/startup/events", 
    element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupEventsPage /></LayoutWrapper ></PrivateRoute> 
  },
  { 
    path: "/smart/events", 
    element: <PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><UserEventsPage /></LayoutWrapper ></PrivateRoute> 
  },
  
  // Event Details with dynamic sidebar
  { 
    path: "/events/:id", 
    element: <PrivateRoute><LayoutWrapper dynamicSidebar><EventDetailPage /></LayoutWrapper ></PrivateRoute> 
  },
  
  // Video Conference Room - no sidebar
  { 
    path: "/virtual-event/:id", 
    element: <PrivateRoute><VideoConferencePage /></PrivateRoute> 
  },

  //{ path: "/loader", element: <PrivateRoute><LayoutWrapper dynamicSidebar><Loader /></LayoutWrapper></PrivateRoute> },
];