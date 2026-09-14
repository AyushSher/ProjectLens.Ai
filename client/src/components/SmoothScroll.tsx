/**
 * SmoothScroll.tsx
 *
 * Wraps the application with Lenis for a smooth, premium scrolling experience.
 * Exposes the Lenis instance via `useLenis` context so child components can
 * programmatically scroll (e.g. anchor links, "scroll to top" buttons).
 *
 * Architecture notes:
 *  - A single rAF loop drives lenis.raf() — no conflicts with existing loops
 *    in LandingPage.tsx (each has its own independent rafId).
 *  - Lenis only intercepts the root window scroll; overflow-scroll elements
 *    inside panels (Dashboard, chat panels, etc.) are automatically excluded.
 *  - window.scrollY continues to update normally, so the existing navbar sticky
 *    logic in LandingPage.tsx works without modification.
 *  - Reduced-motion users get native scrolling (Lenis detects prefers-reduced-motion).
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import Lenis from 'lenis';

// ── Context ───────────────────────────────────────────────────────────────────

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

/**
 * Hook for child components that need to programmatically scroll.
 * Example: `const { lenis } = useLenis(); lenis?.scrollTo('#features');`
 */
export function useLenis(): LenisContextValue {
  return useContext(LenisContext);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    // Respect the user's OS "reduce motion" preference — disable smooth scroll
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      // Duration of the scroll easing (in seconds).
      // 1.1s is natural — not sluggish, not jarring.
      duration: prefersReduced ? 0 : 1.1,

      // Expo-out easing: fast at start, decelerates gracefully at the end.
      // This is what gives high-end AI/SaaS sites their "premium" feel.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

      orientation: 'vertical',
      gestureOrientation: 'vertical',

      // Smooth mouse-wheel scrolling
      smoothWheel: true,

      // Touch multiplier: 1.8 gives mobile a responsive, natural feel
      // without making it feel laggy or over-damped.
      touchMultiplier: 1.8,

      // Disable infinite scroll (no looping)
      infinite: false,
    });

    lenisRef.current = lenis;

    // ── Single rAF loop ───────────────────────────────────────────────────
    // This is the ONLY place lenis.raf() is called.
    // No duplicate loops anywhere in the app.
    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    // ── Cleanup on unmount ────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}
