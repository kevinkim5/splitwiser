import { NextApiRequest, NextApiResponse } from 'next'
import { clearCookie } from '@/utils/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Set-Cookie', clearCookie())
  return res.status(200).json({ message: 'Logged out successfully' })
}
