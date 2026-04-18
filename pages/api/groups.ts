import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user.id

  if (req.method === 'GET') {
    try {
      const groups = await prisma.groups.findMany({
        where: {
          deleted_at: null,
          groupMembers: { some: { userId, deleted_at: null } },
        },
        include: {
          groupMembers: {
            where: { deleted_at: null },
            include: { user: { select: { id: true, name: true, mobile: true } } },
          },
        },
        orderBy: { created_at: 'desc' },
      })

      const result = groups.map((g) => ({
        id: g.id.toString(),
        name: g.name,
        created_at: g.created_at,
        archived: g.archived_at !== null,
        members: g.groupMembers.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          mobile: m.user.mobile,
        })),
      }))

      return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { name, memberIds } = req.body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' })
    }

    const allMemberIds: string[] = Array.isArray(memberIds) ? memberIds : []
    if (!allMemberIds.includes(userId)) {
      allMemberIds.push(userId)
    }

    try {
      const group = await prisma.groups.create({
        data: {
          name: name.trim(),
          groupMembers: {
            create: allMemberIds.map((id) => ({ userId: id })),
          },
        },
        include: {
          groupMembers: {
            include: { user: { select: { id: true, name: true, mobile: true } } },
          },
        },
      })

      return res.status(201).json({
        id: group.id.toString(),
        name: group.name,
        created_at: group.created_at,
        archived: false,
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

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
