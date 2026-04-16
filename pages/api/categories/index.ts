import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const categories = await prisma.categories.findMany({
      orderBy: { name: 'asc' },
    })
    return res.status(200).json(
      categories.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        emoji: c.emoji,
      })),
    )
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
