/**
 * ui/floating-dock.tsx — visual primitive for the unified dock.
 * Smart data lives in FloatingDock.tsx; this file is rendering-only.
 *
 * All items for the current mode are shown directly — no launcher, no overflow.
 * Adaptive sizing scales base icon size down from 44→28px as item count grows;
 * if even 28px doesn't fit the viewport, the row becomes horizontally scrollable
 * with edge-fade gradients indicating more content off-screen.
 */

import { cn } from "../../lib/utils";
import {
  AnimatePresence,
  MotionValue,
  Reorder,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrls";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  category?: "primary" | "secondary";
};

type FloatingDockProps = {
  user: any;
  dockItems: NavItem[];
  onReorder: (newItems: NavItem[]) => void;
  reorderable?: boolean;
  className?: string;
};

// ── Adaptive icon sizing ──────────────────────────────────────────────────────

const AVATAR_SLOT  = 44 + 12; // avatar rest size + gap-3
const DOCK_PADDING = 32;       // px-4 each side = 16 * 2
const SIDE_MARGIN  = 16;       // clearance on each side of the dock bar
const GAP          = 12;       // gap-3
const BASE_MAX     = 44;
const BASE_MIN     = 28;
const LABEL_H      = 14;       // text-[11px] rendered line height
const LABEL_GAP    = 4;        // gap-1 between icon circle and label
const PB           = 12;       // pb-3
const PT           = 8;        // pt-2

function computeSizing(itemCount: number, viewportWidth: number) {
  const available = viewportWidth - SIDE_MARGIN * 2 - DOCK_PADDING - AVATAR_SLOT;
  const totalGaps = Math.max(0, itemCount - 1) * GAP;
  const ideal = itemCount > 0 ? (available - totalGaps) / itemCount : BASE_MAX;
  if (ideal >= BASE_MAX) return { base: BASE_MAX, needsScroll: false };
  if (ideal >= BASE_MIN) return { base: Math.floor(ideal), needsScroll: false };
  return { base: BASE_MIN, needsScroll: true };
}

// ── Shared magnify hook ───────────────────────────────────────────────────────
// Spring config is verbatim from Phase 2 — do not retune.
// Container scales base → base*2 (2× ratio). Icon inner scales base/2 → base.

function useMagnify(mouseX: MotionValue<number>, base: number) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - b.x - b.width / 2;
  });

  const SPRING    = { mass: 0.1, stiffness: 150, damping: 12 };
  const peak      = base * 2;
  const iconBase  = base / 2;
  const iconPeak  = base;

  const width      = useSpring(useTransform(distance, [-150, 0, 150], [base, peak, base]),           SPRING);
  const height     = useSpring(useTransform(distance, [-150, 0, 150], [base, peak, base]),           SPRING);
  const widthIcon  = useSpring(useTransform(distance, [-150, 0, 150], [iconBase, iconPeak, iconBase]), SPRING);
  const heightIcon = useSpring(useTransform(distance, [-150, 0, 150], [iconBase, iconPeak, iconBase]), SPRING);

  return { ref, width, height, widthIcon, heightIcon };
}

// ── Public export ─────────────────────────────────────────────────────────────

export const FloatingDock = (props: FloatingDockProps) => <FloatingDockBar {...props} />;

// ── Dock bar ──────────────────────────────────────────────────────────────────

