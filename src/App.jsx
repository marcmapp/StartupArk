import { Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./Main-Configuration-Files/RoutesConfig";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";

const App = () => {
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
    </>
  );
};

export default App;
