import { NextApiRequest, NextApiResponse } from 'next'
// import { getSession } from 'next-auth/react'
import jwt, { JwtPayload } from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET_KEY || ''

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> | void

export function withAuth(handler: ApiHandler, isAdminPage?: boolean) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { session } = req.cookies

      if (!SECRET_KEY) {
        return res
          .status(500)
          .json({ error: 'Application error. Contact admin to troubleshoot.' })
      }

      if (!session) {
        return res.status(401).json({ error: 'Unauthorized - Please login' })
      }

      try {
        // Verify JWT
        const decodedToken = jwt.verify(session, SECRET_KEY) as JwtPayload
        if (isAdminPage !== decodedToken?.isAdmin) {
          return res
            .status(403)
            .json({ error: 'Forbidden - Insufficient permissions' })
        }

        return handler(req, res)
      } catch (error) {
        console.error(error)
        console.error('API Auth Middleware Error:', error)
        return res.status(500).json({ error: 'Internal server error' })
      }
    } catch (error) {
      console.error('API Auth Middleware Error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
