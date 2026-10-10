import React from 'react';

/* NETCAM logo. `dark` uses the variant with light lettering for dark backgrounds.
   Size it with a height class (e.g. h-12); width follows the aspect ratio. */
export default function Logo({ dark = false, className = '' }) {
  return (
    <img
      src={dark ? '/netcam-logo-dark.webp' : '/netcam-logo.webp'}
      alt="NETCAM"
      width="900"
      height="591"
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
