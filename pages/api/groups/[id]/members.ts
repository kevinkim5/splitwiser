import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const groupId = BigInt(req.query.id as string)
  const userId = req.user.id

  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId, deleted_at: null },
  })
  if (!membership) {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (req.method === 'POST') {
    const { userId: newUserId } = req.body
    if (!newUserId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    try {
      const existing = await prisma.groupMember.findFirst({
        where: { groupId, userId: newUserId },
      })

      if (existing) {
        if (existing.deleted_at) {
          await prisma.groupMember.update({
            where: { groupId_userId: { groupId, userId: newUserId } },
            data: { deleted_at: null },
          })
        } else {
          return res.status(409).json({ error: 'User is already a member' })
        }
      } else {
        await prisma.groupMember.create({
          data: { groupId, userId: newUserId },
        })
      }

      const user = await prisma.users.findUnique({
        where: { id: newUserId },
        select: { id: true, name: true, mobile: true },
      })

      return res.status(201).json({ userId: user?.id, name: user?.name, mobile: user?.mobile })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const { userId: removeUserId } = req.body
    if (!removeUserId) {
      return res.status(400).json({ error: 'userId is required' })
    }
    if (removeUserId === userId) {
      return res.status(400).json({ error: 'Cannot remove yourself from the group' })
    }
    try {
      await prisma.groupMember.update({
        where: { groupId_userId: { groupId, userId: removeUserId } },
        data: { deleted_at: new Date() },
      })
      return res.status(200).json({ message: 'Member removed' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
