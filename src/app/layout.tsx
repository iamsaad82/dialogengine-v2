import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { LunaryScript } from "@/components/LunaryScript";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
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
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {children}
        
        {/* Lunary Analytics Script (wird nur geladen, wenn in den Einstellungen aktiviert) */}
        <LunaryScript />
      </body>
    </html>
  );
}
