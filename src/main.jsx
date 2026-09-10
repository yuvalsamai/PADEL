import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const Admin = lazy(() => import('./admin/Admin.jsx'))
const PayPage = lazy(() => import('./PayPage.jsx'))
const NotFound = lazy(() => import('./NotFound.jsx'))

// Path-based routing (case-insensitive, optional trailing slash):
//   / → landing · /YUVAL → admin · /pay → full-screen checkout · else 404
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()
const route =
  path === '' ? 'landing'
  : path.endsWith('/yuval') ? 'admin'
  : path.endsWith('/pay') ? 'pay'
  : 'notfound'

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
    ) : route === 'notfound' ? (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
