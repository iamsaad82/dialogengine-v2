import { PrismaClient } from '@prisma/client'

// PrismaClient mit globaler Singleton-Instanz für die Produktionsumgebung
// In Entwicklungsumgebungen wird bei Hot-Reloading eine neue Instanz erstellt

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 