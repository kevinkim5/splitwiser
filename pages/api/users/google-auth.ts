import { NextApiRequest, NextApiResponse } from 'next'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { createCookie } from '@/utils/auth'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { credential } = req.body
  if (!credential) return res.status(400).json({ error: 'Missing credential' })

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload?.email) return res.status(400).json({ error: 'No email in token' })

    const user = await prisma.users.findFirst({
      where: { email: payload.email, deleted_at: null },
    })
    if (!user) {
      return res.status(401).json({ error: 'No account is linked to this Google account. Contact an admin.' })
    }

    const cookie = createCookie({ id: user.id, name: user.name, isAdmin: user.admin })
    res.setHeader('Set-Cookie', cookie)
    return res.status(200).json({ user: { id: user.id, name: user.name, mobile: user.mobile, admin: user.admin } })
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: 'Invalid Google token' })
  }
}
