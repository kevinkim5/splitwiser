import { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/lib/prisma'
import { createCookie } from '@/utils/auth'
import { verifyPassword } from '@/utils/helpers'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { mobile, password } = req.body

  if (!mobile || !password) {
    return res.status(400).json({ error: 'Mobile and password are required' })
  }

  if (!/^[89]\d{7}$/.test(mobile)) {
    return res.status(400).json({ error: 'Invalid mobile number' })
  }

  try {
    const user = await prisma.users.findUnique({
      where: { mobile },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid mobile number or password' })
    }

    const isValid = verifyPassword(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid mobile number or password' })
    }

    const cookie = createCookie({ id: user.id, name: user.name, isAdmin: user.admin })
    res.setHeader('Set-Cookie', cookie)

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        admin: user.admin,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
