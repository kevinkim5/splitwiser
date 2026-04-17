import { NextApiRequest, NextApiResponse } from 'next'

// Registration is admin-only. Use /admin to add new users.
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(403).json({ error: 'Registration is closed. Contact an admin to be added.' })
}
