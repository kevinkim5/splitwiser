import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const groupId = BigInt(req.query.id as string)
  const userId = req.user.id

  // Verify membership
  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId, deleted_at: null },
  })
  if (!membership) {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (req.method === 'GET') {
    try {
      const group = await prisma.groups.findFirst({
        where: { id: groupId, deleted_at: null },
        include: {
          groupMembers: {
            where: { deleted_at: null },
            include: { user: { select: { id: true, name: true, mobile: true } } },
          },
        },
      })

      if (!group) return res.status(404).json({ error: 'Group not found' })

      return res.status(200).json({
        id: group.id.toString(),
        name: group.name,
        created_at: group.created_at,
        members: group.groupMembers.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          mobile: m.user.mobile,
        })),
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { name } = req.body
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' })
    }
    try {
      const updated = await prisma.groups.update({
        where: { id: groupId },
        data: { name: name.trim() },
      })
      return res.status(200).json({ id: updated.id.toString(), name: updated.name })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.groups.update({
        where: { id: groupId },
        data: { deleted_at: new Date() },
      })
      return res.status(200).json({ message: 'Group deleted' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
