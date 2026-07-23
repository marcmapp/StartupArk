// components/LayoutWrapper.jsx
// Sidebar has been retired as of the unified-dock migration.
// AppSidebar and the role-specific JSON configs are no longer rendered here;
// moved to _rollback-unified-dock-migration/ at repo root as a rollback safety net.
//
// Header consolidation: search, notification/favorites bells, theme toggle,
// and the account avatar used to be independent `fixed` widgets scattered
// around the viewport corners ("free-winged" layout). They now live in one
// fixed top Header bar; the bottom FloatingDock is navigation-only.
import { useTheme } from "../components/ThemeContext";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RoleBasedFloatingDock from "../components/FloatingDock";
import PageHeader from "../components/PageHeader";
import Header from "../components/Header";
import { useActiveProduct } from "../hooks/useNavPreferences";
import { SocketProvider } from "../contexts/SocketContext";

const LayoutWrapper = ({ children }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const activeProduct = useActiveProduct();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/api/mappuser/me`, {
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
    // One shared socket for NotificationBell (now in Header) + ChatInterface (page content).
    <SocketProvider user={user}>
      <div className="flex min-h-screen flex-col">
        <Header
          user={user}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          showProductWidgets={activeProduct === 'startupark'}
        />

        <main className="flex-1 p-6 pt-20" style={{ paddingBottom: 'var(--dock-clearance, 120px)' }}>
          <PageHeader />

          {/* Page content */}
          {children}

          {/* Unified bottom dock — navigation only, account menu lives in Header */}
          <RoleBasedFloatingDock user={user} />
        </main>
      </div>
    </SocketProvider>
  );
};

export default LayoutWrapper;
