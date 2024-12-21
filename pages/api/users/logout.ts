import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

export default async function logout(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire the cookie immediately
    }),
  )

  return res.status(200).json({ message: 'Logged out successfully' })
}
