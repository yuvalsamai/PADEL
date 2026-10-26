import React, { Suspense, lazy, useEffect, useState } from 'react';
import { trackPageview } from './lib/analytics.js';

const load = () => import('./PayPage.jsx');
const PayPage = lazy(load);

/* Opens the checkout (details form → Hyp iframe) as a full-screen layer over
   the home page instead of navigating to /pay. Every <a href="/pay"> on the
   page is intercepted; the URL still becomes /pay (so analytics, refresh and the
   back button behave like the real page) and Back closes the layer. Without JS
   the links still go to /pay. */
export default function CheckoutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Fetch the checkout code ahead of time so the first tap opens instantly.
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    idle(() => load());

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href="/pay"]');
      if (!a) return;
      e.preventDefault();
      window.history.pushState({ checkout: true }, '', '/pay');
      trackPageview();
      setOpen(true);
    };
    const onPop = () => setOpen(window.location.pathname.replace(/\/+$/, '') === '/pay');
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const title = document.title;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.title = title;
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[var(--cc-banner-h,0px)] z-[90] bg-bone lg:top-0" role="dialog" aria-modal="true" aria-label="הזמנה">
      <Suspense fallback={null}>
        <PayPage onClose={() => window.history.back()} />
      </Suspense>
    </div>
  );
}
