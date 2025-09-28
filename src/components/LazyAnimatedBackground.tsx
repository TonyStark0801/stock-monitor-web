'use client';

import { lazy, Suspense } from 'react';

// Lazy load the AnimatedBackground component
const AnimatedBackground = lazy(() => import('./AnimatedBackground'));

export default function LazyAnimatedBackground() {
  return (
    <Suspense fallback={null}>
      <AnimatedBackground />
    </Suspense>
  );
}
