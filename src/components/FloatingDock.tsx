// components/FloatingDock.tsx
// Smart wrapper — resolves navRegistry icon names to @tabler/icons-react components,
// wires useNavPreferences + useDockMode, measures dock height → --dock-clearance,
// selects hub-mode static items vs product-mode ordered items,
// and delegates rendering to ui/floating-dock.tsx.
import React, { useRef, useEffect } from "react";
import { FloatingDock } from "./ui/floating-dock";
import type { NavItem } from "./ui/floating-dock";
import { useNavPreferences, useDockMode } from "../hooks/useNavPreferences";
import { hubItems, navRegistry, globalItems } from "../Jsons/NavItems/navRegistry";
import { DockTour } from "./DockTour";
import {
  IconLayoutDashboard,
  IconRocket,
  IconCompass,
  IconMapPin,
  IconBriefcase2,
  IconBriefcase,
  IconBox,
  IconBuildingStore,
  IconFile,
  IconCalendarEvent,
  IconSettings,
  IconUser,
  IconCreditCard,
  IconMessage,
  IconBookmarks,
  IconCalendar,
  IconCalendarStats,
  IconHome,
} from "@tabler/icons-react";

// ── Icon resolution ───────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  IconLayoutDashboard,
  IconRocket,
  IconCompass,
  IconMapPin,
  IconBriefcase2,
  IconBriefcase,
  IconBox,
  IconBuildingStore,
  IconFile,
  IconCalendarEvent,
  IconSettings,
  IconUser,
  IconCreditCard,
  IconMessage,
  IconBookmarks,
  IconCalendar,
  IconCalendarStats,
  IconHome,
};

const iconCls = "h-full w-full text-zinc-600 dark:text-zinc-300";

function resolveIcon(name: string): React.ReactNode {
  const Comp = ICON_MAP[name] ?? IconLayoutDashboard;
  return <Comp className={iconCls} />;
}

function resolveItems(
  items: { id: string; label: string; icon: string; route: string; category?: string }[],
): NavItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: resolveIcon(item.icon),
    route: item.route,
    category: item.category as "primary" | "secondary" | undefined,
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

const RoleBasedFloatingDock = ({ user }: { user: any }) => {
  const mode = useDockMode();
  const { navItems, reorderItems, hasSeenDockTour, markTourSeen, isLoaded, role } =
    useNavPreferences(user);

  const containerRef = useRef<HTMLDivElement>(null);

  // Write --dock-clearance so LayoutWrapper bottom padding tracks actual dock height.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      document.documentElement.style.setProperty("--dock-clearance", `${Math.round(h + 28)}px`);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!user || !isLoaded) return null;

  const safeRole = (role && (hubItems as any)[role]) ? role : "user";
  const roleHubItems: any[] = (hubItems as any)[safeRole] ?? [];
  const roleRegistry: any[] = (navRegistry as any)[safeRole] ?? [];

  // Hub mode: static fixed set (hub entry points + global), not reorderable.
  // Product mode: full ordered registry items (user's saved order), reorderable.
  const hubDockItems  = resolveItems([...roleHubItems, ...globalItems]);
  const prodDockItems = resolveItems(navItems as any);

  const dockItems   = mode === "hub" ? hubDockItems  : prodDockItems;
  const reorderable = mode !== "hub";

  // Map resolved NavItems back to raw registry objects for reorderItems().
  const handleReorder = reorderable
    ? (newItems: NavItem[]) =>
        reorderItems(
          newItems
            .map((n) => roleRegistry.find((r: any) => r.id === n.id))
            .filter(Boolean),
        )
    : () => {};

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 max-w-[calc(100vw-32px)]"
      >
        <FloatingDock
          user={user}
          dockItems={dockItems}
          onReorder={handleReorder}
          reorderable={reorderable}
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.22] ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.08] shadow-lg shadow-black/10 dark:shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
        />
      </div>

      {!hasSeenDockTour && isLoaded && (
        <DockTour onComplete={markTourSeen} />
      )}
    </>
  );
};

export default RoleBasedFloatingDock;
