import React, { Suspense, lazy } from 'react';

const MountHologram = lazy(() => import('./MountHologram.jsx'));

/* Static fallback shown while loading or if WebGL is unavailable —
   keeps the plinth looking intentional, never blank. */
function Placeholder({ label = 'טוען דגם תלת-ממד…' }) {
  return (
    <div className="flex h-[360px] w-full flex-col items-center justify-center gap-4">
      <div className="relative h-32 w-24">
        {/* stylized clip silhouette */}
        <div className="absolute inset-x-0 bottom-0 h-6 rounded-sm bg-moss/70" />
        <div className="absolute bottom-4 left-1 h-24 w-6 -rotate-12 rounded-sm bg-moss/60" />
        <div className="absolute bottom-4 right-1 h-24 w-6 rotate-12 rounded-sm bg-moss/60" />
        <div className="absolute bottom-6 left-1/2 h-28 w-5 -translate-x-1/2 rounded-sm bg-moss ring-1 ring-ball/60" />
      </div>
      <span className="font-mono text-[0.6rem] tracking-[0.2em] text-bone/50">{label}</span>
    </div>
  );
}

class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <Placeholder label="COURTCHECK MOUNT" />;
    return this.props.children;
  }
}

export default function MountViewer() {
  return (
    <Boundary>
      <Suspense fallback={<Placeholder />}>
        <MountHologram />
      </Suspense>
    </Boundary>
  );
}
