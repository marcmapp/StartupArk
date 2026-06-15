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
import Loader from "../components/Loader";
import GeoSearch from "../pages/Product-Specific-Pages/startupark/geo/GeoSearch";
import ProjectArk from "../pages/Product-Specific-Pages/startupark/projectark/ProjectArk";
import CreateWorkPost from "../pages/Product-Specific-Pages/startupark/projectark/CreateWorkPost";

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
// Update this line in your privateRoutes array
{ path: "/startupark", element: <PrivateRoute><LayoutWrapper sidebarOptions={MainDashboard}><Startupark /></LayoutWrapper></PrivateRoute> },

  // Role-specific dashboards with fixed sidebars
  { path: "/startupark/user-dashboard", element: (<PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><StartuparkUserDashboard /></LayoutWrapper></PrivateRoute>) },
  { path: "/startupark/startup-dashboard", element: (<PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupDashboard /></LayoutWrapper ></PrivateRoute>) },
  { path: "/startupark/student-dashboard", element: (<PrivateRoute><LayoutWrapper sidebarOptions={StudentDashboardSidebar}><StudentDashboard /></LayoutWrapper></PrivateRoute>) },
  
  //startup-profile with fixed sidebar
  { path: "/startupark/startup-profile", element: (<PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartuparkStartupProfile /></LayoutWrapper ></PrivateRoute>) },
  { path: "/startupark/startup-edit-profile", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><EditStartupProfile /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/edit-profile", element: <PrivateRoute><LayoutWrapper dynamicSidebar><EditProfile /></LayoutWrapper></PrivateRoute> },

  // Pages with dynamic sidebars
  { path: "/startupark/startupsList", element: <PrivateRoute><LayoutWrapper dynamicSidebar><Startups /></LayoutWrapper ></PrivateRoute> },
  { path: "/startupark/startups", element: <PrivateRoute><LayoutWrapper dynamicSidebar><StartupList /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/nearby", element: <PrivateRoute><LayoutWrapper dynamicSidebar><GeoSearch /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startups/:id", element: <PrivateRoute><LayoutWrapper dynamicSidebar><StartupDetail /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/startups-by-id/:id", element: <PrivateRoute><LayoutWrapper dynamicSidebar><StartupDetail /></LayoutWrapper></PrivateRoute> },
  
  //favorites with dynamic sidebar
  { path: "/startupark/favorites", element: <PrivateRoute><LayoutWrapper dynamicSidebar><FavoritesPage /></LayoutWrapper ></PrivateRoute> },

  //products with dynamic sidebar
  { path: "/products", element: (<PrivateRoute><LayoutWrapper dynamicSidebar><ProductShowcasePage /></LayoutWrapper ></PrivateRoute>) },
  { path: "/products/:id", element: (<PrivateRoute><LayoutWrapper dynamicSidebar><ProductDetail /></LayoutWrapper ></PrivateRoute>) },
  { path: "/manage-products", element: (<PrivateRoute><LayoutWrapper dynamicSidebar><ProductManagement /></LayoutWrapper ></PrivateRoute>) },

  //bookings with fixed sidebars
  { path: "/startupark/my-bookings", element: <PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><UserBookingsPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/startupark/manage-bookings", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupBookingsPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/startupark/bookings/calendar/:type", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><CalendarWrapper /></LayoutWrapper ></PrivateRoute> },

  //chat with dynamic sidebar
  { path: "/startupark/chat", element: <PrivateRoute><LayoutWrapper dynamicSidebar><ChatInterface /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/chat/:startupId", element: <PrivateRoute><LayoutWrapper dynamicSidebar><ChatInterface /></LayoutWrapper></PrivateRoute> },
  
  //blog with fixed sidebar
  { path: "/startupark/blog", element: <PrivateRoute><LayoutWrapper dynamicSidebar><BlogPage /></LayoutWrapper ></PrivateRoute> },
  
  //calendar with fixed sidebars
  { path: "/startupark/usercalender", element: <PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><UserCalendarPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/startupark/startupcalender", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupCalendarPage /></LayoutWrapper ></PrivateRoute> },
  
  //startup-virtual-cards with dynamic sidebar
  { path: "/vc/:id", element: <PrivateRoute><LayoutWrapper dynamicSidebar><VirtualCardPublicView /></LayoutWrapper ></PrivateRoute> },
  
  //career pages with fixed sidebars
  { path: "/startupark/launchpad", element: <PrivateRoute><LayoutWrapper dynamicSidebar><CareerLaunchPad /></LayoutWrapper ></PrivateRoute> },
  { path: "/startupark/jobposting", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupJobPosting /></LayoutWrapper ></PrivateRoute> },
  { path: "/startupark/startup/applications", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupApplications /></LayoutWrapper ></PrivateRoute> },

  // ========== VIRTUAL EVENTS ROUTES ==========
  // (Removed dead duplicate routes sv-event/v-event → StartupVEvents/VEvents.)
  {
    path: "/startupark/startup/events", 
    element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupEventsPage /></LayoutWrapper ></PrivateRoute> 
  },
  { 
    path: "/startupark/events", 
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

  // ========== PROJECTARK ROUTES ==========
  { path: "/startupark/projectark", element: <PrivateRoute><LayoutWrapper dynamicSidebar><ProjectArk /></LayoutWrapper></PrivateRoute> },
  { path: "/startupark/projectark/create", element: <PrivateRoute><LayoutWrapper dynamicSidebar><CreateWorkPost /></LayoutWrapper></PrivateRoute> },
];