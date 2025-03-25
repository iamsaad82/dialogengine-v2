import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LunaryScript } from "@/components/LunaryScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brandenburg Dialog",
  description: "Stadtassistent für Brandenburg an der Havel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-geist-sans)' }}
      >
        {children}
        
        {/* Lunary Analytics Script (wird nur geladen, wenn in den Einstellungen aktiviert) */}
        <LunaryScript />
      </body>
    </html>
  );
}
