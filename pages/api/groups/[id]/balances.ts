import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'
import { calculateBalances, simplifyDebts } from '@/utils/balances'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const groupId = BigInt(req.query.id as string)
  const userId = req.user.id

  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId, deleted_at: null },
  })
  if (!membership) {
    return res.status(403).json({ error: 'Access denied' })
  }

  try {
    const [members, expenses, settlements] = await Promise.all([
      prisma.groupMember.findMany({
        where: { groupId, deleted_at: null },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.expenses.findMany({
        where: { group_id: groupId, deleted_at: null },
        include: { splits: true },
      }),
      prisma.settlements.findMany({
        where: { group_id: groupId, deleted_at: null },
      }),
    ])

    const memberList = members.map((m) => ({ userId: m.userId, name: m.user.name }))

    const expenseData = expenses.map((e) => ({
      paid_by_id: e.paid_by_id,
      amount: Number(e.amount),
      splits: e.splits.map((s) => ({ user_id: s.user_id, amount: Number(s.amount) })),
    }))

    const settlementData = settlements.map((s) => ({
      payer_id: s.payer_id,
      receiver_id: s.receiver_id,
      amount: Number(s.amount),
    }))

    const balances = calculateBalances(expenseData, settlementData, memberList)
    const simplified = simplifyDebts(balances)

    return res.status(200).json({ balances, simplified })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
