// components/FloatingDock.tsx
// Bottom utility bar — all quick-access facilities live here.
// Sidebar handles discovery/navigation; this handles actions & tools.
import React from "react";
import { FloatingDock } from "./ui/floating-dock";
import {
  IconLayoutDashboard,
  IconMessage,
  IconBookmarks,
  IconCalendar,
  IconBell,
  IconCalendarEvent,
  IconBriefcase,
  IconCalendarStats,
} from "@tabler/icons-react";

const iconCls = "h-full w-full text-zinc-600 dark:text-zinc-300";

const RoleBasedFloatingDock = ({ user }: { user: any }) => {
  if (!user) return null;

  const userRole: string = user.startuparkRole || user.role || (user.isStartup ? 'startup' : 'user');

  // ── Universal utilities (every role) ──────────────────────
  const core = [
    {
      title: "Hub",
      icon: <IconLayoutDashboard className={iconCls} />,
      href: "/dashboard",
    },
    {
      title: "Messages",
      icon: <IconMessage className={iconCls} />,
      href: "/startupark/chat",
    },
    {
      title: "Saved",
      icon: <IconBookmarks className={iconCls} />,
      href: "/startupark/favorites",
    },
    {
      title: "Notifications",
      // Placeholder — notification page to be built
      icon: <IconBell className={iconCls} />,
      href: "/dashboard",
    },
  ];

  // ── Role-specific utility shortcuts ───────────────────────
  const byRole: Record<string, { title: string; icon: React.ReactNode; href: string }[]> = {
    startup: [
      {
        title: "My Calendar",
        icon: <IconCalendar className={iconCls} />,
        href: "/startupark/startupcalender",
      },
      {
        title: "Bookings",
        icon: <IconCalendarStats className={iconCls} />,
        href: "/startupark/manage-bookings",
      },
    ],
    user: [
      {
        title: "My Calendar",
        icon: <IconCalendar className={iconCls} />,
        href: "/startupark/usercalender",
      },
      {
        title: "My Bookings",
        icon: <IconCalendarStats className={iconCls} />,
        href: "/startupark/my-bookings",
      },
    ],
    student: [
      {
        title: "My Calendar",
        icon: <IconCalendar className={iconCls} />,
        href: "/startupark/usercalender",
      },
      {
        title: "Meetings",
        icon: <IconCalendarStats className={iconCls} />,
        href: "/startupark/my-bookings",
      },
    ],
  };

  const dockItems = [...core, ...(byRole[userRole] || byRole.user)];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <FloatingDock
        items={dockItems}
        desktopClassName="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/40"
        mobileClassName="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl"
      />
    </div>
  );
};

export default RoleBasedFloatingDock;
