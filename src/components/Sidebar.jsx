"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { motion } from "framer-motion";
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LOGO_LIGHT, LOGO_DARK } from "../Main-Configuration-Files/constants";
import { useTheme } from "../components/ThemeContext";
import { Link } from 'react-router-dom';
import 'boxicons';

export default function AppSidebar({ user, navigationData }) {
  const [open, setOpen] = useState(false);
  const { darkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Sidebar open={open} setOpen={setOpen} className="fixed h-screen z-50">
      <SidebarBody className="flex flex-col justify-between border-r-2 dark:border-gray-400 border-gray-400 dark:bg-neutral-900 h-full">
        {/* Top Section */}
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-10 flex items-center justify-center px-4 shrink-0">
            <Link to="/dashboard" className="flex-none">
              <img
                src={darkMode ? LOGO_LIGHT : LOGO_DARK}
                width={75}
                className="mx-auto"
                alt="Logo"
              />
            </Link>
          </div>

          {/* Navigation Links - Scrollable Area */}
          <div className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {navigationData.map((link, idx) => (
                <li key={idx} className="list-none">
                  <Link
                    to={link.to}
                    className={`
                      relative flex items-center gap-x-2 p-2 rounded-lg
                      hover:bg-gray-800/50 dark:hover:bg-gray-700/50
                      transition-colors duration-200
                      ${open ? 'justify-start' : 'justify-center'}
                    `}
                  >
                    <div className="dark:text-white text-black flex-shrink-0 mt-1">{link.icon}</div>
                    {open ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="dark:text-white text-black text-sm font-semibold whitespace-nowrap"
                      >
                        {link.name}
                      </motion.span>
                    ) : (
                      <span className="absolute left-full ml-3 p-1.5 px-2 rounded-md whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 shadow-lg hidden group-hover:block z-50">
                        {link.name}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User Dropdown */}
        <div className="relative -mx-4 px-4 py-4 border-t-2 dark:border-gray-400 border-gray-400">
          {user && (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="outline-none">
        {open ? (
          <div className="flex items-center gap-2">
            <Avatar.Root>
              <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full border-2 dark:border-white border-black">
                <span className="font-bold text-lg text-sky-600">
                  {getInitials(user?.username)}
                </span>
              </div>
            </Avatar.Root>
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-semibold ml-2 dark:text-white"
              >
                {user?.username}
              </motion.span>
            )}
          </div>
        ) : (
          <Avatar.Root>
            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full border-2 dark:border-white border-black">
              <span className="font-bold text-lg text-sky-600">
                {getInitials(user?.username)}
              </span>
            </div>
          </Avatar.Root>
        )}
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
      </SidebarBody>
    </Sidebar>
  );
}