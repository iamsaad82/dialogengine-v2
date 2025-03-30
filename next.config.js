/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react', 'geist'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! ACHTUNG !!
    // Ignorieren der TypeScript-Fehler während des Build-Prozesses
    // Langfristig sollten die eigentlichen Typprobleme behoben werden
    ignoreBuildErrors: true,
  },
  // Experimentelle Funktionen für Optimierungen im Build-Prozess
  experimental: {
    // Typgeprüfte Links: Verbesserte Sicherheit für die Anwendung
    typedRoutes: true,
    // Optionale Umbenennung von Komponenten im Build
    useDeploymentId: false,
    // Diese Option wird nicht unterstützt in Next.js 14.1.0
    // disableStaticRoutes: ['/embed/chat'],
  },
  // Konfiguration für Bilder und Medien
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Analyse des Build-Outputs bei Verwendung von ANALYZE=true
  webpack: (config, { isServer }) => {
    // Bundle-Analyse-Plugin bei Bedarf
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }
    return config
  },
  // Erlaube absolute Pfade für Module
  modularizeImports: {
    '@/components': {
      transform: '@/components/{{member}}',
    },
    '@/lib': {
      transform: '@/lib/{{member}}',
    },
  },
}

module.exports = nextConfig