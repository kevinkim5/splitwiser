import { scryptSync } from 'crypto'

const SALT = process.env.SALT_SECRET

const BASIC_COLOUR_PALETTE = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
]

export const pickPalette = (name: string) => {
  const index = name.charCodeAt(0) % BASIC_COLOUR_PALETTE.length
  return BASIC_COLOUR_PALETTE[index]
}

export function getCurrencyLogo(currency: string) {
  switch (currency) {
    case 'SGD':
      return '$'
    default:
      return '$'
  }
}

// Function to hash a password
export function hashPassword(password: string): string {
  if (!SALT) throw new Error('Salt is not set')

  const hash = scryptSync(password, SALT, 64).toString('hex') // Hash the password with the salt
  return hash
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!SALT) throw new Error('Salt is not set')
  const hash = scryptSync(password, SALT, 64).toString('hex') // Hash the input password with the same salt
  return hash === storedHash // Compare the hashes
}
