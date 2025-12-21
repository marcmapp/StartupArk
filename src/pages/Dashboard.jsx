import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HyperText from "../components/HyperText";
import Loader from "../components/Loader";
import "boxicons";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ projects: 0, connections: 0, milestones: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/api/mappuser/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        // Mock stats - replace with actual API calls
        setStats({
          projects: 3,
          connections: 12,
          milestones: 7
        });
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  // Real-time clock with seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const upcomingEvents = [
    { title: "Investor Meet", date: "Tomorrow, 2:00 PM", type: "networking" },
    { title: "Pitch Practice", date: "Dec 15, 4:00 PM", type: "workshop" },
    { title: "Funding Deadline", date: "Dec 20", type: "deadline" }
  ];

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border border-2 border-cyan-500 lg:max-w-[95%] max-w-[92%] lg:ml-8 ml-6 lg:mt-0 mt-12 rounded-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Welcome to <span className="text-highlight">MAPP ARKS</span>,{" "}
                <HyperText>{user.username}</HyperText>
              </h1>
              <p className="text-gray-600 mt-2">Discover startup insights and Founders And Join Popular Virtual Events!</p>
            </div>
            <div className="flex items-center space-x-4">
  <div className="text-right">
    <p className="text-5xl font-mono font-bold text-white 
                  [text-shadow:_0_0_10px_#00ffff,_0_0_20px_#00ffff,_0_0_30px_#0080ff]">
      {currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })}
    </p>
    <p className="font-semibold text-cyan-500">
      {currentTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </p>
  </div>
</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Stats & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
           {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Latest Updates</h2>
              <div className="text-center py-8">
                <box-icon name="news" size="48px" color="#9CA3AF"></box-icon>
                <p className="text-gray-500 mt-4">Your personalized news and updates will appear here soon!</p>
                <button className="mt-4 px-4 py-2 bg-highlight text-white rounded-lg hover:bg-opacity-90 transition-colors">
                  Explore News
                </button>
              </div>
            </div>
             
            

            {/* CTA Section */}
            <div className="rounded-xl shadow-sm p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Get Started!</h2>
              <p className="mb-4 text-secondary">Browse through startup's and connect with them</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate("/startupark")}
                  className="px-6 py-3 text-highlight border dark:border-white border-black font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                Join!
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Events & Resources */}
          <div className="space-y-8">
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-12 rounded-full mr-4 ${
                      event.type === 'networking' ? 'bg-blue-500' : 
                      event.type === 'workshop' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-center text-highlight font-medium hover:bg-gray-50 rounded-lg transition-colors">
                View All Events
              </button>
            </div>

            {/* Community Spotlight */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Community Spotlight</h2>
              <p className="text-gray-600 text-sm mb-4">
                Join <span className="font-semibold text-highlight">1,200+</span> entrepreneurs and investors building the future together. Share insights, find partners, and grow your network.
              </p>
              <div className="space-y-3 mb-4 text-gray-500">
                <div className="flex items-center text-sm">
                  <box-icon name="user-check" size="16px" color="#10b981" className="mr-2"></box-icon>
                  <span>Connect with verified investors</span>
                </div>
                <div className="flex items-center text-sm">
                  <box-icon name="rocket" size="16px" color="#3b82f6" className="mr-2"></box-icon>
                  <span>Discover innovative startups</span>
                </div>
                <div className="flex items-center text-sm">
                  <box-icon name="chart" size="16px" color="#f59e0b" className="mr-2"></box-icon>
                  <span>Access growth resources</span>
                </div>
              </div>
              <button className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors">
                Explore Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;