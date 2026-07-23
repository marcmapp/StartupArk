// components/FloatingDock.tsx
// Smart wrapper — resolves navRegistry icon names to @tabler/icons-react components,
// wires useNavPreferences + useDockMode, measures dock height → --dock-clearance,
// selects hub-mode static items vs product-mode ordered items,
// and delegates rendering to ui/floating-dock.tsx.
import React, { useRef, useEffect } from "react";
import { FloatingDock } from "./ui/floating-dock";
import type { NavItem } from "./ui/floating-dock";
import { useNavPreferences, useDockMode, useActiveProduct } from "../hooks/useNavPreferences";
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
  IconMicrophone,
  IconListCheck,
  IconActivity,
  IconFileText,
  IconNews,
  IconEdit,
  IconUsers,
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
  IconMicrophone,
  IconListCheck,
  IconActivity,
  IconFileText,
  IconNews,
  IconEdit,
  IconUsers,
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
  const activeProduct = useActiveProduct();
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
  // Product mode: the current product's slice of the role's ordered registry
  // (user's saved order), reorderable — scoped to activeProduct so being inside
  // Flowboard doesn't surface StartupArk's items and vice versa.
  const hubDockItems = resolveItems([...roleHubItems, ...globalItems]);
  const visibleNavItems: any[] = activeProduct
    ? (navItems as any[]).filter((item) => item.product === activeProduct)
    : (navItems as any[]);
  const prodDockItems = resolveItems(visibleNavItems);

  const dockItems   = mode === "hub" ? hubDockItems  : prodDockItems;
  const reorderable = mode !== "hub";

  // Map the reordered (product-scoped) NavItems back to raw registry objects,
  // then splice them back into their original slots in the full per-role
  // navItems list — so reordering one product's dock never disturbs the saved
  // order of other installed products.
  const handleReorder = reorderable
    ? (newItems: NavItem[]) => {
        const reorderedRaw = newItems
          .map((n) => roleRegistry.find((r: any) => r.id === n.id))
          .filter(Boolean);
        if (!activeProduct) {
          reorderItems(reorderedRaw);
          return;
        }
        const queue = [...reorderedRaw];
        const merged = (navItems as any[]).map((item) =>
          item.product === activeProduct ? queue.shift() : item,
        );
        reorderItems(merged);
      }
    : () => {};

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 max-w-[calc(100vw-32px)]"
      >
        <FloatingDock
          dockItems={dockItems}
          onReorder={handleReorder}
          reorderable={reorderable}
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-teal-400/60 dark:border-teal-300/50 ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_18px_rgba(45,212,191,0.35)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(45,212,191,0.4)]"
        />
      </div>

      {!hasSeenDockTour && isLoaded && (
        <DockTour onComplete={markTourSeen} />
      )}
    </>
  );
};

export default RoleBasedFloatingDock;
