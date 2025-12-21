// components/RoleBasedFloatingDock.jsx
import React from "react";
import { FloatingDock } from "./ui/floating-dock";
import {
  IconHome,
  IconBuilding,
  IconUsers,
  IconBriefcase,
  IconCalendarEvent,
  IconMessage,
  IconBookmarks,
  IconSettings,
  IconChartBar,
  IconLayoutDashboard,
  IconFileDescription,
  IconVideo,
  IconBuildingStore,
  IconSchool,
} from "@tabler/icons-react";

const RoleBasedFloatingDock = ({ user }) => {
  if (!user) return null;

  const userRole = user.startuparkRole || user.role || (user.isStartup ? 'startup' : 'user');
  
  // Common items for all roles
  const commonItems = [
    {
      title: "Dashboard",
      icon: <IconLayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: userRole === 'startup' ? "/startupark/startup-dashboard" : 
            userRole === 'student' ? "/startupark/student-dashboard" : 
            "/startupark/user-dashboard"
    },
    {
      title: "Profile",
      icon: <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/profile"
    },
    {
      title: "Chat",
      icon: <IconMessage className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/startupark/chat"
    },
  ];

  // Role-specific items
  const roleSpecificItems = [];
  
  if (userRole === 'startup') {
    roleSpecificItems.push(
      {
        title: "My Startup",
        icon: <IconBuilding className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/startup-profile"
      },
      {
        title: "Bookings",
        icon: <IconCalendarEvent className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/manage-bookings"
      },
      {
        title: "Events",
        icon: <IconVideo className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/startup/events"
      },
      {
        title: "Jobs",
        icon: <IconBriefcase className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/jobposting"
      }
    );
  } else if (userRole === 'user') {
    roleSpecificItems.push(
      {
        title: "Startups",
        icon: <IconBuildingStore className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/startups"
      },
      {
        title: "Events",
        icon: <IconVideo className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/events"
      },
      {
        title: "Favorites",
        icon: <IconBookmarks className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/favorites"
      },
      {
        title: "Career",
        icon: <IconBriefcase className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/launchpad"
      }
    );
  } else if (userRole === 'student') {
    roleSpecificItems.push(
      {
        title: "Startups",
        icon: <IconBuildingStore className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/startups"
      },
      {
        title: "Career",
        icon: <IconSchool className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/launchpad"
      },
      {
        title: "Events",
        icon: <IconVideo className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
        href: "/startupark/events"
      }
    );
  }

  // Common footer items
  const footerItems = [
    {
      title: "Analytics",
      icon: <IconChartBar className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/dashboard"
    }
  ];

  const dockItems = [...commonItems, ...roleSpecificItems, ...footerItems];

  return dockItems.length > 0 ? (
    <div className="fixed bottom-6 left-4 z-40 md:bottom-6 md:left-1/2 md:transform md:-translate-x-1/2">
      <FloatingDock
        items={dockItems}
        desktopClassName="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-gray-200 dark:border-neutral-800 shadow-xl"
        mobileClassName="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm shadow-xl"
      />
    </div>
  ) : null;
};

export default RoleBasedFloatingDock;