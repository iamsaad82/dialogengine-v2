'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="de">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Es ist ein schwerwiegender Fehler aufgetreten</h2>
          <p className="mb-6 text-gray-600">
            Die Anwendung konnte nicht geladen werden. Bitte versuchen Sie es erneut.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
} 