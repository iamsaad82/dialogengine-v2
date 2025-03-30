'use client';

// Diese Route muss dynamisch sein, da sie useSearchParams verwendet
// NextJS 14 Konfigurationen
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Direkter Export der Client-Komponente
export { default } from './client';
