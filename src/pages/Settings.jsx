import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import axios from 'axios';
import { motion } from "framer-motion";
const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/api/mappuser/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error(error);
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Appearance" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full mt-1 p-3 rounded-md bg-gray-800 text-white focus:ring focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full mt-1 p-3 rounded-md bg-gray-800 text-white focus:ring focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-3 rounded-md font-medium"
              >
                Save Changes
              </button>
            </form>
          </motion.div>
        );
      case "appearance":
        return (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-sm font-medium w-1/3">Theme</span>
                <select
                  className="w-2/3 p-3 rounded-md bg-gray-800 text-white focus:ring focus:ring-blue-500 focus:outline-none"
                >
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System Default</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium w-1/3">Font Size</span>
                <select
                  className="w-2/3 p-3 rounded-md bg-gray-800 text-white focus:ring focus:ring-blue-500 focus:outline-none"
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      case "security":
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full mt-1 p-3 rounded-md bg-gray-800 text-white focus:ring focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter a new password"
                />
              </div>
              <div>
                <label htmlFor="twofa" className="block text-sm font-medium">
                  Two-Factor Authentication
                </label>
                <input
                  type="checkbox"
                  id="twofa"
                  className="w-5 h-5 rounded focus:ring focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-3 rounded-md font-medium"
              >
                Save Changes
              </button>
            </form>
          </motion.div>
        );
      case "notifications":
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-sm font-medium w-1/3">
                  Email Notifications
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded focus:ring focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium w-1/3">
                  Push Notifications
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded focus:ring focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
     
      <div className="inset-0 flex items-center justify-center">
        <div className="bg-black border-2 border-white w-full h-[35rem] max-w-4xl rounded-lg shadow-lg overflow-hidden mx-4 md:mx-0">
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex bg-gray-800 p-4 space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-gray-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto flex-grow">
              <AnimatePresence>{renderContent()}</AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
