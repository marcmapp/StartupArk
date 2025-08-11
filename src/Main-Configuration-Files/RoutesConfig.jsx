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
// common files sidebars
import MainDashboard from "../Jsons/SidebarOptions/MainDashboardSidebar.json";
import Pricingpagesidebar from "../Jsons/SidebarOptions/PricingPageSidebar.json";


// Startup pages
import Smart from '../pages/Product-Specific-Pages/SmartSetup'
import SmartUserDashboard from '../pages/Product-Specific-Pages/S-mart/UserDashboard'
import UserDashboardSidebar from '../Jsons/SidebarOptions/UserDashboardSidebar.json';
// startup pages sidebar
import StartupDashboardSidebar from '../Jsons/SidebarOptions/StartupDashboardSidebar.json';
import SmartStartupProfile from '../pages/Product-Specific-Pages/S-mart/startups/startup-profile/StartupProfile';

// startup components
import StartupDetail from '../pages/Product-Specific-Pages/S-mart/startups/startup-list/startup-description-page/StartupDetail'
import StartupList from '../pages/Product-Specific-Pages/S-mart/startups/startup-list/StartupList'
import EditStartupProfile from "../pages/Product-Specific-Pages/S-mart/startups/startup-profile/EditStartupProfile";
import StartupDashboard from "../pages/Product-Specific-Pages/S-mart/startups/startup-dashboard/StartupDashboard";

import ProductShowcasePage from "../pages/Product-Specific-Pages/S-mart/products/ProductShowcasePage"
import Startups from "../pages/Product-Specific-Pages/S-mart/startups/startup-list/Startups";
import ProductDetail from "../pages/Product-Specific-Pages/S-mart/products/ProductDetail";
import FavoritesPage from "../pages/Product-Specific-Pages/S-mart/startups/startup-list/FavoritesPage";
import OrdersPage from "../pages/Product-Specific-Pages/S-mart/startups/orders/OrdersPage";
import ChatPage from "../pages/Product-Specific-Pages/S-mart/chat/ChatPage"
import BlogPage from "../pages/Product-Specific-Pages/S-mart/blog/BlogPage"
import VirtualCardPublicView from "../pages/Product-Specific-Pages/S-mart/startups/VirtualCardPublicView";
// ** Public Routes (No Auth Required) **
export const publicRoutes = [
  { path: "/", element: <Navigate to="/login" /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
];

// ** Private Routes (Require Auth) **
export const privateRoutes = [
  { path: "/dashboard", element:( <PrivateRoute><LayoutWrapper sidebarOptions={MainDashboard}><Dashboard /></LayoutWrapper></PrivateRoute> )},
  { path: "/pricing", element: (<PrivateRoute><LayoutWrapper sidebarOptions={Pricingpagesidebar}><Pricing /></LayoutWrapper></PrivateRoute> )},
  { path: "/settings", element:( <PrivateRoute><LayoutWrapper sidebarOptions={MainDashboard}><Settings /></LayoutWrapper></PrivateRoute> )},

  // pages
  { path: "/smart", element: <PrivateRoute><Smart /></PrivateRoute> },
  
  { path: "/smart/user-dashboard", element:( <PrivateRoute><LayoutWrapper sidebarOptions={UserDashboardSidebar}><SmartUserDashboard /></LayoutWrapper></PrivateRoute> )},
  { path: "/smart/startup-dashboard", element:( <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><StartupDashboard /></LayoutWrapper ></PrivateRoute> )},
  { path: "/smart/profile", element:( <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><SmartStartupProfile /></LayoutWrapper ></PrivateRoute> )},

  { path: "/products", element:( <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><ProductShowcasePage /></LayoutWrapper ></PrivateRoute> )},
  
   { path: "/products/:id", element:( <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><ProductDetail /></LayoutWrapper ></PrivateRoute> )},
  { path: "/smart/startupsList", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><Startups /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/favorites", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><FavoritesPage /></LayoutWrapper ></PrivateRoute> },
    


  { path: "/smart/startups", element: <PrivateRoute><StartupList /></PrivateRoute> },
  { path: "/smart/startups/:id", element: <PrivateRoute><StartupDetail /></PrivateRoute> },

  { path: "/smart/editprofile", element: <PrivateRoute><EditStartupProfile /></PrivateRoute> },



  { path: "/smart/bookings", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><OrdersPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/chat", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><ChatPage /></LayoutWrapper ></PrivateRoute> },
  { path: "/smart/blog", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><BlogPage /></LayoutWrapper ></PrivateRoute> },

  { path: "/vc/:id", element: <PrivateRoute><LayoutWrapper sidebarOptions={StartupDashboardSidebar}><VirtualCardPublicView /></LayoutWrapper ></PrivateRoute> },
];




