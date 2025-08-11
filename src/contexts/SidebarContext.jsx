// contexts/SidebarContext.jsx
import { createContext, useContext } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children, options }) => {
  return (
    <SidebarContext.Provider value={options}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};