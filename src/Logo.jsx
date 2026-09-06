import React from 'react';

/* ================================================================== */
/*  CourtCheck logo — court outline mark + lime check, with wordmark   */
/*  `tone` controls the mark/word color so it works on light or dark.  */
/* ================================================================== */

export const CourtCheckMark = ({ className = '', stroke = 'currentColor', check = '#A6D720' }) => (
  <svg viewBox="0 0 120 74" className={className} fill="none" aria-hidden="true">
    {/* outer court */}
    <rect x="4" y="4" width="112" height="66" rx="10" stroke={stroke} strokeWidth="6" />
    {/* net line (center), split to let the check breathe */}
    <path d="M60 6 V30 M60 44 V68" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    {/* left service box (T) */}
    <path d="M20 24 H44 M32 24 V50 M20 50 H44" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    {/* right service box (T) */}
    <path d="M76 24 H100 M88 24 V50 M76 50 H100" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    {/* lime check across the net */}
    <path
      d="M50 40 L58 49 L74 27"
      stroke={check}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* Full lockup: mark + COURTCHECK wordmark */
const Logo = ({ className = '', markClass = 'h-8 w-auto', textClass = '', check = '#A6D720' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <CourtCheckMark className={markClass} check={check} />
    <span className={`font-display text-2xl font-black tracking-tight ${textClass}`}>
      COURT<span style={{ color: check }}>CHECK</span>
    </span>
  </span>
);

export default Logo;
