'use client';

// Diese Route muss dynamisch sein, da sie useSearchParams verwendet
// NextJS 14 Konfigurationen
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'edge';

// Direkter Export der Client-Komponente
export { default } from './client';
