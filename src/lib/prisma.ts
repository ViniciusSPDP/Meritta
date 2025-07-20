// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // Opcional: loga todas as queries no console
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;  