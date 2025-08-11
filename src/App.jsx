import { Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./Main-Configuration-Files/RoutesConfig";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {/* Private Routes */}
      {privateRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
};

export default App;