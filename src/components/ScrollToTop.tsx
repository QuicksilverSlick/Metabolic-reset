import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page when the route changes.
 * This follows mobile UX best practices where users expect to see
 * the top of new content when navigating between pages.
 *
 * Uses useLayoutEffect-like behavior by scrolling immediately on pathname change.
 * The 'instant' behavior prevents any jarring animation on page transitions.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately when route changes
    // Using 'instant' for immediate scroll without animation on navigation
    // This prevents disorientation on mobile devices
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}

/**
 * useScrollToTop Hook
 *
 * Can be used in components that need to scroll to top on specific events
 * (e.g., quiz step changes, form submissions, tab switches)
 */
export function useScrollToTop() {
  const scrollToTop = (smooth = false) => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'instant'
    });
  };

  return { scrollToTop };
}

/**
 * ScrollToTopOnMount Component
 *
 * Use this component inside any page/component that should
 * scroll to top when it mounts (e.g., modal content, dynamic sections)
 */
export function ScrollToTopOnMount({ smooth = false }: { smooth?: boolean }) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'instant'
    });
  }, [smooth]);

  return null;
}
