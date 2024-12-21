import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'

export default async function session(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { session } = req.cookies

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    // Verify JWT
    const decodedToken = jwt.verify(session, SECRET_KEY)
    return res.status(200).json({ user: decodedToken })
  } catch (error) {
    console.error(error)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}