import { PrismaClient } from '@prisma/client'

const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient
}

export const prisma: PrismaClient = prismaGlobal.prisma || new PrismaClient(
  {log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']}
)

if (['test', 'development'].includes(process.env.NODE_ENV as string)) {
  prismaGlobal.prisma = prisma
}


