'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamischer Import, um SSR-Probleme zu vermeiden
const FluidStreamingTest = dynamic(
  () => import('../../components/chat/templates/mall/test/FluidStreamingTest'),
  { ssr: false }
);

/**
 * Test-Seite für das Mall-Template
 */
export default function MallTestPage() {
  return (
    <div className="mall-test-page">
      <FluidStreamingTest />
    </div>
  );
}
