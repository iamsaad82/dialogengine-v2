'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Es ist ein Fehler aufgetreten</h2>
      <p className="mb-6 text-gray-600">
        Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Erneut versuchen
        </button>
        <a
          href="/"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
} 