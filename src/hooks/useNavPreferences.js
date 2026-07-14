import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { navRegistry } from '../Jsons/NavItems/navRegistry';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Product-mode route prefixes — everything else is Hub mode.
const PRODUCT_PREFIXES = ['/startupark', '/products', '/manage-products', '/vc/', '/events/'];

export function useDockMode() {
  const { pathname } = useLocation();
  const isProduct = PRODUCT_PREFIXES.some(p => pathname.startsWith(p));
  return isProduct ? 'product' : 'hub';
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
