import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET_KEY || ''
const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60

interface TokenPayload {
  id: string
  name: string
  isAdmin: boolean
}

export function createJWT(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: ONE_WEEK_IN_SECONDS })
}

export function createCookie(payload: TokenPayload): string {
  const token = createJWT(payload)
  return `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ONE_WEEK_IN_SECONDS}`
}

export function clearCookie(): string {
  return `session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
}
