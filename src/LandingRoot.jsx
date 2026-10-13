import React from 'react';
import App from './App.jsx';
import AccessibilityWidget from './Accessibility.jsx';
import CookieBanner from './CookieBanner.jsx';

/* The home page tree. Shared by the browser entry (main.jsx) and the build-time
   pre-render (entry-server.jsx) so the static HTML hydrates without mismatches. */
export default function LandingRoot() {
  return (
    <React.StrictMode>
      <App />
      <AccessibilityWidget />
      <CookieBanner />
    </React.StrictMode>
  );
}
