// components/LayoutWrapper.jsx
import { useTheme } from "../components/ThemeContext";
import AppSidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import all sidebars
import UserDashboardSidebar from '../Jsons/SidebarOptions/UserDashboardSidebar.json';
import StartupDashboardSidebar from '../Jsons/SidebarOptions/StartupDashboardSidebar.json';
import StudentDashboardSidebar from '../Jsons/SidebarOptions/StudentDashboardSidebar.json';
import MainDashboard from "../Jsons/SidebarOptions/MainDashboardSidebar.json";
import Pricingpagesidebar from "../Jsons/SidebarOptions/PricingPageSidebar.json";

const LayoutWrapper = ({ children, sidebarOptions, dynamicSidebar = false }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Enhanced function to determine which sidebar to use
  const getSidebarOptions = () => {
    // If specific sidebar options are provided, use them (highest priority)
    if (sidebarOptions) return sidebarOptions;
    
    // If dynamicSidebar is true, determine sidebar based on user role
    if (dynamicSidebar && user) {
      // Enhanced role detection
      const userRole = user.smartRole || user.role || (user.isStartup ? 'startup' : 'user');
      
      switch (userRole) {
        case 'startup':
          return StartupDashboardSidebar;
        case 'student':
          return StudentDashboardSidebar;
        case 'user':
        default:
          return UserDashboardSidebar;
      }
    }
    
    // If no specific options and not dynamic, return null (no sidebar)
    return null;
  };

  const finalSidebarOptions = getSidebarOptions();

  // Convert sidebar options to include JSX icons
  const transformedSidebarOptions = finalSidebarOptions?.map((item) => ({
    ...item,
    icon: (
      <box-icon
        name={item.icon}
        type={item.type || "regular"}
        color={darkMode ? "white" : "gray"}
      ></box-icon>
    ),
  }));

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error(error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen">
      {transformedSidebarOptions && (
        <AppSidebar 
          user={user} 
          navigationData={transformedSidebarOptions} 
          className="fixed h-screen"
        />
      )}

      <main className={`flex-1 p-6 ${transformedSidebarOptions ? 'ml-0 md:ml-12' : ''}`}>
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 p-2 rounded-full shadow-lg
                    bg-white dark:bg-black
                    hover:from-blue-600 hover:to-purple-700 dark:hover:from-gray-800 dark:hover:to-gray-950
                    transition-all duration-300 ease-in-out transform hover:scale-105
                    border-2 border-gray-300 dark:border-gray-300"
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {children}
      </main>
    </div>
  );
};

export default LayoutWrapper;