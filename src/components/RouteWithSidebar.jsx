// components/RouteWithSidebar.jsx
import MainLayout from '../layouts/MainLayout';
import { SidebarProvider } from '../contexts/SidebarContext';

const RouteWithSidebar = ({ children, sidebarOptions }) => {
  return (
    <SidebarProvider options={sidebarOptions}>
      <MainLayout>
        {children}
      </MainLayout>
    </SidebarProvider>
  );
};

export default RouteWithSidebar;