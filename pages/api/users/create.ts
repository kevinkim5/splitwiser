// This endpoint is superseded by /api/users/register (public registration)
// Kept for backwards compatibility — redirects to register
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(301).json({ message: 'Use /api/users/register instead' })
}
