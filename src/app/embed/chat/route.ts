import { NextRequest, NextResponse } from 'next/server';

// Diese Datei markiert die Route als dynamisch, nicht statisch 
// und verhindert Prerendering-Fehler mit useSearchParams
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Route für direkte Aufrufe des Pfads (Fallback für direkte Zugriffe)
export async function GET(request: NextRequest) {
  // Leite zur Seite weiter, die dann client-seitig gerendert wird
  return NextResponse.next();
} 