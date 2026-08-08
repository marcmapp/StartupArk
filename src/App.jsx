import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { publicRoutes, privateRoutes } from "./Main-Configuration-Files/RoutesConfig";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import { track } from "./services/analytics";
import { useTheme } from "./components/ThemeContext";

const App = () => {
  const { darkMode } = useTheme();
  // Best-effort tab-close signal. `beforeunload` is not guaranteed to fire
  // (mobile browsers, crashes, force-quits all skip it) — this undercounts
  // session_end, but it's the only client-side hook available without a
  // heartbeat/ping architecture, which is out of scope here.
  useEffect(() => {
    const onUnload = () => track('session_end', 'session', null);
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return (
    <>
      <ScrollToTop />
      <ScrollToTopButton />
      <Routes>
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        {privateRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
      <ToastContainer position="bottom-right" theme={darkMode ? "dark" : "light"} />
    </>
  );
};

export default App;
