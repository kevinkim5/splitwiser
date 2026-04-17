import { NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/api-middleware'
import { hashPassword } from '@/utils/helpers'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  // GET — list all users
  if (req.method === 'GET') {
    try {
      const users = await prisma.users.findMany({
        where: { deleted_at: null },
        select: { id: true, name: true, mobile: true, email: true, admin: true, created_at: true },
        orderBy: { created_at: 'asc' },
      })
      return res.status(200).json(users)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // POST — create a new user
  if (req.method === 'POST') {
    const { name, mobile, password, email } = req.body

    if (!name || !mobile || !password) {
      return res.status(400).json({ error: 'Name, mobile, and password are required' })
    }
    if (!/^[89]\d{7}$/.test(mobile)) {
      return res.status(400).json({ error: 'Mobile must be an 8-digit number starting with 8 or 9' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    try {
      const existing = await prisma.users.findUnique({ where: { mobile } })
      if (existing) {
        return res.status(409).json({ error: 'Mobile number already registered' })
      }

      const user = await prisma.users.create({
        data: { name, mobile, password: hashPassword(password), email: email || null },
        select: { id: true, name: true, mobile: true, email: true, admin: true, created_at: true },
      })
      return res.status(201).json(user)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // PATCH — update a user's email
  if (req.method === 'PATCH') {
    const { userId, email } = req.body

    if (!userId) return res.status(400).json({ error: 'userId is required' })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    try {
      await prisma.users.update({
        where: { id: userId },
        data: { email: email || null },
      })
      return res.status(200).json({ message: 'User updated' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // DELETE — soft-delete a user (?userId=... query param)
  if (req.method === 'DELETE') {
    const userId = req.query.userId as string | undefined

    if (!userId) {
      return res.status(400).json({ error: 'userId query param is required' })
    }
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    try {
      await prisma.users.update({
        where: { id: userId },
        data: { deleted_at: new Date() },
      })
      return res.status(200).json({ message: 'User removed' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
