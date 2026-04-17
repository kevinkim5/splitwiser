import { NextApiRequest, NextApiResponse } from 'next'
import jwt, { JwtPayload } from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET_KEY || ''

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SECRET_KEY) {
    return res.status(500).json({ error: 'Application error. Contact admin to troubleshoot.' })
  }

  const { session } = req.cookies

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const decoded = jwt.verify(session, SECRET_KEY) as JwtPayload
    return res.status(200).json({
      user: {
        id: decoded.id,
        name: decoded.name,
        admin: decoded.isAdmin || false,
      },
    })
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}
