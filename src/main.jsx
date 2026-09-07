import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const Admin = lazy(() => import('./admin/Admin.jsx'))

// Secret admin route: any path ending in /YUVAL (case-insensitive, optional
// trailing slash) renders the admin panel instead of the landing page.
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()
const isAdmin = path.endsWith('/yuval')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
