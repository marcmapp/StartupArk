import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'boxicons';
import { LOGO_LIGHT, LOGO_DARK } from "../Main-Configuration-Files/constants";

const Sidebar = ({ user, navigationData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
 

  useEffect(() => {
    // Set loading to false once user data is available
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  const getInitials = (username) => {
    if (!username || typeof username !== 'string') return '?';
    
    const names = username.trim().split(' ');
    return names.length === 1 
      ? names[0][0]?.toUpperCase() || '?' 
      : (names[0][0]?.toUpperCase() || '') + (names[1][0]?.toUpperCase() || '');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Show loading state if user data isn't available yet
  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 w-20 h-full border-r dark:border-cyan-300 border-gray-400 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 w-20 h-full border-r-4 dark:border-cyan-300 border-gray-400 space-y-8 hidden md:flex">
        <div className="flex flex-col h-full">
         <div className="h-20 flex items-center justify-center px-8">
  <Link to="/dashboard" className="flex-none">
    {/* Light mode logo */}
    <img
      src={LOGO_DARK}
      width={85}
      className="mx-auto block dark:hidden"
      alt="Logo Light"
    />
    {/* Dark mode logo */}
    <img
      src={LOGO_LIGHT}
      width={85}
      className="mx-auto hidden dark:block"
      alt="Logo Dark"
    />
  </Link>
</div>

          <div className="flex-1 flex flex-col h-full">
            <ul className="px-4 text-sm font-medium flex-1">
              {navigationData.map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.to}
                    className="relative flex items-center justify-center gap-x-2 text-gray-600 p-2 rounded-xl active:bg-gray-100 duration-150 group"
                  >
                    <div className="text-white">{item.icon}</div>
                    <span className="absolute left-14 p-1 px-1.5 rounded-md whitespace-nowrap text-sm font-bold text-sky-600 bg-gray-200 hidden group-hover:inline-block group-focus:hidden duration-150">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="relative py-4 px-4 border-t-4 dark:border-cyan-300 border-gray-400">
              {user && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="outline-none">
                    <Avatar.Root>
                      <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full border-2 dark:border-white border-black">
                        <span className="font-bold text-lg text-sky-600">
                          {getInitials(user?.username)}
                        </span>
                      </div>
                    </Avatar.Root>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="absolute bottom-4 left-10 w-64 rounded-lg bg-black shadow-md border-2 border-white text-sm text-white p-2 z-50">
                      <span className="block text-gray-500/80 p-2">
                        {user?.username || 'User'}
                      </span>
                      <span className="block text-gray-500/80 p-2">
                        {user?.email || ''}
                      </span>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/dashboard"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="chip" color="#9e9a9a"></box-icon>
                          <span>Hub</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/settings"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="cog" color="#9e9a9a"></box-icon>
                          <span>Settings</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/pricing"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="credit-card" color="#9e9a9a"></box-icon>
                          <span>Subscription</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/smart/profile"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="credit-card" color="#9e9a9a"></box-icon>
                          <span>Profile</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <button
                          onClick={handleLogout}
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="log-out-circle" color="#9e9a9a"></box-icon>
                          <span>Logout</span>
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="fixed top-0 left-0 md:hidden w-full p-4 flex justify-between items-center">
       <button onClick={toggleSidebar} className="text-black dark:text-white">
  <box-icon name="menu-alt-left" color="currentColor"></box-icon>
</button>

        {user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="outline-none">
              <Avatar.Root>
                <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden border rounded-full bg-black">
                  <span className="font-bold text-lg text-sky-600">
                    {getInitials(user?.username)}
                  </span>
                </div>
              </Avatar.Root>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="absolute top-2 right-0 w-64 rounded-lg bg-white shadow-md border text-sm text-gray-600 p-2">
                <span className="block text-gray-500/80 p-2">
                  {user?.username || 'User'}
                </span>
                <span className="block text-gray-500/80 p-2">
                  {user?.email || ''}
                </span>
                <DropdownMenu.Item asChild className="outline-none">
                  <button
                    onClick={handleLogout}
                    className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 active:bg-gray-100 duration-150"
                  >
                    <box-icon name="log-out-circle" color="#9e9a9a"></box-icon>
                    <span>Logout</span>
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          <nav className="fixed top-0 left-0 w-64 h-full p-4 space-y-8 border-r dark:border-cyan-300 border-gray-400">
            <div className="flex flex-col h-full">
              <div className="h-20 flex items-center justify-center">
                <Link to="/dashboard" className="flex-none">
    {/* Light mode logo */}
    <img
      src={LOGO_DARK}
      width={85}
      className="mx-auto block dark:hidden"
      alt="Logo Light"
    />
    {/* Dark mode logo */}
    <img
      src={LOGO_LIGHT}
      width={85}
      className="mx-auto hidden dark:block"
      alt="Logo Dark"
    />
  </Link>
              </div>
              <ul className="text-sm font-medium flex-1">
                {navigationData.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-x-2 text-gray-600 p-2 rounded-lg hover:bg-green-800 active:bg-gray-100 duration-150"
                    >
                      <div className="dark:text-white text-black">{item.icon}</div>
                      <span className="dark:text-white text-black">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {user && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="outline-none">
                    <Avatar.Root>
                      <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden border rounded-full bg-black">
                        <span className="font-bold text-lg text-sky-600">
                          {getInitials(user?.username)}
                        </span>
                      </div>
                    </Avatar.Root>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="absolute top-2 right-0 w-64 rounded-lg bg-white shadow-md border text-sm text-gray-600 p-2">
                      <span className="block text-gray-500/80 p-2">
                        {user?.username || 'User'}
                      </span>
                      <span className="block text-gray-500/80 p-2">
                        {user?.email || ''}
                      </span>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/dashboard"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="chip" color="#9e9a9a"></box-icon>
                          <span>Hub</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/settings"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="cog" color="#9e9a9a"></box-icon>
                          <span>Settings</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/pricing"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="credit-card" color="#9e9a9a"></box-icon>
                          <span>Subscription</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link
                          to="/smart/profile"
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 hover:text-black active:bg-gray-100 duration-150"
                        >
                          <box-icon name="credit-card" color="#9e9a9a"></box-icon>
                          <span>Profile</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <button
                          onClick={handleLogout}
                          className="flex w-full p-2 items-center space-x-2 rounded-md hover:bg-gray-50 active:bg-gray-100 duration-150"
                        >
                          <box-icon name="log-out-circle" color="#9e9a9a"></box-icon>
                          <span>Logout</span>
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Sidebar;