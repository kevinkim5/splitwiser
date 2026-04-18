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

  if (req.method === 'PUT') {
    const { description, amount, paid_by_id, date, split_type, splits, category_id } = req.body

    if (!description || !amount || !paid_by_id || !date) {
      return res.status(400).json({ error: 'description, amount, paid_by_id, and date are required' })
    }

    const totalAmount = Number(amount)
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' })
    }

    const type = split_type || 'equal'

    try {
      const members = await prisma.groupMember.findMany({
        where: { groupId, deleted_at: null },
        select: { userId: true },
      })

      let expenseSplits: { user_id: string; amount: number }[] = []

      if (type === 'equal') {
        const splitAmount = Math.round((totalAmount / members.length) * 100) / 100
        const remainder = Math.round((totalAmount - splitAmount * members.length) * 100) / 100
        expenseSplits = members.map((m, i) => ({
          user_id: m.userId,
          amount: i === 0 ? splitAmount + remainder : splitAmount,
        }))
      } else if (type === 'exact' && Array.isArray(splits)) {
        expenseSplits = splits.map((s: { user_id: string; amount: number }) => ({
          user_id: s.user_id,
          amount: Number(s.amount),
        }))
      } else {
        return res.status(400).json({ error: 'Invalid split configuration' })
      }

      // Delete existing splits and recreate
      await prisma.expenseSplits.deleteMany({ where: { expense_id: expenseId } })

      const expense = await prisma.expenses.update({
        where: { id: expenseId },
        data: {
          description,
          amount: totalAmount,
          paid_by_id,
          date: new Date(date),
          split_type: type,
          category_id: category_id ? BigInt(category_id) : null,
          splits: {
            create: expenseSplits.map((s) => ({
              user_id: s.user_id,
              amount: s.amount,
            })),
          },
        },
        include: {
          paid_by: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, emoji: true } },
          splits: { include: { user: { select: { id: true, name: true } } } },
        },
      })

      return res.status(200).json({
        id: expense.id.toString(),
        description: expense.description,
        amount: Number(expense.amount),
        paid_by_id: expense.paid_by_id,
        paid_by: expense.paid_by,
        date: expense.date,
        split_type: expense.split_type,
        group_id: expense.group_id.toString(),
        category_id: expense.category_id?.toString() ?? null,
        category: expense.category
          ? { id: expense.category.id.toString(), name: expense.category.name, emoji: expense.category.emoji }
          : null,
        splits: expense.splits.map((s) => ({
          id: s.id.toString(),
          user_id: s.user_id,
          amount: Number(s.amount),
          user: s.user,
        })),
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
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
