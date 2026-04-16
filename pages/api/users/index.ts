import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const users = await prisma.users.findMany({
      where: { deleted_at: null },
      select: { id: true, name: true, mobile: true },
      orderBy: { name: 'asc' },
    })
    return res.status(200).json(users)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
