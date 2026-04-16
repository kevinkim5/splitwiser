import { NextApiRequest, NextApiResponse } from 'next'
import jwt, { JwtPayload } from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET_KEY || ''

export type AuthenticatedRequest = NextApiRequest & {
  user: {
    id: string
    name: string
    isAdmin: boolean
  }
}

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
) => Promise<void> | void

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      if (!SECRET_KEY) {
        return res
          .status(500)
          .json({ error: 'Application error. Contact admin to troubleshoot.' })
      }

      const { session } = req.cookies

      if (!session) {
        return res.status(401).json({ error: 'Unauthorized - Please login' })
      }

      const decodedToken = jwt.verify(session, SECRET_KEY) as JwtPayload

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: decodedToken.id,
        name: decodedToken.name,
        isAdmin: decodedToken.isAdmin || false,
      }

      return handler(authenticatedReq, res)
    } catch (error) {
      console.error('API Auth Middleware Error:', error)
      return res.status(401).json({ error: 'Invalid or expired session' })
    }
  }
}
