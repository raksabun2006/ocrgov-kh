'use client';

import { useEffect } from 'react';

/**
 * Removes the Next.js development overlay "N" button / toast indicator
 * from appearing in the viewport during development or testing.
 */
export function RemoveDevIndicator() {
  useEffect(() => {
    const cleanIndicators = () => {
      // Hide or remove nextjs-portal custom elements
      const portals = document.querySelectorAll('nextjs-portal');
      portals.forEach((p) => {
        (p as HTMLElement).style.setProperty('display', 'none', 'important');
        (p as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
        (p as HTMLElement).style.setProperty('opacity', '0', 'important');
        (p as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
      });

      // Target any data-nextjs-dev-overlay or dev indicator containers
      const overlays = document.querySelectorAll(
        '[data-nextjs-dev-overlay], [data-nextjs-toast], [data-nextjs-dialog-overlay], #nextjs-dev-overlay'
      );
      overlays.forEach((el) => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      });
    };

    cleanIndicators();

    // Observe subsequent DOM additions
    const observer = new MutationObserver(() => {
      cleanIndicators();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
