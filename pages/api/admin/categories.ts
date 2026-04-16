import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  // POST — create a new category
  if (req.method === 'POST') {
    const { name, emoji } = req.body

    if (!name || !emoji) {
      return res.status(400).json({ error: 'name and emoji are required' })
    }

    try {
      const existing = await prisma.categories.findUnique({ where: { name } })
      if (existing) {
        return res.status(409).json({ error: 'Category name already exists' })
      }

      const category = await prisma.categories.create({
        data: { name, emoji },
      })
      return res.status(201).json({
        id: category.id.toString(),
        name: category.name,
        emoji: category.emoji,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // DELETE — remove a category (?categoryId=...)
  if (req.method === 'DELETE') {
    const categoryId = req.query.categoryId as string | undefined

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId query param is required' })
    }

    try {
      // Null out expenses that use this category before deleting
      await prisma.expenses.updateMany({
        where: { category_id: BigInt(categoryId) },
        data: { category_id: null },
      })
      await prisma.categories.delete({ where: { id: BigInt(categoryId) } })
      return res.status(200).json({ message: 'Category deleted' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