function FloatingDockBar({
  user,
  dockItems,
  onReorder,
  reorderable = true,
  className,
}: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  const [sizing, setSizing] = useState(() =>
    typeof window !== "undefined"
      ? computeSizing(dockItems.length, window.innerWidth)
      : { base: BASE_MAX, needsScroll: false },
  );

  useEffect(() => {
    const recompute = () => setSizing(computeSizing(dockItems.length, window.innerWidth));
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [dockItems.length]);

  const { base, needsScroll } = sizing;

  // cardHeight = resting icon size + label + spacing — the background card is
  // always exactly this tall.  The icon row is in normal flow (drives container
  // width) and is overflow-visible, so spring-magnified icons grow UPWARD above
  // the background edge without pushing the card itself.
  const cardHeight = base + LABEL_H + LABEL_GAP + PB + PT;

  return (
    // overflow-visible so icons can spring above the card.  Width is determined
    // by the icon row (the only in-flow child).
    <div
      className="relative overflow-visible"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      data-tour="dock-bar"
    >
      {/* ── Background card — absolute, bottom-anchored, FIXED height ──────────
          left-0 right-0 stretch to the icon row's natural width.
          height is explicit = cardHeight, so it never grows with icon springs. */}
      <div
        className={cn("absolute bottom-0 left-0 right-0 rounded-2xl", className)}
        style={{ height: cardHeight }}
      />

      {/* Edge fades — scroll mode only */}
      <AnimatePresence>
        {needsScroll && (
          <>
            <motion.div
              key="fade-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-0 left-0 z-10 w-10 rounded-l-2xl bg-gradient-to-r from-white/90 via-white/40 to-transparent dark:from-zinc-900/90 dark:via-zinc-900/40"
              style={{ height: cardHeight }}
            />
            <motion.div
              key="fade-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-0 right-0 z-10 w-10 rounded-r-2xl bg-gradient-to-l from-white/90 via-white/40 to-transparent dark:from-zinc-900/90 dark:via-zinc-900/40"
              style={{ height: cardHeight }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Icon row — in normal flow so it drives container width.
          overflow-visible lets magnified icons extend above the card edge.
          In scroll mode overflow-x-auto gives horizontal scrolling on touch
          (CSS forces overflow-y:auto too, but magnify never fires on touch). */}
      <div
        className={cn(
          "relative flex items-end gap-3 px-4 pb-3 pt-2",
          needsScroll
            ? "overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            : "overflow-visible",
        )}
      >
        <AvatarDockIcon user={user} mouseX={mouseX} base={base} />

        {reorderable ? (
          <Reorder.Group
            as="div"
            axis="x"
            values={dockItems}
            onReorder={onReorder}
            className="flex items-end gap-3"
            data-tour="dock-pinned"
          >
            {dockItems.map((item) => (
              <DockIcon key={item.id} item={item} mouseX={mouseX} base={base} reorderable />
            ))}
          </Reorder.Group>
        ) : (
          <div className="flex items-end gap-3" data-tour="dock-pinned">
            {dockItems.map((item) => (
              <DockIcon key={item.id} item={item} mouseX={mouseX} base={base} reorderable={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Avatar dock item ──────────────────────────────────────────────────────────

function AvatarDockIcon({
  user,
  mouseX,
  base,
}: {
  user: any;
  mouseX: MotionValue<number>;
  base: number;
}) {
  const { ref, width, height, widthIcon, heightIcon } = useMagnify(mouseX, base);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ left: 0, bottom: 0 });
  const navigate = useNavigate();

  const avatarUrl =
    user?.profilePicture || user?.profileImage
      ? getImageUrl(user.profilePicture || user.profileImage, "")
      : null;

  const initials = (() => {
    const u = user?.username;
    if (!u || typeof u !== "string") return "?";
    const parts = u.trim().split(" ");
    return parts.length === 1
      ? (parts[0][0]?.toUpperCase() ?? "?")
      : (parts[0][0]?.toUpperCase() ?? "") + (parts[1][0]?.toUpperCase() ?? "");
  })();

  const firstName = user?.username?.split(" ")[0] ?? "Me";

  const openMenu = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setMenuPos({ left: Math.max(8, r.left - 8), bottom: window.innerHeight - r.top + 8 });
    }
    setMenuOpen(true);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Structure: icon container and label are siblings — label is NOT inside the
  // motion.div so it does not participate in the height spring animation.
  return (
    <div data-tour="dock-avatar" className="flex flex-col items-center gap-1 flex-shrink-0">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onClick={openMenu}
        className="relative flex aspect-square flex-shrink-0 cursor-pointer items-center justify-center rounded-full overflow-hidden bg-zinc-900 dark:bg-white"
      >
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.username} className="h-full w-full object-cover" />
          ) : (
            <span className="text-white dark:text-zinc-900 font-bold text-sm leading-none select-none">
              {initials}
            </span>
          )}
        </motion.div>
      </motion.div>

      {/* Label — sibling of the scale target, zero influence on height spring */}
      <span
        className="pointer-events-none text-center text-[11px] leading-none text-zinc-500 dark:text-zinc-400 truncate"
        style={{ maxWidth: `${base * 1.5}px` }}
      >
        {firstName}
      </span>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setMenuOpen(false)} />
          <div
            className="fixed z-[160] w-56 rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            style={{ left: menuPos.left, bottom: menuPos.bottom }}
          >
            <div className="border-b border-gray-100 px-3 py-2.5 dark:border-white/10">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {user?.username}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <div className="p-1.5">
              {[
                { label: "Hub",        route: "/dashboard" },
                { label: "My Profile", route: "/profile"   },
                { label: "Settings",   route: "/settings"  },
              ].map(({ label, route }) => (
                <button
                  key={route}
                  onClick={() => { setMenuOpen(false); navigate(route); }}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                >
                  {label}
                </button>
              ))}
              <div className="my-1 border-t border-gray-100 dark:border-white/10" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── DockIcon ──────────────────────────────────────────────────────────────────
//
// STRUCTURE:
//   div.flex-col (item wrapper)
//     ├── Link  ← wraps ONLY the scale target
//     │     └── motion.div[ref, style={width,height}]  ← scale target
//     │           └── motion.div[widthIcon,heightIcon]  ← icon
//     └── span  ← label: sibling of Link, outside transform chain

function DockIcon({
  item,
  mouseX,
  base,
  reorderable,
}: {
  item: NavItem;
  mouseX: MotionValue<number>;
  base: number;
  reorderable: boolean;
}) {
  const { ref, width, height, widthIcon, heightIcon } = useMagnify(mouseX, base);
  const { pathname } = useLocation();
  const active = pathname === item.route || pathname.startsWith(item.route + "/");
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const wrapper = (
    <div
      className="flex flex-col items-center gap-1 flex-shrink-0"
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
      }}
    >
      <Link
        to={item.route}
        draggable={false}
        onClick={(e) => {
          if (pointerStart.current) {
            const dx = Math.abs(e.clientX - pointerStart.current.x);
            const dy = Math.abs(e.clientY - pointerStart.current.y);
            if (dx > 6 || dy > 6) e.preventDefault();
          }
        }}
      >
        <motion.div
          ref={ref}
          style={{ width, height }}
          className={cn(
            "relative flex aspect-square flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
            active
              ? "bg-black/10 dark:bg-white/15"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700",
          )}
        >
          {active && (
            <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-white" />
          )}
          <motion.div
            style={{ width: widthIcon, height: heightIcon }}
            className="flex items-center justify-center"
          >
            {item.icon}
          </motion.div>
        </motion.div>
      </Link>

      {/* Label — sibling of Link, zero transform inheritance */}
      <span
        className="pointer-events-none text-center text-[11px] leading-none text-zinc-500 dark:text-zinc-400 truncate"
        style={{ maxWidth: `${base * 1.5}px` }}
      >
        {item.label}
      </span>
    </div>
  );

  if (!reorderable) return wrapper;

  return (
    <Reorder.Item value={item} as="div">
      {wrapper}
    </Reorder.Item>
  );
}
