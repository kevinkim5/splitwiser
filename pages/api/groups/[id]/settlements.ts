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

  if (req.method === 'GET') {
    try {
      const settlements = await prisma.settlements.findMany({
        where: { group_id: groupId, deleted_at: null },
        include: {
          payer: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
      })

      return res.status(200).json(
        settlements.map((s) => ({
          id: s.id.toString(),
          payer_id: s.payer_id,
          receiver_id: s.receiver_id,
          payer: s.payer,
          receiver: s.receiver,
          amount: Number(s.amount),
          date: s.date,
          note: s.note,
          group_id: s.group_id.toString(),
        })),
      )
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { payer_id, receiver_id, amount, date, note } = req.body

    if (!payer_id || !receiver_id || !amount || !date) {
      return res.status(400).json({ error: 'payer_id, receiver_id, amount, and date are required' })
    }

    const settlementAmount = Number(amount)
    if (isNaN(settlementAmount) || settlementAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' })
    }

    try {
      const settlement = await prisma.settlements.create({
        data: {
          group_id: groupId,
          payer_id,
          receiver_id,
          amount: settlementAmount,
          date: new Date(date),
          note: note || null,
        },
        include: {
          payer: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
      })

      return res.status(201).json({
        id: settlement.id.toString(),
        payer_id: settlement.payer_id,
        receiver_id: settlement.receiver_id,
        payer: settlement.payer,
        receiver: settlement.receiver,
        amount: Number(settlement.amount),
        date: settlement.date,
        note: settlement.note,
        group_id: settlement.group_id.toString(),
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
