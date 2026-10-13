import React from 'react';
import { renderToString } from 'react-dom/server';
import LandingRoot from './LandingRoot.jsx';

// Build-time only: renders the home page to static HTML (see scripts/prerender.mjs).
export function render() {
  return renderToString(<LandingRoot />);
}
