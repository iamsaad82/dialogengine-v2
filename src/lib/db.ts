import { PrismaClient } from '@prisma/client'

// Globaler Prisma-Client
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Erstelle eine Singleton-Instanz des Prisma-Clients
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Stellt sicher, dass wir im Entwicklungsmodus nur eine Prisma-Instanz haben
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 