'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamischer Import, um SSR-Probleme zu vermeiden
const MallTemplateMCP = dynamic(
  () => import('../../components/chat/templates/mall/test/MallTemplateMCP'),
  { ssr: false }
);

/**
 * Test-Seite für das Mall-Template
 */
export default function MallTestPage() {
  return (
    <div className="mall-test-page">
      <MallTemplateMCP />
    </div>
  );
}
