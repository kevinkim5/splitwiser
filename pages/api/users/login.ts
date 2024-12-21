import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/db'

import { verifyPassword } from '@/utils/helpers'
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import { DB_NAME, TABLES } from '@/constants'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'

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

  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection(TABLES.USERS)

  if (req.method === 'POST') {
    const { mobile, password } = req.body

    if (!/^[89]\d{7}$/.test(mobile)) {
      return res.status(401).json({ error: 'Invalid mobile number' })
    }

    const user = await collection.findOne({ mobile: Number(mobile) })

    if (user) {
      const isValid = verifyPassword(password, user.pw)
      if (isValid) {
        const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, {
          expiresIn: '1d',
        })
        const cookie = serialize('session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 1, // One day
          path: '/',
        })
        res.setHeader('Set-Cookie', cookie)
        return res.status(200).json({
          message: 'Login successful',
          user: {
            id: user._id,
            name: user.name,
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
