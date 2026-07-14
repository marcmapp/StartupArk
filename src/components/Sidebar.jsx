// SUPERSEDED by src/Jsons/NavItems/navRegistry.js + src/components/FloatingDock.tsx as of the
// unified-dock migration. Kept one release cycle as a rollback safety net. Do not import.
"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody } from "./ui/sidebar";
import { motion } from "framer-motion";
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LOGO_LIGHT, LOGO_DARK } from "../Main-Configuration-Files/constants";
import { useTheme } from "../components/ThemeContext";
import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrls';
import 'boxicons';

export default function AppSidebar({ user, navigationData }) {
  const [open, setOpen] = useState(false);
  const { darkMode } = useTheme();
  const location = useLocation();

  const avatarUrl = (user?.profilePicture || user?.profileImage)
    ? getImageUrl(user.profilePicture || user.profileImage)
    : null;

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

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Sidebar open={open} setOpen={setOpen} className="fixed h-screen z-50">
      <SidebarBody className="flex flex-col justify-between border-r border-gray-200 dark:border-white/10 dark:bg-zinc-950 bg-white h-full overflow-x-hidden">

        {/* Top Section */}
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="h-14 flex items-center justify-center px-3 shrink-0 border-b border-gray-100 dark:border-white/10">
            <Link to="/dashboard" className="flex-none">
              <img
                src={darkMode ? LOGO_LIGHT : LOGO_DARK}
                width={open ? 80 : 32}
                className="transition-all duration-300 mx-auto"
                alt="Logo"
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
            <ul className="space-y-0.5 px-2">
              {navigationData.map((link, idx) => {
                const active = isActive(link.to);
                const tooltip = link.tooltip || link.name;
                return (
                  <li key={idx} className="list-none group relative">
                    <Link
                      to={link.to}
                      className={`
                        flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150
                        ${open ? 'justify-start' : 'justify-center'}
                        ${active
                          ? 'bg-black/[0.05] dark:bg-white/[0.08] text-zinc-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-zinc-900 dark:bg-white rounded-r-full" />
                      )}

                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        {link.icon}
                      </div>

                      {open && (
                        <motion.span
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </Link>

                    {/* Tooltip when collapsed */}
                    {!open && (
                      <div className="
                        pointer-events-none
                        absolute left-full top-1/2 -translate-y-1/2 ml-3
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-150 z-50
                      ">
                        <div className="bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap max-w-[200px]">
                          <p className="font-semibold">{link.name}</p>
                          {tooltip !== link.name && (
                            <p className="text-gray-400 text-xs mt-0.5">{tooltip}</p>
                          )}
                          {/* Arrow */}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-800" />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* User Menu */}
        <div className="shrink-0 border-t border-gray-100 dark:border-white/10 px-2 py-3">
          {user && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors ${open ? '' : 'justify-center'}`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user?.username} className="w-8 h-8 rounded-full object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {getInitials(user?.username)}
                    </div>
                  )}
                  {open && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="min-w-0 text-left"
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </motion.div>
                  )}
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="right"
                  sideOffset={8}
                  align="end"
                  className="w-56 rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-gray-100 dark:border-white/10 text-sm p-1.5 z-[100]"
                >
                  <div className="px-3 py-2 mb-1 border-b border-gray-100 dark:border-white/10">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>

                  <DropdownMenu.Item asChild className="outline-none">
                    <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <box-icon name="chip" size="16px" color="currentColor" />
                      <span>Hub</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild className="outline-none">
                    <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <box-icon name="user" size="16px" color="currentColor" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild className="outline-none">
                    <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <box-icon name="cog" size="16px" color="currentColor" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 border-t border-gray-100 dark:border-white/10" />

                  <DropdownMenu.Item asChild className="outline-none">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <box-icon name="log-out-circle" size="16px" color="currentColor" />
                      <span>Log out</span>
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
