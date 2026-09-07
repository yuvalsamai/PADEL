import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const Admin = lazy(() => import('./admin/Admin.jsx'))
const PayPage = lazy(() => import('./PayPage.jsx'))

// Path-based routing (case-insensitive, optional trailing slash):
//   /YUVAL → admin panel   ·   /pay → full-screen checkout   ·   else landing
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()
const route = path.endsWith('/yuval') ? 'admin' : path.endsWith('/pay') ? 'pay' : 'landing'

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
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
