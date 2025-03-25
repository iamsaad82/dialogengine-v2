export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Seite nicht gefunden</h2>
      <p className="mb-6 text-gray-600">
        Die gesuchte Seite existiert nicht oder wurde verschoben.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Zurück zur Startseite
      </a>
    </div>
  );
} 