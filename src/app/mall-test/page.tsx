'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamischer Import, um SSR-Probleme zu vermeiden
const MallTemplateMCP = dynamic(
  () => import('../../components/chat/templates/mall/test/MallTemplateMCP'),
  { ssr: false }
);

const AdvancedMallMCP = dynamic(
  () => import('../../components/chat/templates/mall/test/AdvancedMallMCP'),
  { ssr: false }
);

const RealStreamingMCP = dynamic(
  () => import('../../components/chat/templates/mall/test/RealStreamingMCP'),
  { ssr: false }
);

const LiveDataMCP = dynamic(
  () => import('../../components/chat/templates/mall/test/LiveDataMCP'),
  { ssr: false }
);

const DirectMallTest = dynamic(
  () => import('../../components/chat/templates/mall/test/DirectMallTest'),
  { ssr: false }
);

/**
 * Test-Seite für das Mall-Template
 */
export default function MallTestPage() {
  return (
    <div className="mall-test-page">
      <DirectMallTest />
    </div>
  );
}
