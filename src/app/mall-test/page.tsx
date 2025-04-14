'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamischer Import, um SSR-Probleme zu vermeiden
const IntegrationTest = dynamic(
  () => import('../../components/chat/templates/mall/test/IntegrationTest'),
  { ssr: false }
);

const DiagnosticTool = dynamic(
  () => import('../../components/chat/templates/mall/test/DiagnosticTool'),
  { ssr: false }
);

/**
 * Test-Seite für das Mall-Template
 */
export default function MallTestPage() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="mall-test-page">
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        marginBottom: '10px'
      }}>
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b1c60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showDiagnostics ? 'Test anzeigen' : 'Diagnose anzeigen'}
        </button>
      </div>

      {showDiagnostics ? (
        <DiagnosticTool />
      ) : (
        <IntegrationTest />
      )}
    </div>
  );
}
