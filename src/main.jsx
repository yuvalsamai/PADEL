import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import LandingRoot from './LandingRoot.jsx'
import './index.css'
import { trackPageview } from './lib/analytics.js'
import AccessibilityWidget from './Accessibility.jsx'
import CookieBanner from './CookieBanner.jsx'
import { fbEvent, initMetaPixel } from './lib/metaPixel.js'
import { CONTENT } from './lib/meta.js'
import { captureAttribution } from './lib/attribution.js'

const Privacy = lazy(() => import('./Privacy.jsx'))
const Terms = lazy(() => import('./Terms.jsx'))
const Cancel = lazy(() => import('./Cancel.jsx'))
const AccessibilityStatement = lazy(() => import('./AccessibilityStatement.jsx'))

const Admin = lazy(() => import('./admin/Admin.jsx'))
const PayPage = lazy(() => import('./PayPage.jsx'))
const NotFound = lazy(() => import('./NotFound.jsx'))
const ThankYou = lazy(() => import('./ThankYou.jsx'))

// Path-based routing (case-insensitive, optional trailing slash):
//   / → landing · /YUVAL → admin · /pay → checkout · /thank-you → confirmation
//   /terms · /cancel · /privacy · /accessibility → legal pages · else 404
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()
const route =
  path === '' ? 'landing'
  : path.endsWith('/yuval') ? 'admin'
  : path.endsWith('/pay') ? 'pay'
  : path.endsWith('/thank-you') ? 'thankyou'
  : path.endsWith('/privacy') ? 'privacy'
  : path.endsWith('/terms') ? 'terms'
  : path.endsWith('/cancel') ? 'cancel'
  : path.endsWith('/accessibility') ? 'accessibility'
  : 'notfound'

// Record a first-party pageview for every public page (skip the admin panel).
if (route !== 'admin') {
  captureAttribution()
  trackPageview()
  initMetaPixel()
  if (route === 'landing') fbEvent('ViewContent', { ...CONTENT, value: 89, currency: 'ILS' })
}

// Instant feedback on order buttons: the tapped link dims and spins until the
// checkout page replaces this one, and a second tap can't fire. Cleared when
// the page is shown again from the back/forward cache.
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href="/pay"]')
  if (a && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey) a.setAttribute('data-loading', '')
})
window.addEventListener('pageshow', () => {
  document.querySelectorAll('a[data-loading]').forEach((a) => a.removeAttribute('data-loading'))
})

const rootEl = document.getElementById('root')

if (route === 'landing') {
  // The home page is pre-rendered at build time — hydrate it instead of re-rendering.
  if (rootEl.hasChildNodes()) ReactDOM.hydrateRoot(rootEl, <LandingRoot />)
  else ReactDOM.createRoot(rootEl).render(<LandingRoot />)
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      {route === 'admin' ? (
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      ) : route === 'pay' ? (
        <Suspense
          fallback={
            <div dir="rtl" className="flex h-screen items-center justify-center bg-bone text-lg text-ink/60">
              טוען את טופס ההזמנה…
            </div>
          }
        >
          <PayPage />
        </Suspense>
      ) : route === 'thankyou' ? (
        <Suspense fallback={null}>
          <ThankYou />
        </Suspense>
      ) : route === 'privacy' ? (
        <Suspense fallback={null}>
          <Privacy />
        </Suspense>
      ) : route === 'terms' ? (
        <Suspense fallback={null}>
          <Terms />
        </Suspense>
      ) : route === 'cancel' ? (
        <Suspense fallback={null}>
          <Cancel />
        </Suspense>
      ) : route === 'accessibility' ? (
        <Suspense fallback={null}>
          <AccessibilityStatement />
        </Suspense>
      ) : (
        <Suspense fallback={null}>
          <NotFound />
        </Suspense>
      )}
      {route !== 'admin' && <AccessibilityWidget />}
      {route !== 'admin' && <CookieBanner />}
    </React.StrictMode>,
  )
}
