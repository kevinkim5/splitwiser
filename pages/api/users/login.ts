import { NextApiRequest, NextApiResponse } from 'next'

import { verifyPassword } from '@/utils/helpers'
import { prisma } from '@/lib/prisma'
import { createCookie } from '@/utils/auth'

const SECRET_KEY = process.env.JWT_SECRET_KEY || ''

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SECRET_KEY) {
    return res
      .status(500)
      .json({ error: 'Internal server error. Contact admin to troubleshoot.' })
  }

  if (req.method === 'POST') {
    const { mobile, password } = req.body

    if (!/^[89]\d{7}$/.test(mobile)) {
      return res.status(401).json({ error: 'Invalid mobile number' })
    }

    const user = await prisma.users.findUnique({
      where: { mobile: Number(mobile) }
    })

    if (user) {
      const { id, name, admin} = user
      const isValid = verifyPassword(password, user.password)
      if (isValid) {
        const cookie = createCookie({ id, name, isAdmin: admin })
        res.setHeader('Set-Cookie', cookie)
        return res.status(200).json({
          message: 'Login successful',
          user: {
            id,
            name,
            isAdmin: admin,
          },
        })
      } else {
        return res.status(401).json({
          error:
            'Invalid password. Please try again or contact admin to reset password.',
        })
      }
    } else {
      return res
        .status(404)
        .json({ error: 'Error logging in. Please contact admin.' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
