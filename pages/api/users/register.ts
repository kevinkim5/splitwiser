import { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/lib/prisma'
import { createCookie } from '@/utils/auth'
import { hashPassword } from '@/utils/helpers'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, mobile, password } = req.body

  if (!name || !mobile || !password) {
    return res.status(400).json({ error: 'Name, mobile, and password are required' })
  }

  if (!/^[89]\d{7}$/.test(mobile)) {
    return res.status(400).json({ error: 'Mobile must be an 8-digit number starting with 8 or 9' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const existing = await prisma.users.findUnique({ where: { mobile } })
    if (existing) {
      return res.status(409).json({ error: 'Mobile number already registered' })
    }

    const hashed = hashPassword(password)
    const user = await prisma.users.create({
      data: { name, mobile, password: hashed },
    })

    const cookie = createCookie({ id: user.id, name: user.name, isAdmin: user.admin })
    res.setHeader('Set-Cookie', cookie)

    return res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, name: user.name, mobile: user.mobile, admin: user.admin },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
