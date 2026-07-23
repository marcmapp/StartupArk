import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { navRegistry } from '../Jsons/NavItems/navRegistry';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Route prefixes owned by each installed product. Everything outside all of
// these is Hub mode. Also used to scope the product-mode dock to only the
// current product's navRegistry items (see useActiveProduct + FloatingDock.tsx)
// instead of mixing every installed product's items into one flat list.
const PRODUCT_ROUTES = {
  startupark: ['/startupark', '/products', '/manage-products', '/vc/', '/events/'],
  flowboard: ['/flowboard'],
  docarc: ['/docarc'],
};

function matchProduct(pathname) {
  return Object.keys(PRODUCT_ROUTES).find(product =>
    PRODUCT_ROUTES[product].some(prefix => pathname.startsWith(prefix)),
  );
}

export function useDockMode() {
  const { pathname } = useLocation();
  return matchProduct(pathname) ? 'product' : 'hub';
}

// Which installed product the current route belongs to, or undefined in Hub mode.
export function useActiveProduct() {
  const { pathname } = useLocation();
  return matchProduct(pathname);
}

function deriveRole(user) {
  return user?.startuparkRole || user?.role || (user?.isStartup ? 'startup' : 'user');
}

export function useNavPreferences(user) {
  const role = deriveRole(user);
  const roleItems = navRegistry[role] ?? navRegistry.user;

  // navItems: the full ordered list of all items for this role.
  // Defaults to the natural registry order (primary first, then secondary).
  const [navItems, setNavItems] = useState([]);
  const [hasSeenDockTour, setHasSeenDockTour] = useState(true); // true = suppress flash until load
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoaded(false);
    const token = localStorage.getItem('token');

    axios
      .get(`${BASE_URL}/startupark/api/nav-preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const ids = res.data.navItemOrder ?? [];
        // Resolve ids → registry items, preserving server-stored order.
        const resolved = ids.map(id => roleItems.find(i => i.id === id)).filter(Boolean);
        // Fall back to natural registry order if server returned nothing usable.
        setNavItems(resolved.length === roleItems.length ? resolved : [...roleItems]);
        setHasSeenDockTour(res.data.hasSeenDockTour ?? false);
        setIsLoaded(true);
      })
      .catch(() => {
        setNavItems([...roleItems]);
        setHasSeenDockTour(true); // on error, suppress tour rather than show it repeatedly
        setIsLoaded(true);
      });
  }, [user?.id ?? user?._id, role]);

  const saveOrder = useCallback((newItems, rollback) => {
    const token = localStorage.getItem('token');
    axios
      .put(
        `${BASE_URL}/startupark/api/nav-preferences`,
        { navItemOrder: newItems.map(i => i.id) },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .catch(() => {
        setNavItems(rollback);
        toast.error('Could not save dock order. Changes reverted.');
      });
  }, []);

  const reorderItems = useCallback((newItems) => {
    const previous = navItems;
    setNavItems(newItems);
    saveOrder(newItems, previous);
  }, [navItems, saveOrder]);

  const markTourSeen = useCallback(() => {
    setHasSeenDockTour(true);
    const token = localStorage.getItem('token');
    axios
      .put(
        `${BASE_URL}/startupark/api/nav-preferences`,
        { hasSeenDockTour: true },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .catch(() => {
        console.warn('Could not persist dock tour completion');
      });
  }, []);

  return {
    navItems,
    reorderItems,
    hasSeenDockTour,
    markTourSeen,
    isLoaded,
    role,
  };
}

// Standalone (non-hook) helper for the Guide page's "replay tour" button — it
// isn't rendered inside the dock's own useNavPreferences instance, so it can't
// reach markTourSeen's inverse. Flips hasSeenDockTour back to false server-side;
// caller is responsible for a full navigation/reload so useNavPreferences
// re-fetches and DockTour re-mounts on the next page.
export async function resetDockTour() {
  const token = localStorage.getItem('token');
  await axios.put(
    `${BASE_URL}/startupark/api/nav-preferences`,
    { hasSeenDockTour: false },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}
