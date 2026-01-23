import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Loader from "../../../../../components/Loader";
import StartupList from '../startups/startup-list/StartupList';
import RoleSwitcher from '../../RoleSwitcher';
import StartuparkSetup from '../../startupark-setup/StartuparkSetup';
import {
  EyeIcon,
  ArrowRightIcon,
  HeartIcon,
  BriefcaseIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showStartupSetup, setShowStartupSetup] = useState(false);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const userRes = await axios.get(`${baseUrl}/api/mappuser/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUser(userRes.data);
        
        if (userRes.data.startuparkRole === 'startup' && !userRes.data.hasAgreedTostartuparkStartup) {
          setShowStartupSetup(true);
        }
      } catch (error) {
        console.error(error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, baseUrl]);

// In UserDashboard.jsx - Update handleRoleSwitch function
const handleRoleSwitch = async (role) => {
  setRoleSwitchLoading(true);
  try {
    const token = localStorage.getItem("token");
    
    // Check if user already has a startup form
    const setupCheck = await axios.get(`${baseUrl}/startupark/api/startupark/form/startup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (setupCheck.data.hasFormData) {
      // Already has startup form - switch role directly
      await axios.post(
        `${baseUrl}/startupark/api/startupark/switch-to-startup`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local user state
      const userRes = await axios.get(`${baseUrl}/api/mappuser/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);
      
      // Navigate to startup dashboard
      navigate('/startupark/startup-dashboard');
    } else {
      // No startup form yet - show setup
      setShowStartupSetup(true);
    }
  } catch (error) {
    console.error('Role switch failed:', error);
    // Even on error, show setup
    setShowStartupSetup(true);
  } finally {
    setRoleSwitchLoading(false);
  }
};

// Update handleSetupComplete function
const handleSetupComplete = async () => {
  setShowStartupSetup(false);
  const token = localStorage.getItem("token");
  
  try {
    // Get updated user data
    const userRes = await axios.get(`${baseUrl}/api/mappuser/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Check if role is already startup
    if (userRes.data.startuparkRole === 'startup') {
      navigate('/startupark/startup-dashboard');
    } else {
      // Force switch to startup role
      await axios.post(
        `${baseUrl}/startupark/api/startupark/switch-to-startup`,
        { role: 'startup' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state and redirect
      setUser(prev => ({ ...prev, startuparkRole: 'startup' }));
      navigate('/startupark/startup-dashboard');
    }
  } catch (error) {
    console.error('Failed after setup:', error);
    // Still try to redirect
    navigate('/startupark/startup-dashboard');
  }
};

  const QuickActionCard = ({ title, description, icon: Icon, action, buttonText }) => (
    <div className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 rounded-xl bg-cyan-50">
          <Icon className="h-6 w-6 text-cyan-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold  mb-2">{title}</h3>
          <p className=" text-sm mb-4">{description}</p>
          <button
            onClick={action}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 " />
          <h2 className="text-lg font-semibold ">{title}</h2>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Loader />;
  }

  if (showStartupSetup) {
    return <StartuparkSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
  <div className="flex items-center justify-between"> {/* Changed to justify-between */}
    <div className="flex items-center space-x-4">
      {/* User Icon Placeholder */}
      <div className="h-16 w-16 rounded-xl bg-cyan-100 flex items-center justify-center border border-cyan-200">
        
        <UserCircleIcon className="h-10 w-10 text-cyan-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold ">
          Welcome back, <span className='text-highlight'>{user.username || user.email}</span>!
        </h1>
        <p className=" mt-1">
          Discover and connect with innovative startups.
        </p>
      </div>
    </div>
    {/* RoleSwitcher moved here */}
    <div className="lg:mr-2 md:mr-0">
    
<RoleSwitcher 
  currentRole={user.startuparkRole} 
  setLoading={setRoleSwitchLoading}
  setShowStartupSetup={setShowStartupSetup}
  loading={roleSwitchLoading}
/>
    </div>
  </div>
</div>

     

      {user.startuparkRole === 'user' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <InfoCard title="Quick Actions" icon={BriefcaseIcon}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickActionCard
                  title="Browse Startups"
                  description="Explore all available startups"
                  icon={EyeIcon}
                  action={() => navigate('/startupark/startups')}
                  buttonText="Browse"
                />
                <QuickActionCard
                  title="Saved Startups"
                  description="View your favorite startups"
                  icon={HeartIcon}
                  action={() => navigate('/startupark/saved-startups')}
                  buttonText="View Saved"
                />
              </div>
            </InfoCard>

            {/* Recent Startups Preview */}
            <InfoCard title="Recent Startups" icon={ClockIcon}>
              <div className="space-y-4">
                <StartupList compact={true} />
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/startupark/startups')}
                    className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    View All Startups
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Links */}
            <InfoCard title="Quick Links" icon={ArrowRightIcon}>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/startupark/startups?filter=trending')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-cyan-300  transition-colors duration-200"
                >
                  <p className="font-medium ">Trending Startups</p>
                  <p className="text-sm  mt-1">Most viewed this week</p>
                </button>
                <button
                  onClick={() => navigate('/startupark/startups?filter=recent')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors duration-200"
                >
                  <p className="font-medium ">Recently Added</p>
                  <p className="text-sm  mt-1">Newest startups</p>
                </button>
                <button
                  onClick={() => navigate('/startupark/startups?filter=funding')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors duration-200"
                >
                  <p className="font-medium ">Seeking Funding</p>
                  <p className="text-sm  mt-1">Startups looking for investors</p>
                </button>
              </div>
            </InfoCard>

            {/* Platform Info */}
            <InfoCard title="Platform Info" icon={BuildingStorefrontIcon}>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-100">
                  <h3 className="font-semibold text-cyan-900 mb-2">Discover Startups</h3>
                  <p className="text-sm text-cyan-700">
                    Browse through innovative startups, save your favorites, and connect with founders.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <h3 className="font-semibold  mb-2">Switch Roles</h3>
                  <p className="text-sm ">
                    Want to showcase your own startup? Switch to startup mode anytime.
                  </p>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mx-4 sm:mx-8">
          <h2 className="text-xl font-semibold mb-4">Startup Mode Active</h2>
          <p className="mb-4">
            You're currently viewing the platform as a startup. 
            You can switch back to user mode at any time.
          </p>
          <button
            onClick={() => navigate('/startupark/startup-dashboard')}
            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
          >
            Go to Startup Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;