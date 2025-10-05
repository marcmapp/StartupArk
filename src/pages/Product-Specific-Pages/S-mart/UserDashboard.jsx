import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import StartupList from './startups/startup-list/StartupList';
import RoleSwitcher from './RoleSwitcher';
import SmartSetup from '../SmartSetup';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showStartupSetup, setShowStartupSetup] = useState(false);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        
        if (res.data.smartRole === 'startup' && !res.data.hasAgreedToSmartStartup) {
          setShowStartupSetup(true);
        }
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate, showStartupSetup]);

  const handleRoleSwitch = async (role) => {
    setRoleSwitchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const setupCheck = await axios.get(`${baseUrl}/smart/api/smart/form/startup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (setupCheck.data.hasFormData) {
        await axios.post(
          `${baseUrl}/smart/api/smart/role`,
          { role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate('/smart/startup-dashboard');
      } else {
        setShowStartupSetup(true);
      }
    } catch (error) {
      console.error('Role switch failed:', error);
    } finally {
      setRoleSwitchLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowStartupSetup(false);
    const token = localStorage.getItem("token");
    axios.get(`${baseUrl}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setUser(res.data));
  };

  if (!user) {
    return <Loader />;
  }

  if (showStartupSetup) {
    return <SmartSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
      <div className="flex justify-between items-center mb-6 mt-8 ml-4 sm:mt-0 sm:ml-0">
        <h1 className="lg:text-2xl lg:font-bold lg:ml-8 md:ml-4 md:text-xl md:font-bold text-lg font-semibold">
          {user.smartRole === 'startup' ? 'Startup Dashboard' : 'User Dashboard'}
        </h1>
        <div className="lg:mr-2 md:mr-0">
          <RoleSwitcher 
            currentRole={user.smartRole} 
            onSwitch={handleRoleSwitch}
            loading={roleSwitchLoading}
          />
        </div>
      </div>

      {user.smartRole === 'user' ? (
        <StartupList />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mx-4 sm:mx-8"> {/* Added horizontal margins */}
          <h2 className="text-xl font-semibold mb-4">Startup Mode Active</h2>
          <p className="mb-4">
            You're currently viewing the platform as a startup. 
            You can switch back to user mode at any time.
          </p>
          <button
            onClick={() => navigate('/smart/startup-dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go to Startup Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;