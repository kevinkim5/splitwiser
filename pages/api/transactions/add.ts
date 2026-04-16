// Deprecated: use /api/groups/[id]/expenses instead
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({ error: 'This endpoint is deprecated. Use /api/groups/[id]/expenses' })
}
