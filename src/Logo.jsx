import React from 'react';

/* NETCAM wordmark: a lime camera-lens mark + the name in the current text color,
   so it works on both light and dark backgrounds. Size it with a text-* class. */
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-[0.35em] font-display font-black leading-none tracking-tight ${className}`} dir="ltr">
      <svg viewBox="0 0 32 32" className="h-[1.15em] w-[1.15em] flex-shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#A6D720" />
        <circle cx="16" cy="16" r="8.5" fill="none" stroke="#0D0D0D" strokeWidth="3" />
        <circle cx="16" cy="16" r="3.2" fill="#0D0D0D" />
      </svg>
      <span>NETCAM</span>
    </span>
  );
}
