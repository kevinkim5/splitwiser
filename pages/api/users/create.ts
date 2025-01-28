import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/db'
import { scryptSync } from 'crypto'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || ''

function hashPassword(password: string) {
  if (!process.env.SALT) {
    console.error('SALT is not set')
    throw new Error('Internal server error. Contact admin to troubleshoot.')
  }
  const hash = scryptSync(password, process.env.SALT, 64).toString('hex') // Hash the password with the salt
  return { salt: process.env.SALT, hash }
}

function verifyCookie(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    return decoded
  } catch (err) {
    console.error('Error verifying cookie:', err)
    return null
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!SECRET_KEY) {
    return res
      .status(500)
      .json({ error: 'Internal server error. Contact admin to troubleshoot.' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    // Verify admin rights from cookie
    const session = req.cookies.session
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = await verifyCookie(session)
    if (!decoded) {
      return res
        .status(403)
        .json({ error: 'Forbidden - Admin rights required' })
    }

    const { mobile, password, name, isAdmin = false } = req.body

    if (!mobile || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const client = await clientPromise
    const db = client.db('splitwiser')
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ mobile })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = {
      mobile,
      password: hashedPassword,
      name,
      numRetries: 0,
      isAdmin,
      createdAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)
    const created = await usersCollection.findOne({ _id: result.insertedId })

    // Remove password from response
    if (created) {
      return res.status(201).json({
        message: 'User created successfully',
        user: {
          id: created._id,
          name: created.name,
        },
      })
    } else {
      throw new Error('Error creating user')
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
