import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const groupId = BigInt(req.query.id as string)
  const expenseId = BigInt(req.query.expenseId as string)
  const userId = req.user.id

  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId, deleted_at: null },
  })
  if (!membership) {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.expenses.update({
        where: { id: expenseId },
        data: { deleted_at: new Date() },
      })
      return res.status(200).json({ message: 'Expense deleted' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
