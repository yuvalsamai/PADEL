import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { trackPageview } from './lib/analytics.js'
import AccessibilityWidget from './Accessibility.jsx'
import CookieBanner from './CookieBanner.jsx'

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
if (route !== 'admin') trackPageview()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {route === 'admin' ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : route === 'pay' ? (
      <Suspense fallback={null}>
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
    ) : route === 'notfound' ? (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    ) : (
      <App />
    )}
    {route !== 'admin' && <AccessibilityWidget />}
    {route !== 'admin' && <CookieBanner />}
  </React.StrictMode>,
)
